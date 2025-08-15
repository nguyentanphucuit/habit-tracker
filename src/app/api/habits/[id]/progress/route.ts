import { NextRequest, NextResponse } from "next/server";
import { addHabitProgress } from "@/lib/daily-progress-service";
import { DEFAULT_USER } from "@/lib/default-data";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const { progressToAdd, date } = await request.json();
    const habitId = params.id;

    // Use the default user ID from defaults
    const userId = DEFAULT_USER.id;

    // Parse the date string as a UTC date to avoid timezone conversion issues
    let targetDate: Date;
    if (date && typeof date === "string") {
      // Parse YYYY-MM-DD as UTC date components to avoid timezone issues
      const [year, month, day] = date.split("-").map(Number);
      targetDate = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed
      console.log(
        `🔍 API - Date parsing: input="${date}" -> parsed=${targetDate.toISOString()} -> UTC=${targetDate.toUTCString()}`
      );
    } else {
      // Use today's date in UTC
      const today = new Date();
      targetDate = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate()
        )
      );
      console.log(
        `🔍 API - No date provided, using today in UTC: ${targetDate.toISOString()}`
      );
    }

    // Add progress using the daily progress service
    const result = await addHabitProgress(
      userId,
      habitId,
      progressToAdd,
      targetDate
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error updating habit progress:", error);
    return NextResponse.json(
      { error: "Failed to update habit progress" },
      { status: 500 }
    );
  }
}
