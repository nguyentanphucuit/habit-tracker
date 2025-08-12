import { Habit, HabitCheck, Settings } from "@/types/habit";

const STORAGE_KEYS = {
  HABITS: "habit-tracker-habits",
  CHECKS: "habit-tracker-checks",
  SETTINGS: "habit-tracker-settings",
};

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Debounced write function
let writeTimeout: NodeJS.Timeout;
const debouncedWrite = (key: string, data: unknown) => {
  if (!isBrowser) return;

  clearTimeout(writeTimeout);
  writeTimeout = setTimeout(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, 300);
};

export const storage = {
  // Habits
  getHabits: (): Habit[] => {
    if (!isBrowser) return [];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load habits from localStorage:", error);
      return [];
    }
  },

  saveHabits: (habits: Habit[]): void => {
    debouncedWrite(STORAGE_KEYS.HABITS, habits);
  },

  // Checks
  getChecks: (): HabitCheck[] => {
    if (!isBrowser) return [];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHECKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load checks from localStorage:", error);
      return [];
    }
  },

  saveChecks: (checks: HabitCheck[]): void => {
    debouncedWrite(STORAGE_KEYS.CHECKS, checks);
  },

  // Settings
  getSettings: (): Settings => {
    if (!isBrowser) {
      return {
        theme: { mode: "light", system: true },
        language: "en",
        notifications: false,
      };
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data
        ? JSON.parse(data)
        : {
            theme: { mode: "light", system: true },
            language: "en",
            notifications: false,
          };
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
      return {
        theme: { mode: "light", system: true },
        language: "en",
        notifications: false,
      };
    }
  },

  saveSettings: (settings: Settings): void => {
    debouncedWrite(STORAGE_KEYS.SETTINGS, settings);
  },

  // Export/Import
  exportData: (): string => {
    if (!isBrowser) return "";

    try {
      const data = {
        habits: storage.getHabits(),
        checks: storage.getChecks(),
        settings: storage.getSettings(),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Failed to export data:", error);
      return "";
    }
  },

  importData: (jsonData: string): boolean => {
    if (!isBrowser) return false;

    try {
      const data = JSON.parse(jsonData);

      if (data.habits && Array.isArray(data.habits)) {
        storage.saveHabits(data.habits);
      }

      if (data.checks && Array.isArray(data.checks)) {
        storage.saveChecks(data.checks);
      }

      if (data.settings && typeof data.settings === "object") {
        storage.saveSettings(data.settings);
      }

      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  },

  // Clear all data
  clearAll: (): void => {
    if (!isBrowser) return;

    try {
      localStorage.removeItem(STORAGE_KEYS.HABITS);
      localStorage.removeItem(STORAGE_KEYS.CHECKS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  },
};
