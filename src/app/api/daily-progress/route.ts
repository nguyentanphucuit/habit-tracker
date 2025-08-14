import { NextRequest, NextResponse } from "next/server";
import {
  getHabitProgressOnDate,
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
    const targetDate = date ? new Date(date) : new Date();

    try {
      // If a specific date is requested, get progress for that date
      if (date) {
        const habitsProgress = await getHabitsProgressOnDate(
          userId,
          targetDate
        );

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
