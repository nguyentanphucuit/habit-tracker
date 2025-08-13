import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    // No sample habits defined, so return early
    return NextResponse.json({
      success: true,
      message: "No sample habits defined to generate",
      data: {
        days: 0,
        habits: 0,
        progressRecords: 0,
        checks: 0,
        sampleData: [],
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

export async function DELETE() {
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

    // Since no sample habits are defined, just clean up any existing data
    // Delete all habits for the user
    const deletedHabits = await prisma.habit.deleteMany({
      where: { userId },
    });

    // Delete all habit checks for the user
    const deletedChecks = await prisma.habitCheck.deleteMany({
      where: { userId },
    });

    // Delete all daily progress records for the user
    const deletedProgress = await prisma.dailyProgress.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "All user data removed successfully",
      data: {
        deletedHabits: deletedHabits.count,
        deletedChecks: deletedChecks.count,
        deletedProgress: deletedProgress.count,
      },
    });
  } catch (error) {
    console.error("Error removing user data:", error);
    return NextResponse.json(
      { error: "Failed to remove user data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
