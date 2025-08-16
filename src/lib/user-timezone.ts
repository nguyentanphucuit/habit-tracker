// User timezone management
export interface UserTimezone {
  id: string;
  name: string;
  offset: number; // minutes from UTC
  abbreviation: string;
  utcOffset: string;
  isDefault: boolean;
}

// Available timezones
export const USER_TIMEZONES: UserTimezone[] = [
  {
    id: "vietnam",
    name: "Vietnam (ICT)",
    offset: 7 * 60, // UTC+7
    abbreviation: "ICT",
    utcOffset: "+07:00",
    isDefault: true,
  },
  {
    id: "us_eastern",
    name: "US Eastern (EST/EDT)",
    offset: -5 * 60, // UTC-5 (EST)
    abbreviation: "EST",
    utcOffset: "-05:00",
    isDefault: false,
  },
  {
    id: "us_central",
    name: "US Central (CST/CDT)",
    offset: -6 * 60, // UTC-6 (CST)
    abbreviation: "CST",
    utcOffset: "-06:00",
    isDefault: false,
  },
  {
    id: "us_mountain",
    name: "US Mountain (MST/MDT)",
    offset: -7 * 60, // UTC-7 (MST)
    abbreviation: "MST",
    utcOffset: "-07:00",
    isDefault: false,
  },
  {
    id: "us_pacific",
    name: "US Pacific (PST/PDT)",
    offset: -8 * 60, // UTC-8 (PST)
    abbreviation: "PST",
    utcOffset: "-08:00",
    isDefault: false,
  },
];

// Get default timezone (Vietnamese)
export function getDefaultTimezone(): UserTimezone {
  return USER_TIMEZONES.find((tz) => tz.isDefault) || USER_TIMEZONES[0];
}

// Get timezone by ID
export function getTimezoneById(id: string): UserTimezone | undefined {
  return USER_TIMEZONES.find((tz) => tz.id === id);
}

// Get current time in specified timezone
export function getCurrentTimeInTimezone(timezone: UserTimezone): Date {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utcTime + timezone.offset * 60 * 1000);
}

// Convert date to specified timezone
export function convertDateToTimezone(
  date: Date,
  timezone: UserTimezone
): Date {
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  return new Date(utcTime + timezone.offset * 60 * 1000);
}

// Convert date from specified timezone to local
export function convertDateFromTimezone(
  date: Date,
  timezone: UserTimezone
): Date {
  const utcTime = date.getTime() - timezone.offset * 60 * 1000;
  return new Date(utcTime - new Date().getTimezoneOffset() * 60 * 1000);
}

// Format date string for timezone (YYYY-MM-DD)
export function formatDateForTimezone(
  date: Date,
  timezone: UserTimezone
): string {
  const tzDate = convertDateToTimezone(date, timezone);
  const year = tzDate.getFullYear();
  const month = String(tzDate.getMonth() + 1).padStart(2, "0");
  const day = String(tzDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get today's date string in specified timezone
export function getTodayStringInTimezone(timezone: UserTimezone): string {
  return formatDateForTimezone(new Date(), timezone);
}

// Convert timezone-aware date to UTC string for API calls
export function getDateStringInUTC(date: Date): string {
  // Create a UTC date string (YYYY-MM-DD) that represents the same calendar date
  // regardless of the user's timezone
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  return utcDate.toISOString().split("T")[0];
}

// Get start of day in specified timezone
export function getStartOfDayInTimezone(
  date: Date,
  timezone: UserTimezone
): Date {
  const tzDate = convertDateToTimezone(date, timezone);
  tzDate.setHours(0, 0, 0, 0);
  return convertDateFromTimezone(tzDate, timezone);
}

// Get end of day in specified timezone
export function getEndOfDayInTimezone(
  date: Date,
  timezone: UserTimezone
): Date {
  const tzDate = convertDateToTimezone(date, timezone);
  tzDate.setHours(23, 59, 59, 999);
  return convertDateFromTimezone(tzDate, timezone);
}
