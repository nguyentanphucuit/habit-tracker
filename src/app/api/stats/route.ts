import { NextRequest, NextResponse } from "next/server";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { HabitStats } from "@/types/habit";

// Helper function to get start of day in UTC
function startOfDayUTC(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

// Helper function to get end of day in UTC
function endOfDayUTC(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
}

// Define proper types for habit progress data
interface HabitProgressData {
  id: string;
  name: string;
  frequency: string;
  targetType: string;
  targetValue: number;
  currentProgress: number;
  isCompleted: boolean;
  lastUpdated: Date;
}

interface DailyProgressByHabitId {
  [habitId: string]: HabitProgressData;
}

// New stats schema interface
interface StatsSchema {
  id: string;
  userid: string;
  date: string;
  totalHabits: number;
  sevenDayRate: number;
  bestStreak: number;
  bestDay: {
    date: string;
    completionRate: number;
    completedHabits: number;
    totalHabits: number;
  } | null;
  worstDay: {
    date: string;
    completionRate: number;
    completedHabits: number;
    totalHabits: number;
  } | null;
  lastUpdated: Date;
  // Optional fields when includeProgress is true
  completedHabits?: number;
  completionRate?: number;
  habitsData?: DailyProgressByHabitId;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, date } = await request.json();

    if (!userId || !date) {
      return NextResponse.json(
        { error: "Missing required fields: userId, date" },
        { status: 400 }
      );
    }

    // Validate date format
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const dateString = format(targetDate, "yyyy-MM-dd");

    // Get daily progress for the specified date
    const dailyProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
    });

    if (!dailyProgress) {
      return NextResponse.json(
        { error: "No daily progress found for this date" },
        { status: 404 }
      );
    }

    // Parse habits data from JSON
    const habitsData =
      dailyProgress.habitsData as unknown as DailyProgressByHabitId;
    const habitsArray = Object.values(habitsData);

    // Calculate stats
    const totalHabits = habitsArray.length;
    const completedHabits = habitsArray.filter(
      (habit: HabitProgressData) => habit.isCompleted
    ).length;
    const completionRate =
      totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    // Calculate 7-day rate
    const sevenDaysAgo = subDays(targetDate, 7);
    const sevenDayProgress = await prisma.dailyProgress.findMany({
      where: {
        userId,
        date: {
          gte: sevenDaysAgo,
          lte: targetDate,
        },
      },
    });

    let sevenDayRate = 0;
    if (sevenDayProgress.length > 0) {
      const totalCompletions = sevenDayProgress.reduce((sum, progress) => {
        const data = progress.habitsData as unknown as DailyProgressByHabitId;
        const habits = Object.values(data);
        return sum + habits.filter((h) => h.isCompleted).length;
      }, 0);
      const totalPossible = sevenDayProgress.length * totalHabits;
      sevenDayRate =
        totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;
    }

    // Calculate best streak (simplified for this endpoint)
    let bestStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = subDays(targetDate, i);
      const progress = await prisma.dailyProgress.findUnique({
        where: {
          userId_date: {
            userId,
            date: checkDate,
          },
        },
      });

      if (progress) {
        const data = progress.habitsData as unknown as DailyProgressByHabitId;
        const habits = Object.values(data);
        const hasCompleted = habits.some((h) => h.isCompleted);

        if (hasCompleted) {
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      } else {
        currentStreak = 0;
      }
    }

    // Calculate best and worst days
    const thirtyDaysAgo = subDays(targetDate, 30);
    const thirtyDayProgress = await prisma.dailyProgress.findMany({
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo,
          lte: targetDate,
        },
      },
    });

    let bestDay = null;
    let worstDay = null;
    let bestCompletionRate = 0;
    let worstCompletionRate = 100;

    thirtyDayProgress.forEach((progress) => {
      const data = progress.habitsData as unknown as DailyProgressByHabitId;
      const habits = Object.values(data);
      const completed = habits.filter((h) => h.isCompleted).length;
      const rate = habits.length > 0 ? (completed / habits.length) * 100 : 0;

      if (rate > bestCompletionRate) {
        bestCompletionRate = rate;
        bestDay = {
          date: format(progress.date, "yyyy-MM-dd"),
          completionRate: Math.round(rate * 100) / 100,
          completedHabits: completed,
          totalHabits: habits.length,
        };
      }

      if (rate < worstCompletionRate) {
        worstCompletionRate = rate;
        worstDay = {
          date: format(progress.date, "yyyy-MM-dd"),
          completionRate: Math.round(rate * 100) / 100,
          completedHabits: completed,
          totalHabits: habits.length,
        };
      }
    });

    // Save stats to Stats table
    const savedStats = await prisma.stats.upsert({
      where: {
        userId_date: {
          userId,
          date: dateString,
        },
      },
      update: {
        totalHabits,
        sevenDayRate: Math.round(sevenDayRate * 100) / 100,
        bestStreak,
        bestDay: bestDay as unknown as Prisma.InputJsonValue,
        worstDay: worstDay as unknown as Prisma.InputJsonValue,
        lastUpdated: new Date(),
      },
      create: {
        id: `stats-${userId}-${dateString}`,
        userId,
        date: dateString,
        totalHabits,
        sevenDayRate: Math.round(sevenDayRate * 100) / 100,
        bestStreak,
        bestDay: bestDay as unknown as Prisma.InputJsonValue,
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: savedStats,
    });
  } catch (error) {
    console.error("Error saving daily stats:", error);
    return NextResponse.json(
      { error: "Failed to save daily stats" },
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
    const includeProgress = searchParams.get("includeProgress") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Build where clause for date range
    const whereClause: { userId: string; date?: { gte: Date; lte: Date } } = {
      userId,
    };

    if (startDate && endDate) {
      whereClause.date = {
        gte: startOfDayUTC(new Date(startDate)),
        lte: endOfDayUTC(new Date(endDate)),
      };
    }

    // Get daily progress data
    const dailyProgress = await prisma.dailyProgress.findMany({
      where: whereClause,
      orderBy: {
        date: "desc",
      },
    });

    // Get total habits count
    const totalHabits = await prisma.habit.count({
      where: {
        userId,
        active: true,
      },
    });

    // Transform daily progress into new stats schema format
    const stats: StatsSchema[] = await Promise.all(
      dailyProgress.map(async (progress) => {
        const habitsData =
          progress.habitsData as unknown as DailyProgressByHabitId;
        const habitsArray = Object.values(habitsData);

        const completedHabits = habitsArray.filter(
          (habit: HabitProgressData) => habit.isCompleted
        ).length;
        const completionRate =
          totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

        // Calculate 7-day rate for this date
        const sevenDaysAgo = subDays(progress.date, 7);
        const sevenDayProgress = await prisma.dailyProgress.findMany({
          where: {
            userId,
            date: {
              gte: sevenDaysAgo,
              lte: progress.date,
            },
          },
        });

        let sevenDayRate = 0;
        if (sevenDayProgress.length > 0) {
          const totalCompletions = sevenDayProgress.reduce((sum, p) => {
            const data = p.habitsData as unknown as DailyProgressByHabitId;
            const habits = Object.values(data);
            return sum + habits.filter((h) => h.isCompleted).length;
          }, 0);
          const totalPossible = sevenDayProgress.length * totalHabits;
          sevenDayRate =
            totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;
        }

        // Calculate best streak for this date
        let bestStreak = 0;
        let currentStreak = 0;
        for (let i = 0; i < 30; i++) {
          const checkDate = subDays(progress.date, i);
          const p = await prisma.dailyProgress.findUnique({
            where: {
              userId_date: {
                userId,
                date: checkDate,
              },
            },
          });

          if (p) {
            const data = p.habitsData as unknown as DailyProgressByHabitId;
            const habits = Object.values(data);
            const hasCompleted = habits.some((h) => h.isCompleted);

            if (hasCompleted) {
              currentStreak++;
              bestStreak = Math.max(bestStreak, currentStreak);
            } else {
              currentStreak = 0;
            }
          } else {
            currentStreak = 0;
          }
        }

        const stat: StatsSchema = {
          id: progress.id,
          userid: progress.userId,
          date: format(progress.date, "yyyy-MM-dd"),
          totalHabits,
          sevenDayRate: Math.round(sevenDayRate * 100) / 100,
          bestStreak,
          bestDay: null, // Will be calculated in comprehensive endpoint
          worstDay: null, // Will be calculated in comprehensive endpoint
          lastUpdated: progress.createdAt,
        };

        // Include progress data if requested
        if (includeProgress) {
          return {
            ...stat,
            completedHabits,
            completionRate: Math.round(completionRate * 100) / 100,
            habitsData: habitsData,
          };
        }

        return stat;
      })
    );

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily stats" },
      { status: 500 }
    );
  }
}

// Comprehensive stats endpoint with best/worst day calculations
export async function PUT(request: NextRequest) {
  try {
    const { userId, days = 30 } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get stats from Stats table
    const stats = await prisma.stats.findFirst({
      where: {
        userId,
      },
      orderBy: {
        lastUpdated: "desc",
      },
    });

    if (!stats) {
      return NextResponse.json({
        success: true,
        data: {
          totalHabits: 0,
          sevenDayRate: 0,
          bestStreak: 0,
          bestDay: null,
          worstDay: null,
          lastUpdated: new Date(),
        },
      });
    }

    // Return stats from Stats table
    return NextResponse.json({
      success: true,
      data: {
        totalHabits: stats.totalHabits,
        sevenDayRate: stats.sevenDayRate,
        bestStreak: stats.bestStreak,
        bestDay: stats.bestDay,
        worstDay: stats.worstDay,
        lastUpdated: stats.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
