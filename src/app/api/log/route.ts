import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const logSchema = z.object({
  habitId: z.string(),
  amount: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { habitId, amount } = logSchema.parse(body);

    // Find the habit to get its current progress and target
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      select: {
        id: true,
        name: true,
        targetType: true,
        targetValue: true,
        currentProgress: true,
        frequency: true,
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Determine the amount to add based on target type
    let amountToAdd = amount || 1;
    if (habit.targetType === "MINUTES" && !amount) {
      amountToAdd = 15; // Default 15 minutes for exercise/reading
    }

    // Calculate new progress
    const newProgress = habit.currentProgress + amountToAdd;
    const isCompleted = newProgress >= habit.targetValue;

    // Update the habit's progress
    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: {
        currentProgress: newProgress,
        isCompleted,
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      habit: updatedHabit,
      message: `Updated ${habit.name} progress to ${newProgress}`,
    });
  } catch (error) {
    console.error("Error updating habit progress:", error);
    return NextResponse.json(
      { error: "Failed to update habit progress" },
      { status: 500 }
    );
  }
}
