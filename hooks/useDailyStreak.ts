import { useMemo } from "react";

import { useCurrentDay } from "@/hooks/useCurrentDay";
import type { DashboardTodo } from "@/types/learning";

export type DailyStreakState = "active" | "at_risk" | "empty";

export interface DailyStreak {
  count: number;
  state: DailyStreakState;
  completedToday: boolean;
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function calculateDailyStreak(
  todos: DashboardTodo[],
  reference = new Date(),
): DailyStreak {
  const completedDays = new Set(
    todos
      .filter((todo) => todo.is_completed && todo.completed_at)
      .map((todo) => localDateKey(new Date(todo.completed_at as string))),
  );
  const todayKey = localDateKey(reference);
  const yesterday = addDays(reference, -1);
  const yesterdayKey = localDateKey(yesterday);
  const completedToday = completedDays.has(todayKey);

  if (!completedToday && !completedDays.has(yesterdayKey)) {
    return { count: 0, state: "empty", completedToday: false };
  }

  let cursor = completedToday ? reference : yesterday;
  let count = 0;

  while (completedDays.has(localDateKey(cursor))) {
    count += 1;
    cursor = addDays(cursor, -1);
  }

  return {
    count,
    completedToday,
    state: completedToday ? "active" : "at_risk",
  };
}

export function useDailyStreak(todos: DashboardTodo[]): DailyStreak {
  useCurrentDay();
  return useMemo(() => calculateDailyStreak(todos), [todos]);
}
