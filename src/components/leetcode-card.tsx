"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const STORAGE_KEY = "situation-leetcode-days";

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function getLast84Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getStreak(completedDays: Set<string>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (completedDays.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function LeetCodeCard() {
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCompletedDays(new Set(JSON.parse(stored)));
      } catch {
        // ignore
      }
    }
  }, []);

  const toggleDay = (day: string) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const days = getLast84Days();
  const streak = getStreak(completedDays);
  const todayDone = completedDays.has(getTodayStr());

  // Group into weeks (columns of 7)
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  if (!mounted) {
    return (
      <Card className="border-0 aspect-square">
        <CardHeader className="shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>💻</span>
            <span>LeetCode</span>
          </CardTitle>
          <CardDescription>Daily coding practice</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="h-24 animate-pulse bg-zinc-800 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 transition-shadow hover:shadow-lg aspect-square">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span>💻</span>
          <span>LeetCode</span>
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Daily coding practice</span>
          <span className="text-xs font-medium">
            {streak > 0 ? (
              <span className="text-emerald-400">🔥 {streak} day streak</span>
            ) : (
              <span className="text-zinc-500">No streak</span>
            )}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="flex gap-[3px] overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => {
                const done = completedDays.has(day);
                const isToday = day === getTodayStr();
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    title={day}
                    className={`w-3 h-3 rounded-sm transition-colors ${
                      done
                        ? "bg-emerald-500 hover:bg-emerald-400"
                        : isToday
                        ? "bg-zinc-600 ring-1 ring-zinc-400 hover:bg-zinc-500"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Last 12 weeks</span>
          {!todayDone && (
            <button
              onClick={() => toggleDay(getTodayStr())}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              ✓ Mark today done
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
