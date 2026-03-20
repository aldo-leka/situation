"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { LeetCodeCard } from "@/components/leetcode-card";
import type { StatusResponse, ProjectStatus } from "@/types";

export default function Home() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const standardProjects =
    data?.projects.filter((p) => p.type !== "daily-habit") ?? [];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="px-2 py-1.5 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            {now.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}{" "}
            &middot;{" "}
            {now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={loading}
            className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
          >
            {loading ? (
              <svg
                className="w-3 h-3 animate-spin"
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
              <span className="text-xs">↻</span>
            )}
          </Button>
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
      <main className="px-1.5 py-1.5">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
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

      </main>
    </div>
  );
}
