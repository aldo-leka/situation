import { NextResponse } from "next/server";
import { projects } from "@/config/projects";
import type {
  ProjectStatus,
  StatusResponse,
  TrelloList,
  GitHubCommit,
} from "@/types";

// In-memory cache
let cache: { data: StatusResponse; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchTrelloLists(
  boardId: string,
  listsToShow: string[]
): Promise<{ lists: TrelloList[]; error?: string }> {
  const apiKey = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;

  if (!apiKey || !token) {
    return { lists: [], error: "Trello credentials not configured" };
  }

  try {
    const url = `https://api.trello.com/1/boards/${boardId}/lists?cards=open&fields=name&card_fields=name,dateLastActivity,labels,shortUrl&key=${apiKey}&token=${token}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (!res.ok) {
      return { lists: [], error: `Trello API error: ${res.status}` };
    }

    const data = await res.json();
    const filtered = data
      .filter((list: TrelloList) => listsToShow.includes(list.name))
      .map((list: TrelloList) => ({
        id: list.id,
        name: list.name,
        cards: list.cards || [],
      }));

    // Sort lists in the order specified by listsToShow
    filtered.sort(
      (a: TrelloList, b: TrelloList) =>
        listsToShow.indexOf(a.name) - listsToShow.indexOf(b.name)
    );

    return { lists: filtered };
  } catch (err) {
    return {
      lists: [],
      error: err instanceof Error ? err.message : "Failed to fetch Trello data",
    };
  }
}

async function fetchGitHubCommit(
  repo: string
): Promise<{ lastCommit: GitHubCommit | null; error?: string }> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    const ghToken = process.env.GITHUB_TOKEN;
    if (ghToken) {
      headers.Authorization = `Bearer ${ghToken}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${repo}/commits?per_page=1`,
      { headers, signal: AbortSignal.timeout(10000) }
    );

    if (!res.ok) {
      return { lastCommit: null, error: `GitHub API error: ${res.status}` };
    }

    const data = await res.json();
    if (!data.length) {
      return { lastCommit: null };
    }

    const commit = data[0];
    return {
      lastCommit: {
        sha: commit.sha,
        message: commit.commit.message.split("\n")[0],
        date: commit.commit.author.date,
        author: commit.commit.author.name,
        url: commit.html_url,
      },
    };
  } catch (err) {
    return {
      lastCommit: null,
      error: err instanceof Error ? err.message : "Failed to fetch GitHub data",
    };
  }
}

async function fetchAllStatuses(): Promise<StatusResponse> {
  const projectStatuses: ProjectStatus[] = await Promise.all(
    projects.map(async (project) => {
      const status: ProjectStatus = {
        name: project.name,
        emoji: project.emoji,
        description: project.description,
        type: project.type || "standard",
        lastActivity: null,
      };

      const timestamps: string[] = [];

      // Fetch GitHub data
      if (project.github) {
        const ghResult = await fetchGitHubCommit(project.github.repo);
        status.github = ghResult;
        if (ghResult.lastCommit?.date) {
          timestamps.push(ghResult.lastCommit.date);
        }
      }

      // Fetch Trello data
      if (project.trello) {
        const trelloResult = await fetchTrelloLists(
          project.trello.boardId,
          project.trello.listsToShow
        );
        status.trello = trelloResult;
        // Get most recent card activity
        for (const list of trelloResult.lists) {
          for (const card of list.cards) {
            if (card.dateLastActivity) {
              timestamps.push(card.dateLastActivity);
            }
          }
        }
      }

      // Determine last activity across all sources
      if (timestamps.length > 0) {
        timestamps.sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        );
        status.lastActivity = timestamps[0];
      }

      return status;
    })
  );

  return {
    projects: projectStatuses,
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET() {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  const data = await fetchAllStatuses();
  cache = { data, timestamp: Date.now() };

  return NextResponse.json(data);
}
