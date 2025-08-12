import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      // Basic metrics
      weight,
      height,
      bmi,
      // Apple Health specific metrics
      steps,
      distance,
      caloriesBurned,
      activeEnergy,
      restingEnergy,
      // Vital signs
      bloodPressure,
      heartRate,
      bloodOxygen,
      bodyTemperature,
      // Sleep data
      sleepHours,
      sleepQuality,
      // Activity data
      exerciseMinutes,
      standHours,
      // Other metrics
      waterIntake,
      notes,
      date,
      source = "apple_health", // Track data source
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Create health record with Apple Health data
    const healthRecord = await prisma.health.create({
      data: {
        userId,
        // Basic metrics
        weight: weight || null,
        height: height || null,
        bmi: bmi || null,
        // Apple Health metrics
        steps: steps || null,
        distance: distance || null,
        caloriesBurned: caloriesBurned || null,
        activeEnergy: activeEnergy || null,
        restingEnergy: restingEnergy || null,
        // Vital signs
        bloodPressure: bloodPressure || null,
        heartRate: heartRate || null,
        bloodOxygen: bloodOxygen || null,
        bodyTemperature: bodyTemperature || null,
        // Sleep data
        sleepHours: sleepHours || null,
        sleepQuality: sleepQuality || null,
        // Activity data
        exerciseMinutes: exerciseMinutes || null,
        standHours: standHours || null,
        // Other metrics
        waterIntake: waterIntake || null,
        notes: notes || null,
        source: source,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Health data from Apple Health saved successfully",
      data: healthRecord,
    });
  } catch (error) {
    console.error("Error saving Apple Health data:", error);
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

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const where: {
      userId: string;
      date?: { gte: Date; lte: Date };
      source?: string;
    } = { userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (source) {
      where.source = source;
    }

    const healthRecords = await prisma.health.findMany({
      where,
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: healthRecords,
      count: healthRecords.length,
    });
  } catch (error) {
    console.error("Error fetching health data:", error);
    return NextResponse.json(
      { error: "Failed to fetch health data" },
      { status: 500 }
    );
  }
}
