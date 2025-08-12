import { NextRequest, NextResponse } from "next/server";
import {
  getProgressSummary,
  getHabitStreak,
} from "@/lib/daily-progress-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get("habitId");
    const days = searchParams.get("days") || "7";

    // For now, use the seeded user ID
    const userId = "cme8tf1gw0000lxna8mrub899";

    if (habitId) {
      // Get streak for specific habit
      const streak = await getHabitStreak(userId, habitId);
      return NextResponse.json(streak);
    } else {
      // Get overall progress summary
      const summary = await getProgressSummary(userId, parseInt(days));
      return NextResponse.json({ summary });
    }
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
