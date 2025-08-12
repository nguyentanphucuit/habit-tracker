import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAndResetDailyProgress } from "@/lib/progress-reset";
import { calculateCompletionStatus } from "@/lib/progress-reset";

export async function GET() {
  try {
    // For now, use the seeded user ID
    const userId = "cme8tf1gw0000lxna8mrub899";

    // Check and reset daily progress if needed
    await checkAndResetDailyProgress();

    // Get daily habits for the user
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        frequency: "DAILY",
        active: true,
      },
      select: {
        id: true,
        name: true,
        frequency: true,
        targetType: true,
        targetValue: true,
        currentProgress: true,
        lastUpdated: true,
        isCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Calculate completion status for each habit
    const habitsWithProgress = habits.map((habit) => {
      const isCompleted = calculateCompletionStatus(
        habit.currentProgress,
        habit.targetValue,
        habit.targetType
      );

      const progressPercentage = Math.min(
        (habit.currentProgress / habit.targetValue) * 100,
        100
      );

      return {
        id: habit.id,
        name: habit.name,
        frequency: habit.frequency,
        targetType: habit.targetType,
        targetValue: habit.targetValue,
        progress: habit.currentProgress,
        progressPercentage,
        isCompleted,
        lastUpdated: habit.lastUpdated,
      };
    });

    // Filter out completed habits
    const incompleteHabits = habitsWithProgress.filter(
      (habit) => !habit.isCompleted
    );

    return NextResponse.json({
      habits: incompleteHabits,
      totalHabits: habitsWithProgress.length,
      incompleteHabits: incompleteHabits.length,
      completedHabits: habitsWithProgress.length - incompleteHabits.length,
    });
  } catch (error) {
    console.error("Error fetching daily habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily habits" },
      { status: 500 }
    );
  }
}
