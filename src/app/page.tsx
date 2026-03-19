"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectCard } from "@/components/project-card";
import { LeetCodeCard } from "@/components/leetcode-card";
import type { StatusResponse, ProjectStatus } from "@/types";

export default function Home() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusTask, setFocusTask] = useState<{
    project: string;
    emoji: string;
    list: string;
    card: string;
    url: string;
  } | null>(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: StatusResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const pickFocusTask = () => {
    if (!data) return;
    const inProgressTasks: {
      project: string;
      emoji: string;
      list: string;
      card: string;
      url: string;
    }[] = [];

    for (const project of data.projects) {
      if (project.trello?.lists) {
        for (const list of project.trello.lists) {
          if (
            list.name.toLowerCase().includes("progress") ||
            list.name.toLowerCase().includes("next")
          ) {
            for (const card of list.cards) {
              inProgressTasks.push({
                project: project.name,
                emoji: project.emoji,
                list: list.name,
                card: card.name,
                url: card.shortUrl,
              });
            }
          }
        }
      }
    }

    if (inProgressTasks.length === 0) return;
    const pick =
      inProgressTasks[Math.floor(Math.random() * inProgressTasks.length)];
    setFocusTask(pick);
    setFocusOpen(true);
  };

  const standardProjects =
    data?.projects.filter((p) => p.type !== "daily-habit") ?? [];
  const hasInProgress = data?.projects.some((p) =>
    p.trello?.lists.some(
      (l) =>
        (l.name.toLowerCase().includes("progress") ||
          l.name.toLowerCase().includes("next")) &&
        l.cards.length > 0
    )
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Situation</h1>
            <p className="text-sm text-zinc-500">
              {now.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              &middot;{" "}
              {now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasInProgress && (
              <Button
                variant="outline"
                size="sm"
                onClick={pickFocusTask}
                className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
              >
                🎯 Focus
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={loading}
              className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
            >
              {loading ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="opacity-25"
                  />
                  <path
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    fill="currentColor"
                    className="opacity-75"
                  />
                </svg>
              ) : (
                "↻"
              )}{" "}
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-lg bg-red-950/50 border border-red-900 p-3 text-sm text-red-400">
            Failed to load data: {error}
          </div>
        </div>
      )}

      {/* Project grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading && !data
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProjectCard
                  key={i}
                  project={{} as ProjectStatus}
                  loading={true}
                />
              ))
            : standardProjects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
          <LeetCodeCard />
        </div>

        {data && (
          <p className="text-xs text-zinc-600 mt-6 text-center">
            Last fetched:{" "}
            {new Date(data.fetchedAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <a
            href="https://aldo.al"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            aldo.al
          </a>
        </div>
      </footer>

      {/* Focus Mode Dialog */}
      <Dialog open={focusOpen} onOpenChange={setFocusOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-50">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              🎯 Focus on this
            </DialogTitle>
          </DialogHeader>
          {focusTask && (
            <div className="text-center py-4 space-y-3">
              <p className="text-3xl">{focusTask.emoji}</p>
              <p className="text-sm text-zinc-400 font-medium">
                {focusTask.project} &middot; {focusTask.list}
              </p>
              <p className="text-lg font-semibold">{focusTask.card}</p>
              <a
                href={focusTask.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-emerald-400 hover:text-emerald-300 transition-colors mt-2"
              >
                Open in Trello →
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
