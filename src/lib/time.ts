import {
  startOfDay,
  endOfDay,
  startOfWeek,
  addDays,
  format,
  subDays,
} from "date-fns";

// Vietnam timezone: Asia/Ho_Chi_Minh (UTC+7)
const VIETNAM_TIMEZONE_OFFSET = 7 * 60; // minutes

/**
 * Get current date/time in Vietnam timezone
 */
export function getVietnamTime(): Date {
  const now = new Date();
  return adjustToVietnamTimezone(now);
}

/**
 * Adjust a date to Vietnam timezone
 */
export function adjustToVietnamTimezone(date: Date): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + VIETNAM_TIMEZONE_OFFSET * 60000);
}

/**
 * Get today's date range in Vietnam timezone
 */
export function todayRange() {
  const today = getVietnamTime();
  return {
    start: startOfDay(today),
    end: endOfDay(today),
  };
}

/**
 * Get this week's date range in Vietnam timezone (Monday start)
 */
export function weekRange() {
  const today = getVietnamTime();
  const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday = 1
  return {
    start,
    end: addDays(start, 7),
  };
}

/**
 * Get date range for last N days in Vietnam timezone
 */
export function lastNDaysRange(days: number) {
  const today = getVietnamTime();
  const startDate = startOfDay(subDays(today, days - 1));
  const endDate = endOfDay(today);
  return { start: startDate, end: endDate };
}

/**
 * Format time in Vietnam timezone
 */
export function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

/**
 * Format date in Vietnam timezone
 */
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get current date string in Vietnam timezone
 */
export function getTodayString(): string {
  return formatDate(getVietnamTime());
}

/**
 * Check if a date is today in Vietnam timezone
 */
export function isToday(date: Date): boolean {
  const today = getVietnamTime();
  return formatDate(date) === formatDate(today);
}

/**
 * Get start of day in Vietnam timezone
 */
export function startOfDayVietnam(date: Date): Date {
  return startOfDay(adjustToVietnamTimezone(date));
}

/**
 * Get end of day in Vietnam timezone
 */
export function endOfDayVietnam(date: Date): Date {
  return endOfDay(adjustToVietnamTimezone(date));
}
