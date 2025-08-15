import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TIMEZONE } from "@/lib/default-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      date = DEFAULT_TIMEZONE.getCurrentTime().toISOString(),
      weight,
      height,
      bmi,
      steps,
      distance,
      caloriesBurned,
      activeEnergy,
      restingEnergy,
      bloodPressure,
      heartRate,
      bloodOxygen,
      bodyTemperature,
      sleepHours,
      sleepQuality,
      exerciseMinutes,
      standHours,
      waterIntake,
      notes,
      source = "apple_health",
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse the date
    const parsedDate = new Date(date);

    // Create or update health data for the given date
    const healthData = await prisma.health.upsert({
      where: {
        userId_date: {
          userId,
          date: parsedDate,
        },
      },
      update: {
        weight,
        height,
        bmi,
        steps,
        distance,
        caloriesBurned,
        activeEnergy,
        restingEnergy,
        bloodPressure,
        heartRate,
        bloodOxygen,
        bodyTemperature,
        sleepHours,
        sleepQuality,
        exerciseMinutes,
        standHours,
        waterIntake,
        notes,
        source,
        updatedAt: new Date(),
      },
      create: {
        userId,
        date: parsedDate,
        weight,
        height,
        bmi,
        steps,
        distance,
        caloriesBurned,
        activeEnergy,
        restingEnergy,
        bloodPressure,
        heartRate,
        bloodOxygen,
        bodyTemperature,
        sleepHours,
        sleepQuality,
        exerciseMinutes,
        standHours,
        waterIntake,
        notes,
        source,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Health data from Apple Health saved successfully",
      data: healthData,
    });
  } catch (error) {
    console.error("Error saving health data:", error);
    return NextResponse.json(
      { error: "Failed to save health data" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const source = searchParams.get("source");

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build where clause
    const whereClause: {
      userId: string;
      date?: { gte?: Date; lte?: Date };
      source?: string;
    } = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    if (source) {
      whereClause.source = source;
    }

    // Fetch health data
    const healthData = await prisma.health.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: healthData,
      count: healthData.length,
    });
  } catch (error) {
    console.error("Error fetching health data:", error);
    return NextResponse.json(
      { error: "Failed to fetch health data" },
      { status: 500 }
    );
  }
}
