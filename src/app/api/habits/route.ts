import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // For now, use the seeded user ID - in production this would come from authentication
    const userId = "cmebt23m00000lx4fekjp8yr4";

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
        createdAt: true,
        updatedAt: true,
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
        checks: [], // Empty array since we don't use HabitCheck anymore
        currentStreak: 0, // Will be calculated from daily progress
        bestStreak: 0, // Will be calculated from daily progress
        completionRate: 0, // Will be calculated from daily progress
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
