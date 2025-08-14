import { NextRequest, NextResponse } from "next/server";
import { addHabitProgress } from "@/lib/daily-progress-service";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const { progressToAdd } = await request.json();
    const habitId = params.id;

    // For now, we'll use a hardcoded userId since we don't have authentication yet
    // In a real app, this would come from the authenticated user session
    const userId = "cmebt23m00000lx4fekjp8yr4";

    // Add progress using the daily progress service
    const result = await addHabitProgress(userId, habitId, progressToAdd);

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
