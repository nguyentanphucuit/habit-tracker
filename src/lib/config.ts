// Application configuration constants
export const APP_CONFIG = {
  // App settings
  APP_NAME: "Habit Tracker",
  APP_VERSION: "1.0.0",
  APP_DESCRIPTION: "Track your daily, weekly, and monthly habits to build a better routine",
  
  // API settings
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  API_TIMEOUT: 30000, // 30 seconds
  
  // Database settings
  DB: {
    MAX_CONNECTIONS: 10,
    CONNECTION_TIMEOUT: 20000,
  },
  
  // Feature flags
  FEATURES: {
    HEALTH_INTEGRATION: true,
    APPLE_HEALTH: true,
    STATS_ANALYTICS: true,
    WEEKLY_MONTHLY_HABITS: true,
    CUSTOM_HABIT_COLORS: true,
    HABIT_STREAKS: true,
    PROGRESS_HISTORY: true,
  },
  
  // UI settings
  UI: {
    THEME: "system", // system, light, dark
    ANIMATIONS: true,
    SOUND_EFFECTS: false,
    NOTIFICATIONS: true,
  },
  
  // Performance settings
  PERFORMANCE: {
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    DEBOUNCE_DELAY: 300, // 300ms
    THROTTLE_DELAY: 1000, // 1 second
  },
} as const;

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof APP_CONFIG.FEATURES): boolean {
  return APP_CONFIG.FEATURES[feature];
}

// Helper function to get app setting
export function getAppSetting<T extends keyof typeof APP_CONFIG>(key: T): typeof APP_CONFIG[T] {
  return APP_CONFIG[key];
}
