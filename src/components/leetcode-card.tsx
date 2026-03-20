"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

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

  const fetchStreak = useCallback(async () => {
    try {
      const res = await fetch("/api/streak");
      if (res.ok) {
        const { days } = await res.json();
        setCompletedDays(new Set(days));
      }
    } catch {
      // Fall back to localStorage
      const stored = localStorage.getItem("situation-leetcode-days");
      if (stored) {
        try { setCompletedDays(new Set(JSON.parse(stored))); } catch { /* ignore */ }
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchStreak();
  }, [fetchStreak]);

  const toggleDay = async (day: string) => {
    const has = completedDays.has(day);
    // Optimistic update
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (has) next.delete(day); else next.add(day);
      return next;
    });

    try {
      const res = await fetch("/api/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, action: has ? "remove" : "add" }),
      });
      if (res.ok) {
        const { days } = await res.json();
        setCompletedDays(new Set(days));
      }
    } catch {
      // Revert on failure
      setCompletedDays((prev) => {
        const next = new Set(prev);
        if (has) next.add(day); else next.delete(day);
        return next;
      });
    }
  };

  const days = getLast84Days();
  const streak = getStreak(completedDays);
  const todayDone = completedDays.has(getTodayStr());

  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  if (!mounted) {
    return (
      <Card className="border-0 aspect-square py-2 gap-2">
        <CardHeader className="px-2.5">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <span>💻</span>
            <span>LeetCode</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2.5">
          <div className="h-16 animate-pulse bg-zinc-800 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 aspect-square py-2 gap-2 hover:ring-zinc-700 transition-shadow">
      <CardHeader className="px-2.5 shrink-0">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5">
            <span>💻</span>
            <span>LeetCode</span>
          </span>
          <span className="text-[10px] font-medium">
            {streak > 0 ? (
              <span className="text-emerald-400">🔥 {streak}d</span>
            ) : (
              <span className="text-zinc-500">No streak</span>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2.5 flex-1 overflow-y-auto min-h-0">
        <div className="flex gap-[2px] overflow-x-auto pb-0.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((day) => {
                const done = completedDays.has(day);
                const isToday = day === getTodayStr();
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    title={day}
                    className={`w-2.5 h-2.5 rounded-sm transition-colors ${
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
        {!todayDone && (
          <button
            onClick={() => toggleDay(getTodayStr())}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors mt-1"
          >
            ✓ Mark today
          </button>
        )}
      </CardContent>
    </Card>
  );
}
