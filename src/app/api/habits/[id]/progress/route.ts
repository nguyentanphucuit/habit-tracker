import { NextRequest, NextResponse } from "next/server";
import { addHabitProgress } from "@/lib/daily-progress-service";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const { progressToAdd, date } = await request.json();
    const habitId = params.id;

    // For now, we'll use a hardcoded userId since we don't have authentication yet
    // In a real app, this would come from the authenticated user session
    const userId = "cmebt23m00000lx4fekjp8yr4";

    // Parse the date string as a local date to avoid timezone issues
    let targetDate: Date;
    if (date && typeof date === "string") {
      // Parse YYYY-MM-DD as local date components
      const [year, month, day] = date.split("-").map(Number);
      targetDate = new Date(year, month - 1, day); // month is 0-indexed
      console.log(
        `🔍 API - Date parsing: input="${date}" -> parsed=${targetDate.toISOString()} -> local=${targetDate.toDateString()}`
      );
    } else {
      targetDate = new Date();
      console.log(
        `🔍 API - No date provided, using today: ${targetDate.toDateString()}`
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
