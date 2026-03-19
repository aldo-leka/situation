"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ProjectStatus } from "@/types";

interface FocusModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectStatus[];
}

interface FocusTask {
  projectName: string;
  projectEmoji: string;
  taskName: string;
  taskUrl?: string;
  source: "trello" | "github";
}

export function FocusModeDialog({
  open,
  onOpenChange,
  projects,
}: FocusModeDialogProps) {
  const [focusTask, setFocusTask] = useState<FocusTask | null>(null);

  useEffect(() => {
    if (open) {
      pickRandomTask();
    }
  }, [open, projects]);

  const pickRandomTask = () => {
    const tasks: FocusTask[] = [];

    // Collect all "In Progress" tasks from Trello
    for (const project of projects) {
      if (project.trello?.lists) {
        for (const list of project.trello.lists) {
          if (
            list.name.toLowerCase().includes("in progress") ||
            list.name.includes("🔨")
          ) {
            for (const card of list.cards) {
              tasks.push({
                projectName: project.name,
                projectEmoji: project.emoji,
                taskName: card.name,
                taskUrl: card.shortUrl,
                source: "trello",
              });
            }
          }
        }
      }
    }

    // If no tasks found, pick latest commit instead
    if (tasks.length === 0) {
      for (const project of projects) {
        if (project.github?.lastCommit) {
          tasks.push({
            projectName: project.name,
            projectEmoji: project.emoji,
            taskName: project.github.lastCommit.message,
            taskUrl: project.github.lastCommit.url,
            source: "github",
          });
        }
      }
    }

    if (tasks.length > 0) {
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
      setFocusTask(randomTask);
    } else {
      setFocusTask(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">🎯 Focus Mode</DialogTitle>
          <DialogDescription>
            Here's a random task to work on right now
          </DialogDescription>
        </DialogHeader>
        {focusTask ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-2xl">{focusTask.projectEmoji}</span>
              <span className="font-medium">{focusTask.projectName}</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-lg font-medium leading-relaxed">
                {focusTask.taskName}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={pickRandomTask} variant="outline" className="flex-1">
                Pick Another
              </Button>
              {focusTask.taskUrl && (
                <a
                  href={focusTask.taskUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full">
                    Open Task
                  </Button>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks found.</p>
            <p className="text-sm mt-2">
              Add some tasks to your Trello boards to get started!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
