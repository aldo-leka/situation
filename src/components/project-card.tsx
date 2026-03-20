"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { relativeTime } from "@/lib/time";
import type { ProjectStatus } from "@/types";

interface ProjectCardProps {
  project: ProjectStatus;
  loading?: boolean;
}

export function ProjectCard({ project, loading }: ProjectCardProps) {
  if (loading) {
    return (
      <Card className="border-0 aspect-square">
        <CardHeader className="shrink-0">
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-56" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 flex-1 min-h-0">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 transition-shadow hover:shadow-lg aspect-square">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span>{project.emoji}</span>
          <span>{project.name}</span>
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>{project.description}</span>
          {project.lastActivity && (
            <Badge variant="secondary" className="text-xs shrink-0 ml-2">
              {relativeTime(project.lastActivity)}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto">
        {/* GitHub section */}
        {project.github && (
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span>GitHub</span>
            </div>
            {project.github.error ? (
              <p className="text-xs text-destructive">
                {project.github.error}
              </p>
            ) : project.github.lastCommit ? (
              <a
                href={project.github.lastCommit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group/commit"
              >
                <p className="text-sm truncate group-hover/commit:text-primary transition-colors">
                  {project.github.lastCommit.message}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {project.github.lastCommit.author} &middot;{" "}
                  {relativeTime(project.github.lastCommit.date)}
                </p>
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">No commits found</p>
            )}
          </div>
        )}

        {/* Trello section */}
        {project.trello && (
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44h-4.44c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z" />
              </svg>
              <span>Trello</span>
            </div>
            {project.trello.error ? (
              <p className="text-xs text-destructive">
                {project.trello.error}
              </p>
            ) : project.trello.lists.length === 0 ? (
              <p className="text-xs text-muted-foreground">No cards found</p>
            ) : (
              <div className="space-y-2">
                {project.trello.lists.map((list) => (
                  <div key={list.id}>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {list.name}
                      <span className="ml-1 text-muted-foreground/60">
                        ({list.cards.length})
                      </span>
                    </p>
                    <ul className="space-y-0.5">
                      {list.cards.map((card) => (
                        <li key={card.id}>
                          <a
                            href={card.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors py-0.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                            <span className="truncate">{card.name}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Placeholder for projects without Trello */}
        {!project.trello && !project.github && project.type !== "daily-habit" && (
          <p className="text-sm text-muted-foreground italic">
            No integrations configured yet
          </p>
        )}

        {/* No Trello placeholder */}
        {!project.trello && project.github && project.type !== "daily-habit" && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44h-4.44c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z" />
            </svg>
            <span className="italic">No Trello board configured</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
