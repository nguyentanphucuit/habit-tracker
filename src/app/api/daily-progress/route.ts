import { NextRequest, NextResponse } from "next/server";
import { startOfDay } from "date-fns";
import {
  getProgressSummary,
  getHabitsProgressOnDate,
} from "@/lib/daily-progress-service";
import { DEFAULT_USER } from "@/lib/default-data";

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
      // Parse the date string and ensure it's at the start of the day in UTC
      // This fixes the timezone issue where local parsing was causing date mismatches
      const [year, month, day] = date.split("-").map(Number);
      // Create date in UTC to avoid timezone conversion issues
      targetDate = new Date(Date.UTC(year, month - 1, day));
    } else {
      targetDate = startOfDay(new Date());
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
        const filteredProgress = progressSummary.filter(
          (record) => record.date >= start && record.date <= end
        );

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
      const todayData = progressSummary.find(
        (record) => record.date.toDateString() === targetDate.toDateString()
      );

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
