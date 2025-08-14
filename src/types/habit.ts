export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  frequency: "daily" | "weekly" | "monthly";
  customDays?: number[]; // 0-6 for Sunday-Saturday
  startDate: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  targetValue: number;
  targetType: string;
}

export interface HabitCheck {
  habitId: string;
  date: string; // ISO date string
  completed: boolean;
  timestamp: string;
}

export interface HabitWithChecks extends Habit {
  checks: HabitCheck[];
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
}

export interface HabitStats {
  totalHabits: number;
  completedToday: number;
  completionRate7Days: number;
  completionRate30Days: number;
  bestStreak: number;
}

export interface Theme {
  mode: "light" | "dark";
  system: boolean;
}

export interface Settings {
  theme: Theme;
  language: "en" | "vi";
  notifications: boolean;
}

export type FrequencyOption = {
  value: "daily" | "weekly" | "monthly";
  label: string;
  description: string;
};

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: "monthly",
    label: "Monthly",
    description: "Once per month",
  },
  {
    value: "daily",
    label: "Daily",
    description: "Every day",
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "Select specific days",
  },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sun", short: "S" },
  { value: 1, label: "Mon", short: "M" },
  { value: 2, label: "Tue", short: "M" },
  { value: 3, label: "Wed", short: "W" },
  { value: 4, label: "Thu", short: "T" },
  { value: 5, label: "Fri", short: "F" },
  { value: 6, label: "Sat", short: "S" },
];

export const HABIT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#84cc16", // lime
  "#14b8a6", // teal
];
