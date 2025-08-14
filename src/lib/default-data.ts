import {
  HabitWithChecks,
  HabitStats,
  Theme,
  Settings,
  HabitCheck,
} from "@/types/habit";

// Default empty habit (constant object)
export const DEFAULT_HABIT: HabitWithChecks = {
  id: "",
  name: "",
  emoji: "🎯",
  color: "#ef4444",
  frequency: "daily",
  startDate: new Date().toISOString().split("T")[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  targetValue: 1,
  targetType: "COUNT",
  currentProgress: 0,
  checks: [],
  currentStreak: 0,
  bestStreak: 0,
  completionRate: 0,
  isCompleted: false,
};

// Default habit stats for new users (constant object)
export const DEFAULT_HABIT_STATS: HabitStats = {
  totalHabits: 0,
  completedToday: 0,
  completionRate7Days: 0,
  completionRate30Days: 0,
  bestStreak: 0,
};

// Default theme settings (constant object)
export const DEFAULT_THEME: Theme = {
  mode: "light",
  system: true,
};

// Default user settings (constant object)
export const DEFAULT_SETTINGS: Settings = {
  theme: DEFAULT_THEME,
  language: "en",
  notifications: false,
};

// Default form data for adding new habits (constant object)
export const DEFAULT_HABIT_FORM_DATA = {
  name: "",
  emoji: "🎯",
  color: "#ef4444",
  frequency: "daily" as "daily" | "weekly" | "monthly",
  customDays: [] as number[],
  targetType: "COUNT" as string,
  targetValue: 1,
};

// Function for creating habit checks (needs to be a function due to dynamic parameters)
export const createDefaultHabitCheck = (
  habitId: string,
  date: string
): HabitCheck => ({
  habitId,
  date,
  completed: false,
  timestamp: new Date().toISOString(),
});

// Legacy function names for backward compatibility (deprecated)
export const createDefaultHabit = (): HabitWithChecks => DEFAULT_HABIT;
export const createDefaultHabitStats = (): HabitStats => DEFAULT_HABIT_STATS;
export const createDefaultTheme = (): Theme => DEFAULT_THEME;
export const createDefaultSettings = (): Settings => DEFAULT_SETTINGS;
export const createDefaultHabitFormData = () => DEFAULT_HABIT_FORM_DATA;
