import { startOfDay, endOfDay, startOfWeek, addDays, format } from "date-fns";

// Asia/Ho_Chi_Minh timezone offset (+07:00)
const TIMEZONE_OFFSET = 7 * 60; // minutes

export function adjustToTimezone(date: Date): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + TIMEZONE_OFFSET * 60000);
}

export function todayRange() {
  const now = new Date();
  const today = adjustToTimezone(now);
  return {
    start: startOfDay(today),
    end: endOfDay(today),
  };
}

export function weekRange() {
  const now = new Date();
  const today = adjustToTimezone(now);
  const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday = 1
  return {
    start,
    end: addDays(start, 7),
  };
}

export function formatTime(date: Date): string {
  return format(date, "HH:mm");
}
