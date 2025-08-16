import { NextRequest, NextResponse } from "next/server";
import {
  getProgressSummary,
  getHabitsProgressOnDate,
} from "@/lib/daily-progress-service";
import { DEFAULT_USER } from "@/lib/default-data";

// Helper function to create a date at start of day in UTC
function createStartOfDayDateUTC(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

// Helper function to parse date string and create Date object in UTC
function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  // Create date in UTC to match database storage
  return new Date(Date.UTC(year, month - 1, day));
}

// Helper function to get today's date in UTC
function getTodayDate(): Date {
  const today = new Date();
  // Create today's date in UTC to match database storage
  return new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
}

// Helper function to create success response
function createSuccessResponse(
  userId: string,
  date: Date,
  habitsData: Record<string, unknown>
) {
  return NextResponse.json({
    success: true,
    userId,
    date,
    habitsData,
  });
}

// Helper function to create date range response
function createDateRangeResponse(data: Record<string, unknown>[]) {
  return NextResponse.json({
    success: true,
    data: data.map((record) => ({
      date: record.date,
      habitsData: record.habitsData || {},
    })),
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || DEFAULT_USER.id;
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    console.log("🔍 Daily Progress API - Request:", {
      userId,
      date,
      startDate,
      endDate,
      url: request.url,
    });

    // Determine target date
    const targetDate = date ? parseDateString(date) : getTodayDate();

    console.log("🔍 Daily Progress API - Target Date:", {
      originalDate: date,
      parsedTargetDate: targetDate.toISOString(),
      targetDateUTC: targetDate.toUTCString(),
      targetDateLocal: targetDate.toString(),
    });

    try {
      // Handle date range request
      if (startDate && endDate) {
        const start = parseDateString(startDate);
        const end = parseDateString(endDate);

        console.log("🔍 Daily Progress API - Date Range:", {
          startDateParam: startDate,
          endDateParam: endDate,
          parsedStart: start.toISOString(),
          parsedEnd: end.toISOString(),
          startLocal: start.toString(),
          endLocal: end.toString(),
        });

        const daysDiff =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
          1;

        const progressSummary = await getProgressSummary(userId, daysDiff);

        const filteredProgress = progressSummary.filter((record) => {
          const recordStartOfDay = createStartOfDayDateUTC(record.date);
          const startStartOfDay = createStartOfDayDateUTC(start);
          const endStartOfDay = createStartOfDayDateUTC(end);

          return (
            recordStartOfDay >= startStartOfDay &&
            recordStartOfDay <= endStartOfDay
          );
        });

        return createDateRangeResponse(filteredProgress);
      }

      // Handle specific date request
      if (date) {
        const habitsProgress = await getHabitsProgressOnDate(
          userId,
          targetDate
        );

        console.log("🔍 Daily Progress API - Returning data:", {
          dateRequested: date,
          targetDate: targetDate.toISOString(),
          habitsProgress,
        });

        return createSuccessResponse(userId, targetDate, habitsProgress);
      }

      // Handle default case (today's data)
      const progressSummary = await getProgressSummary(userId, 7);
      const todayData = progressSummary.find((record) => {
        const recordStartOfDay = createStartOfDayDateUTC(record.date);
        const targetStartOfDay = createStartOfDayDateUTC(targetDate);
        return recordStartOfDay.getTime() === targetStartOfDay.getTime();
      });

      return createSuccessResponse(
        userId,
        targetDate,
        todayData?.habitsById || {}
      );
    } catch (error) {
      console.error("Error fetching progress summary:", error);
      return createSuccessResponse(userId, targetDate, {});
    }
  } catch (error) {
    console.error("Error fetching daily progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily progress" },
      { status: 500 }
    );
  }
}
