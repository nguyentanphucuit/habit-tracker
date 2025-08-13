import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // For now, use the seeded user ID - in production this would come from authentication
    const userId = "cme8zhu8b0000lxuftjjba9db";

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found. Please run the seed script first." },
        { status: 400 }
      );
    }

    // Fetch all habits for the user
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        frequency: true,
        targetValue: true,
        targetType: true,
        currentProgress: true,
        createdAt: true,
        updatedAt: true,
        habitChecks: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform the database habits to match the frontend format
    const transformedHabits = habits.map((habit) => {
      // Map database frequency to frontend frequency
      const frequencyMap = {
        DAILY: "daily",
        WEEKLY: "weekly",
      } as const;

      // Calculate current streak and completion rate
      const currentStreak = calculateStreak(habit.habitChecks);
      const completionRate = calculateCompletionRate(habit.habitChecks, 30);

      return {
        id: habit.id,
        name: habit.name,
        emoji: "🎯", // Default emoji since database doesn't have this
        color: "#ef4444", // Default color since database doesn't have this
        frequency: frequencyMap[habit.frequency] || "daily",
        customDays: [], // Database doesn't have custom days yet
        startDate: habit.createdAt.toISOString().split("T")[0],
        createdAt: habit.createdAt.toISOString(),
        updatedAt: habit.updatedAt.toISOString(),
        targetValue: habit.targetValue,
        targetType: habit.targetType,
        currentProgress: habit.currentProgress,
        checks: habit.habitChecks.map((check) => ({
          habitId: check.habitId,
          date: check.date,
          completed: check.completed,
          timestamp: check.timestamp,
        })),
        currentStreak,
        bestStreak: currentStreak, // For now, use current as best
        completionRate,
      };
    });

    return NextResponse.json({
      success: true,
      habits: transformedHabits,
    });
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch habits" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to calculate streak
function calculateStreak(checks: { completed: boolean; date: string }[]) {
  let current = 0;
  const sortedChecks = checks
    .filter((check) => check.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const check of sortedChecks) {
    if (check.completed) {
      current++;
    } else {
      break;
    }
  }
  return current;
}

// Helper function to calculate completion rate
function calculateCompletionRate(
  checks: { completed: boolean; date: string }[],
  days: number = 30
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentChecks = checks.filter((check) => {
    const checkDate = new Date(check.date);
    return checkDate >= cutoffDate;
  });

  const completed = recentChecks.filter((check) => check.completed).length;
  return recentChecks.length > 0
    ? Math.round((completed / recentChecks.length) * 100)
    : 0;
}
