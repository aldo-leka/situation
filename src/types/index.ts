export interface ProjectConfig {
  name: string;
  emoji: string;
  description: string;
  type?: "standard" | "daily-habit";
  trello?: {
    boardId: string;
    listsToShow: string[];
  };
  github?: {
    repo: string; // "owner/repo"
  };
}

export interface TrelloCard {
  id: string;
  name: string;
  dateLastActivity: string;
  labels: { id: string; name: string; color: string }[];
  shortUrl: string;
}

export interface TrelloList {
  id: string;
  name: string;
  cards: TrelloCard[];
}

export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  author: string;
  url: string;
}

export interface ProjectStatus {
  name: string;
  emoji: string;
  description: string;
  type: "standard" | "daily-habit";
  github?: {
    lastCommit: GitHubCommit | null;
    error?: string;
  };
  trello?: {
    lists: TrelloList[];
    error?: string;
  };
  lastActivity: string | null;
}

export interface StatusResponse {
  projects: ProjectStatus[];
  fetchedAt: string;
}
