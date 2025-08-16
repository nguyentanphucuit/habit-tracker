import { format, isToday } from "date-fns";
import { HabitWithChecks, HabitStats, HabitCheck } from "@/types/habit";
import { getTodayString } from "./time";

export function getToday(): string {
  return getTodayString();
}

export function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return format(yesterday, "yyyy-MM-dd");
}

export function isDateEligible(
  habit: HabitWithChecks,
  dateStr: string
): boolean {
  const date = new Date(dateStr);

  if (habit.frequency === "daily") {
    return true;
  }

  if (habit.frequency === "weekly" && habit.customDays) {
    const dayOfWeek = date.getDay();
    return habit.customDays.includes(dayOfWeek);
  }

  if (habit.frequency === "monthly") {
    return isToday(date);
  }

  return false;
}

export function calculateStreak(habit: HabitWithChecks, checks: HabitCheck[]) {
  let current = 0;
  let best = 0;
  let running = 0;

  const sortedChecks = checks
    .filter((check) => check.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const check of sortedChecks) {
    if (check.completed) {
      running++;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  }

  current = running;
  return { current, best };
}

export function calculateCompletionRate(
  habit: HabitWithChecks,
  checks: HabitCheck[],
  days: number = 30
) {
  const recentChecks = checks.filter((check) => {
    const checkDate = new Date(check.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return checkDate >= cutoffDate;
  });

  const completed = recentChecks.filter((check) => check.completed).length;
  return recentChecks.length > 0
    ? Math.round((completed / recentChecks.length) * 100)
    : 0;
}

export function createDefaultHabitStats(userId: string): HabitStats {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return {
    id: `stats-${userId}`,
    userid: userId,
    date: getTodayString(),
    totalHabits: 0,
    sevenDayRate: 0,
    bestStreak: 0,
    bestDay: null,
    worstDay: null,
    lastUpdated: new Date(),
  };
}

export function calculateHabitStats(
  habit: HabitWithChecks,
  targetDate: Date = new Date()
): HabitStats {
  const { best } = calculateStreak(habit, habit.checks);
  const completionRate = calculateCompletionRate(habit, habit.checks);

  return {
    id: `stats-${habit.id}`,
    userid: habit.id,
    date: getTodayString(),
    totalHabits: 1,
    sevenDayRate: completionRate,
    bestStreak: best,
    bestDay: null,
    worstDay: null,
    lastUpdated: new Date(),
  };
}

export function getHabitStats(
  habits: HabitWithChecks[],
  checks: HabitCheck[]
): HabitStats {
  const totalHabits = habits.length;

  if (totalHabits === 0) {
    return createDefaultHabitStats("default");
  }

  // Calculate completion rate for the last 7 days
  const sevenDayRate = calculateCompletionRate(habits[0], checks, 7);

  // Calculate best streak across all habits
  let bestStreak = 0;
  for (const habit of habits) {
    const habitChecks = checks.filter((check) => check.habitId === habit.id);
    const { best } = calculateStreak(habit, habitChecks);
    bestStreak = Math.max(bestStreak, best);
  }

  return {
    id: "overall-stats",
    userid: "default",
    date: getTodayString(),
    totalHabits,
    sevenDayRate,
    bestStreak,
    bestDay: null,
    worstDay: null,
    lastUpdated: new Date(),
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getRandomColor(): string {
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#84cc16",
    "#14b8a6",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getRandomEmoji(): string {
  const emojis = ["🎯", "💪", "📚", "🏃‍♂️", "🧘‍♀️", "🥗", "💧", "😴", "🎨", "🎵"];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

export function getEmojiSuggestions(): string[] {
  return [
    "🎯",
    "💪",
    "📚",
    "🏃‍♂️",
    "🧘‍♀️",
    "🥗",
    "💧",
    "😴",
    "🎨",
    "🎵",
    "🧠",
    "🏋️‍♂️",
    "🚴‍♂️",
    "🏊‍♂️",
    "🎭",
    "📖",
    "✍️",
    "🎪",
    "🎬",
    "🎮",
  ];
}
