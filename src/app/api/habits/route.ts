import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_USER } from "@/lib/default-data";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Use the default user ID from defaults
    const userId = DEFAULT_USER.id;

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
        emoji: true,
        color: true,
        frequency: true,
        customDays: true,
        startDate: true,
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
        MONTHLY: "monthly",
      } as const;

      return {
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji || "🎯", // Use database emoji or default
        color: habit.color || "#ef4444", // Use database color or default
        frequency: frequencyMap[habit.frequency] || "daily",
        customDays: habit.customDays || [], // Use database custom days or empty array
        startDate: habit.startDate,
        createdAt: habit.createdAt.toISOString(),
        updatedAt: habit.updatedAt.toISOString(),
        targetValue: habit.targetValue || 1,
        targetType: habit.targetType || "COUNT",
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
