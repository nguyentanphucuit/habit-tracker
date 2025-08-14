import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const { progressToAdd } = await request.json();
    const habitId = params.id;

    // Get current habit to calculate new progress
    const currentHabit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!currentHabit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Calculate new progress by ADDING to current progress
    const newProgress = currentHabit.currentProgress + progressToAdd;

    // Update the habit's current progress
    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: {
        currentProgress: newProgress,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      habit: updatedHabit,
    });
  } catch (error) {
    console.error("Error updating habit progress:", error);
    return NextResponse.json(
      { error: "Failed to update habit progress" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
