import { NextRequest, NextResponse } from "next/server";
import { startOfDay } from "date-fns";
import {
  getProgressSummary,
  getHabitsProgressOnDate,
} from "@/lib/daily-progress-service";
import { DEFAULT_USER, DEFAULT_TIMEZONE } from "@/lib/default-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Use the default user ID from defaults
    const userId = searchParams.get("userId") || DEFAULT_USER.id;
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Use today's date if no date specified
    let targetDate: Date;
    if (date) {
      // Parse the date string and ensure it's at the start of the day in Vietnam timezone
      const [year, month, day] = date.split("-").map(Number);
      // Create date in Vietnam timezone to avoid timezone conversion issues
      const vietnamDate = DEFAULT_TIMEZONE.getCurrentTime();
      targetDate = new Date(
        vietnamDate.getFullYear(),
        vietnamDate.getMonth(),
        vietnamDate.getDate()
      );
      // Adjust to the requested date
      targetDate.setFullYear(year);
      targetDate.setMonth(month - 1);
      targetDate.setDate(day);
    } else {
      // Use Vietnam timezone for today's date
      const today = DEFAULT_TIMEZONE.getCurrentTime();
      targetDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
    }

    try {
      // If a date range is requested, get progress for that range
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const progressSummary = await getProgressSummary(
          userId,
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
            1
        );

        // Filter to the requested date range
        // Convert dates to start of day for proper comparison
        const filteredProgress = progressSummary.filter((record) => {
          const recordStartOfDay = new Date(
            record.date.getFullYear(),
            record.date.getMonth(),
            record.date.getDate()
          );
          const startStartOfDay = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate()
          );
          const endStartOfDay = new Date(
            end.getFullYear(),
            end.getMonth(),
            end.getDate()
          );

          return (
            recordStartOfDay >= startStartOfDay &&
            recordStartOfDay <= endStartOfDay
          );
        });

        return NextResponse.json({
          success: true,
          data: filteredProgress.map((record) => ({
            date: record.date,
            habitsData: record.habitsById || {},
          })),
        });
      }

      // If a specific date is requested, get progress for that date
      if (date) {
        const habitsProgress = await getHabitsProgressOnDate(
          userId,
          targetDate
        );

        console.log("🔍 Daily Progress API - Returning data:");
        console.log("  - date requested:", date);
        console.log("  - targetDate:", targetDate);
        console.log("  - targetDate ISO:", targetDate.toISOString());
        console.log("  - habitsProgress:", habitsProgress);

        return NextResponse.json({
          success: true,
          userId,
          date: targetDate,
          habitsData: habitsProgress,
        });
      }

      // Otherwise, try to get progress summary for the last 7 days to get today's data
      const progressSummary = await getProgressSummary(userId, 7);

      // Find today's data
      const todayData = progressSummary.find((record) => {
        const recordStartOfDay = new Date(
          record.date.getFullYear(),
          record.date.getMonth(),
          record.date.getDate()
        );
        const targetStartOfDay = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate()
        );

        return recordStartOfDay.getTime() === targetStartOfDay.getTime();
      });

      if (todayData) {
        return NextResponse.json({
          success: true,
          userId,
          date: targetDate,
          habitsData: todayData.habitsById || {},
        });
      } else {
        // Return empty data if no progress found for today
        return NextResponse.json({
          success: true,
          userId,
          date: targetDate,
          habitsData: {},
        });
      }
    } catch (error) {
      console.error("Error fetching progress summary:", error);
      // Return empty data if there's an error
      return NextResponse.json({
        success: true,
        userId,
        date: targetDate,
        habitsData: {},
      });
    }
  } catch (error) {
    console.error("Error fetching daily progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily progress" },
      { status: 500 }
    );
  }
}
