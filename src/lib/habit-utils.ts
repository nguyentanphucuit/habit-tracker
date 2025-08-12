import { format, isToday } from "date-fns";
import { Habit, HabitCheck } from "@/types/habit";

export function getToday(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return format(yesterday, "yyyy-MM-dd");
}

export function isDateEligible(habit: Habit, dateStr: string): boolean {
  const date = new Date(dateStr);

  if (habit.frequency === "daily") {
    return true;
  }

  if (habit.frequency === "custom" && habit.customDays) {
    const dayOfWeek = date.getDay();
    return habit.customDays.includes(dayOfWeek);
  }

  if (habit.frequency === "today") {
    return isToday(date);
  }

  return false;
}

export function calculateStreak(habit: Habit, checks: HabitCheck[]) {
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
  habit: Habit,
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

export function getHabitStats(habits: Habit[], checks: HabitCheck[]) {
  const totalHabits = habits.length;
  const today = getToday();
  const completedToday = checks.filter(
    (check) => check.date === today && check.completed
  ).length;
  const completionRate7Days = calculateCompletionRate(
    habits[0] || ({} as Habit),
    checks,
    7
  );
  const completionRate30Days = calculateCompletionRate(
    habits[0] || ({} as Habit),
    checks,
    30
  );

  let bestStreak = 0;
  for (const habit of habits) {
    const habitChecks = checks.filter((check) => check.habitId === habit.id);
    const { best } = calculateStreak(habit, habitChecks);
    bestStreak = Math.max(bestStreak, best);
  }

  return {
    totalHabits,
    completedToday,
    completionRate7Days,
    completionRate30Days,
    bestStreak,
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
