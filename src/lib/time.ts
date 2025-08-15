import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
} from "date-fns";

// Vietnam timezone: Asia/Ho_Chi_Minh (UTC+7)
const VIETNAM_TIMEZONE_OFFSET = 7 * 60; // minutes

/**
 * Get current time in Vietnam timezone
 */
export function getVietnamTime(): Date {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utcTime + VIETNAM_TIMEZONE_OFFSET * 60 * 1000);
}

/**
 * Get today's date string in Vietnam timezone (YYYY-MM-DD)
 */
export function getTodayString(): string {
  const vietnamTime = getVietnamTime();
  return format(vietnamTime, "yyyy-MM-dd");
}

/**
 * Get start of day in Vietnam timezone
 */
export function startOfDayVietnam(date: Date = new Date()): Date {
  const vietnamTime = getVietnamTime();
  return startOfDay(vietnamTime);
}

/**
 * Get end of day in Vietnam timezone
 */
export function endOfDayVietnam(date: Date = new Date()): Date {
  const vietnamTime = getVietnamTime();
  return endOfDay(vietnamTime);
}

/**
 * Get yesterday's date string in Vietnam timezone
 */
export function getYesterdayString(): string {
  const yesterday = subDays(getVietnamTime(), 1);
  return format(yesterday, "yyyy-MM-dd");
}

/**
 * Get tomorrow's date string in Vietnam timezone
 */
export function getTomorrowString(): string {
  const tomorrow = addDays(getVietnamTime(), 1);
  return format(tomorrow, "yyyy-MM-dd");
}

/**
 * Check if a date is today in Vietnam timezone
 */
export function isTodayVietnam(date: Date): boolean {
  return isToday(date);
}

/**
 * Check if a date is yesterday in Vietnam timezone
 */
export function isYesterdayVietnam(date: Date): boolean {
  return isYesterday(date);
}

/**
 * Check if a date is this week in Vietnam timezone
 */
export function isThisWeekVietnam(date: Date): boolean {
  return isThisWeek(date);
}

/**
 * Check if a date is this month in Vietnam timezone
 */
export function isThisMonthVietnam(date: Date): boolean {
  return isThisMonth(date);
}

/**
 * Check if a date is this year in Vietnam timezone
 */
export function isThisYearVietnam(date: Date): boolean {
  return isThisYear(date);
}

/**
 * Format a date in Vietnam timezone for display
 * @param date - The date to format (can be Date object or ISO string)
 * @param formatString - The format string (default: "yyyy-MM-dd HH:mm:ss")
 * @returns Formatted date string in Vietnam timezone
 */
export function formatVietnamTime(
  date: Date | string,
  formatString: string = "yyyy-MM-dd HH:mm:ss"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Convert to Vietnam timezone
  const utcTime = dateObj.getTime() + dateObj.getTimezoneOffset() * 60 * 1000;
  const vietnamTime = new Date(utcTime + VIETNAM_TIMEZONE_OFFSET * 60 * 1000);

  return format(vietnamTime, formatString);
}

/**
 * Get current Vietnam time as a Date object
 * @returns Current time in Vietnam timezone
 */
export function getCurrentVietnamTime(): Date {
  return getVietnamTime();
}

/**
 * Format date for display (simple version)
 */
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Format time for display (simple version)
 */
export function formatTime(date: Date): string {
  return format(date, "HH:mm:ss");
}
