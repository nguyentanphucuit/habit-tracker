import { NextRequest, NextResponse } from "next/server";
import {
  getProgressSummary,
  getHabitsProgressOnDate,
} from "@/lib/daily-progress-service";
import { DEFAULT_USER } from "@/lib/default-data";

// Helper function to create a date at start of day
function createStartOfDayDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Helper function to parse date string and create Date object
function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  const targetDate = new Date();
  targetDate.setFullYear(year);
  targetDate.setMonth(month - 1);
  targetDate.setDate(day);
  return targetDate;
}

// Helper function to get today's date
function getTodayDate(): Date {
  const today = new Date();
  return createStartOfDayDate(today);
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
      habitsData: record.habitsById || {},
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

    // Determine target date
    const targetDate = date ? parseDateString(date) : getTodayDate();

    try {
      // Handle date range request
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
          1;

        const progressSummary = await getProgressSummary(userId, daysDiff);

        const filteredProgress = progressSummary.filter((record) => {
          const recordStartOfDay = createStartOfDayDate(record.date);
          const startStartOfDay = createStartOfDayDate(start);
          const endStartOfDay = createStartOfDayDate(end);

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
        const recordStartOfDay = createStartOfDayDate(record.date);
        const targetStartOfDay = createStartOfDayDate(targetDate);
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
