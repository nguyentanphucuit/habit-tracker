import {
  HabitWithChecks,
  HabitStats,
  Theme,
  Settings,
  HabitCheck,
} from "@/types/habit";

// Default timezone functions (must be defined first)
export const DEFAULT_TIMEZONE = {
  // Get current time in Vietnam timezone
  getCurrentTime: (): Date => {
    const now = new Date();
    // Vietnam is UTC+7
    return new Date(now.getTime() + 7 * 60 * 60 * 1000);
  },

  // Convert UTC date to Vietnam timezone
  fromUTC: (utcDate: Date): Date => {
    return new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
  },

  // Convert Vietnam timezone to UTC
  toUTC: (vietnamDate: Date): Date => {
    return new Date(vietnamDate.getTime() - 7 * 60 * 60 * 1000);
  },

  // Format date in Vietnam timezone
  format: (
    date: Date | string,
    formatString: string = "yyyy-MM-dd HH:mm:ss"
  ): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const vietnamTime = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000);

    // Simple formatting for now (you can use date-fns if needed)
    const year = vietnamTime.getFullYear();
    const month = String(vietnamTime.getMonth() + 1).padStart(2, "0");
    const day = String(vietnamTime.getDate()).padStart(2, "0");
    const hours = String(vietnamTime.getHours()).padStart(2, "0");
    const minutes = String(vietnamTime.getMinutes()).padStart(2, "0");
    const seconds = String(vietnamTime.getSeconds()).padStart(2, "0");

    return formatString
      .replace("yyyy", String(year))
      .replace("MM", month)
      .replace("dd", day)
      .replace("HH", hours)
      .replace("mm", minutes)
      .replace("ss", seconds);
  },
} as const;

// Default user configuration
export const DEFAULT_USER = {
  id: "cmecsndd10000lx0ttdei1i9a",
  email: "default@habit-tracker.com",
  displayName: "Default User",
} as const;

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
  checks: [],
  currentStreak: 0,
  bestStreak: 0,
  completionRate: 0,
};

// Default habit stats for new users (constant object)
export const DEFAULT_HABIT_STATS: HabitStats = {
  id: "default",
  userid: DEFAULT_USER.id,
  date: new Date().toISOString().split("T")[0],
  totalHabits: 0,
  sevenDayRate: 0,
  bestStreak: 0,
  bestDay: null,
  worstDay: null,
  lastUpdated: DEFAULT_TIMEZONE.getCurrentTime(),
};

export const DEFAULT_STATS_DATA = {
  totalHabits: 0,
  sevenDayRate: 0,
  bestStreak: 0,
  bestDay: null,
  worstDay: null,
  lastUpdated: DEFAULT_TIMEZONE.getCurrentTime(),
} as const;

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

// Default habit settings
export const DEFAULT_HABIT_SETTINGS = {
  color: "#3b82f6",
  emoji: "📝",
  active: true,
  startDate: "",
} as const;

// Default progress values
export const DEFAULT_PROGRESS_VALUES = {
  currentProgress: 0,
  isCompleted: false,
} as const;

// Default timezone settings (Vietnam)
export const DEFAULT_TIMEZONE_SETTINGS = {
  name: "Asia/Ho_Chi_Minh",
  offset: 7, // GMT+7
  abbreviation: "ICT",
  utcOffset: "+07:00",
} as const;

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
