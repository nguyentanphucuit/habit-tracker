import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sample habits data
const sampleHabits = [
  {
    name: "Morning Exercise",
    frequency: "DAILY" as const,
    targetType: "MINUTES" as const,
    targetValue: 30,
    active: true,
    currentProgress: 0,
    isCompleted: false,
    totalProgress: 0,
  },
  {
    name: "Read Books",
    frequency: "DAILY" as const,
    targetType: "MINUTES" as const,
    targetValue: 45,
    active: true,
    currentProgress: 0,
    isCompleted: false,
    totalProgress: 0,
  },
  {
    name: "Drink Water",
    frequency: "DAILY" as const,
    targetType: "COUNT" as const,
    targetValue: 8,
    active: true,
    currentProgress: 0,
    isCompleted: false,
    totalProgress: 0,
  },
  {
    name: "Meditation",
    frequency: "DAILY" as const,
    targetType: "MINUTES" as const,
    targetValue: 15,
    active: true,
    currentProgress: 0,
    isCompleted: false,
    totalProgress: 0,
  },
  {
    name: "Study Coding",
    frequency: "DAILY" as const,
    targetType: "MINUTES" as const,
    targetValue: 60,
    active: true,
    currentProgress: 0,
    isCompleted: false,
    totalProgress: 0,
  },
  {
    name: "Walk 10,000 Steps",
    frequency: "DAILY" as const,
    targetType: "COUNT" as const,
    targetValue: 10000,
    active: true,
    currentProgress: 0,
    isCompleted: false,
    totalProgress: 0,
  },
  {
    name: "Practice Guitar",
    frequency: "DAILY" as const,
    targetType: "MINUTES" as const,
    targetValue: 20,
    active: true,
    currentProgress: 0,
    isCompleted: false,
    totalProgress: 0,
  },
];

// Generate random progress for a habit
function generateRandomProgress(targetValue: number, targetType: string) {
  if (targetType === "BOOLEAN") {
    return Math.random() > 0.3 ? 1 : 0; // 70% completion rate
  }

  // Vary completion rates for different habits
  const baseRate = Math.random() * 0.6 + 0.2; // 20-80% base completion
  const variation = Math.random() * 0.4 - 0.2; // ±20% variation
  const completionRate = Math.max(0, Math.min(1, baseRate + variation));

  return Math.floor(targetValue * completionRate);
}

// Generate random completion status
function generateCompletionStatus(progress: number, targetValue: number) {
  return progress >= targetValue;
}

export async function POST() {
  try {
    // Use the seeded user ID
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

    // Create habits if they don't exist
    const createdHabits = [];

    for (const habitData of sampleHabits) {
      const existingHabit = await prisma.habit.findFirst({
        where: {
          userId,
          name: habitData.name,
        },
      });

      if (!existingHabit) {
        const habit = await prisma.habit.create({
          data: {
            ...habitData,
            userId,
          },
        });
        createdHabits.push(habit);
      } else {
        createdHabits.push(existingHabit);
      }
    }

    // Generate data for the last 7 days
    const today = new Date();
    const dates = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }

    const sampleData = [];
    let totalChecks = 0;

    // Create daily progress and checks for each day
    for (const date of dates) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      // Generate habits data for this day
      const habitsData: Record<
        string,
        {
          id: string;
          name: string;
          frequency: string;
          targetType: string;
          targetValue: number;
          currentProgress: number;
          isCompleted: boolean;
          lastUpdated: Date;
        }
      > = {};
      const dailyChecks = [];
      const dayHabits = [];

      for (const habit of createdHabits) {
        // Generate random progress
        const progress = generateRandomProgress(
          habit.targetValue,
          habit.targetType
        );
        const isCompleted = generateCompletionStatus(
          progress,
          habit.targetValue
        );

        // Store in habits data
        habitsData[habit.id] = {
          id: habit.id,
          name: habit.name,
          frequency: habit.frequency,
          targetType: habit.targetType,
          targetValue: habit.targetValue,
          currentProgress: progress,
          isCompleted,
          lastUpdated: new Date(
            date.getTime() + Math.random() * 24 * 60 * 60 * 1000
          ),
        };

        // Add to day habits for sample data
        dayHabits.push({
          name: habit.name,
          isCompleted,
          currentProgress: progress,
          targetValue: habit.targetValue,
          targetType: habit.targetType,
        });

        // Create habit checks for completed habits
        if (isCompleted) {
          dailyChecks.push({
            habitId: habit.id,
            userId: userId,
            date: startOfDay.toISOString(),
            completed: true,
            timestamp: new Date(
              date.getTime() + Math.random() * 24 * 60 * 60 * 1000
            ).toISOString(),
          });
        }

        // Update habit progress
        await prisma.habit.update({
          where: { id: habit.id },
          data: {
            currentProgress: progress,
            isCompleted,
            lastUpdated: new Date(
              date.getTime() + Math.random() * 24 * 60 * 60 * 1000
            ),
            totalProgress: {
              increment: progress,
            },
          },
        });
      }

      // Create daily progress record
      await prisma.dailyProgress.upsert({
        where: {
          userId_date: {
            userId,
            date: startOfDay,
          },
        },
        update: {
          habitsData: habitsData,
        },
        create: {
          userId,
          date: startOfDay,
          habitsData: habitsData,
        },
      });

      // Create habit checks
      if (dailyChecks.length > 0) {
        for (const check of dailyChecks) {
          await prisma.habitCheck.create({
            data: {
              habitId: check.habitId,
              userId: check.userId,
              date: check.date,
              completed: check.completed,
              timestamp: check.timestamp,
            },
          });
        }
        totalChecks += dailyChecks.length;
      }

      // Add to sample data
      sampleData.push({
        date: date.toISOString().split("T")[0],
        habits: dayHabits,
      });
    }

    // Get final counts
    const totalProgress = await prisma.dailyProgress.count({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "Fake data generated successfully",
      data: {
        days: dates.length,
        habits: createdHabits.length,
        progressRecords: totalProgress,
        checks: totalChecks,
        sampleData,
      },
    });
  } catch (error) {
    console.error("Error generating fake data:", error);
    return NextResponse.json(
      { error: "Failed to generate fake data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
