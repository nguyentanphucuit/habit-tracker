import { NextRequest, NextResponse } from "next/server";
import { startOfDay } from "date-fns";
import {
  getProgressSummary,
  getHabitsProgressOnDate,
} from "@/lib/daily-progress-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // For now, use the seeded user ID - in production this would come from authentication
    const userId = searchParams.get("userId") || "cmebt23m00000lx4fekjp8yr4";
    const date = searchParams.get("date");

    // Use today's date if no date specified
    let targetDate: Date;
    if (date) {
      // Parse the date string and ensure it's at the start of the day in local timezone
      const [year, month, day] = date.split("-").map(Number);
      targetDate = new Date(year, month - 1, day); // month is 0-indexed
      targetDate = startOfDay(targetDate);
    } else {
      targetDate = startOfDay(new Date());
    }

    try {
      // If a specific date is requested, get progress for that date
      if (date) {
        const habitsProgress = await getHabitsProgressOnDate(
          userId,
          targetDate
        );

        console.log("🔍 Daily Progress API - Returning data:");
        console.log("  - date requested:", date);
        console.log("  - targetDate:", targetDate);
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
