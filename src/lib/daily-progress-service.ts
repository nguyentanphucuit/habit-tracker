import { startOfDay, endOfDay, subDays } from "date-fns";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { DEFAULT_TIMEZONE } from "./default-data";

// Helper function to get Vietnam timezone date
function getVietnamDate(date: Date = new Date()): Date {
  // We're already in Vietnam timezone (GMT+7), so just return the date as-is
  return date;
}

// Helper function to get start of day in Vietnam timezone
function startOfDayVietnam(date: Date): Date {
  // We're already in Vietnam timezone, so just get start of day
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

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

interface HabitRecord {
  id: string;
  name: string;
  frequency: string;
  targetType: string;
  targetValue: number;
}

interface ProgressRecord {
  id: string;
  userId: string;
  date: Date;
  habitsData: unknown; // Will be cast from Json
  createdAt: Date;
}

/**
 * Save daily progress snapshot for all habits using actual UUIDs as keys
 * This should be called at the end of each day or when resetting progress
 */
export async function saveDailyProgressSnapshot(userId: string) {
  const today = startOfDayVietnam(new Date());

  try {
    // Get all active habits for the user
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        frequency: true,
        targetType: true,
        targetValue: true,
      },
    });

    if (habits.length === 0) {
      return { savedCount: 0, message: "No habits to save" };
    }

    // Convert habits to progress data object using actual UUIDs as keys
    const habitsData: DailyProgressByHabitId = {};
    habits.forEach((habit: HabitRecord) => {
      // Use the habit's actual UUID from database as the key
      habitsData[habit.id] = {
        id: habit.id,
        name: habit.name,
        frequency: habit.frequency,
        targetType: habit.targetType,
        targetValue: habit.targetValue,
        currentProgress: 0, // Default to 0 since we don't store this on habits anymore
        isCompleted: false, // Default to false since we don't store this on habits anymore
        lastUpdated: DEFAULT_TIMEZONE.getCurrentTime(), // Use Vietnam time
      };
    });

    // Save as single JSON record for the day
    await prisma.dailyProgress.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        habitsData: habitsData as any,
      },
      create: {
        userId,
        date: today,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        habitsData: habitsData as any,
      },
    });

    console.log(
      `💾 Saved daily progress for ${habits.length} habits using actual UUIDs as keys`
    );

    return {
      savedCount: habits.length,
      message: `Saved progress for ${habits.length} habits`,
      date: today,
      habitsData,
    };
  } catch (error) {
    console.error("Error saving daily progress:", error);
    throw error;
  }
}

/**
 * Get daily progress for a specific date range
 */
export async function getDailyProgressHistory(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const progress = await prisma.dailyProgress.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return progress;
  } catch (error) {
    console.error("Error fetching daily progress history:", error);
    throw error;
  }
}

/**
 * Get progress summary for the last N days
 */
export async function getProgressSummary(userId: string, days: number = 7) {
  const endDate = endOfDay(new Date());
  const startDate = startOfDay(subDays(new Date(), days - 1));

  try {
    const progress = await getDailyProgressHistory(userId, startDate, endDate);

    // Process each day's habits data
    const summaryByDate = progress.map((record: ProgressRecord) => {
      const habitsData = record.habitsData as unknown as DailyProgressByHabitId;

      // Convert object to array for easier processing
      const habitsArray = Object.values(habitsData);

      const totalHabits = habitsArray.length;
      const completedHabits = habitsArray.filter(
        (habit) => habit.isCompleted
      ).length;
      const completionRate =
        totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

      return {
        date: record.date,
        totalHabits,
        completedHabits,
        completionRate,
        habits: habitsArray,
        habitsById: habitsData, // Keep the UUID-based structure for easy lookup
      };
    });

    return summaryByDate;
  } catch (error) {
    console.error("Error fetching progress summary:", error);
    throw error;
  }
}

/**
 * Get streak information for a specific habit by actual UUID
 */
export async function getHabitStreak(userId: string, habitUuid: string) {
  try {
    const progress = await prisma.dailyProgress.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
    });

    if (progress.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastCompleted: null };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = startOfDay(new Date());

    for (let i = 0; i < progress.length; i++) {
      const record = progress[i];
      const recordDate = startOfDay(record.date);
      const habitsData = record.habitsData as unknown as DailyProgressByHabitId;

      // Find the specific habit in this day's data using actual UUID
      const habitData = habitsData[habitUuid];
      if (!habitData || !habitData.isCompleted) {
        tempStreak = 0;
        continue;
      }

      if (i === 0) {
        // Check if the last completion was today or yesterday
        const daysDiff = Math.floor(
          (today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= 1) {
          currentStreak = 1;
          tempStreak = 1;
        }
      } else {
        const prevRecord = progress[i - 1];
        const prevDate = startOfDay(prevRecord.date);
        const daysDiff = Math.floor(
          (recordDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          tempStreak++;
          if (tempStreak <= currentStreak) {
            currentStreak++;
          }
        } else {
          tempStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      currentStreak,
      longestStreak,
      lastCompleted:
        progress.find((r: ProgressRecord) => {
          const habitsData = r.habitsData as unknown as DailyProgressByHabitId;
          return habitsData[habitUuid]?.isCompleted;
        })?.date || null,
    };
  } catch (error) {
    console.error("Error calculating habit streak:", error);
    throw error;
  }
}

/**
 * Get progress for a specific habit on a specific date by actual UUID
 */
export async function getHabitProgressOnDate(
  userId: string,
  habitUuid: string,
  date: Date
) {
  try {
    const progress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: startOfDay(date),
        },
      },
    });

    if (!progress) {
      return null;
    }

    const habitsData = progress.habitsData as unknown as DailyProgressByHabitId;
    return habitsData[habitUuid] || null;
  } catch (error) {
    console.error("Error fetching habit progress on date:", error);
    throw error;
  }
}

/**
 * Get all habits progress for a specific date
 */
export async function getHabitsProgressOnDate(userId: string, date: Date) {
  try {
    // The date parameter is already in UTC from the API route, so we don't need startOfDay
    // which can cause timezone conversion issues
    const progress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: date,
        },
      },
    });

    if (!progress) {
      return {};
    }

    const habitsData = progress.habitsData as unknown as DailyProgressByHabitId;
    return habitsData;
  } catch (error) {
    console.error("Error fetching habits progress on date:", error);
    throw error;
  }
}

/**
 * Add progress to a habit for a specific date
 * This function updates the daily progress data instead of the habit directly
 */
export async function addHabitProgress(
  userId: string,
  habitId: string,
  progressToAdd: number,
  targetDate?: Date
) {
  // Use the target date as-is (it's already in UTC from the API) or create today's date in UTC
  let date: Date;
  if (targetDate) {
    // The targetDate is already in UTC from the API, so use it directly
    date = targetDate;
  } else {
    // Use today's date in UTC
    const today = new Date();
    date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );
  }

  try {
    // Get the habit details
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      select: {
        id: true,
        name: true,
        frequency: true,
        targetType: true,
        targetValue: true,
      },
    });

    if (!habit) {
      throw new Error("Habit not found");
    }

    // Get existing daily progress for the target date
    const dailyProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: date,
        },
      },
    });

    let habitsData: DailyProgressByHabitId = {};

    if (dailyProgress) {
      // Parse existing data
      habitsData =
        dailyProgress.habitsData as unknown as DailyProgressByHabitId;
    }

    // Get ALL active habits for the user to populate complete daily data
    const allHabits = await prisma.habit.findMany({
      where: {
        userId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        frequency: true,
        targetType: true,
        targetValue: true,
      },
    });

    // Initialize habitsData with all habits for the day
    allHabits.forEach((userHabit) => {
      if (!habitsData[userHabit.id]) {
        // Initialize new habit with default values
        habitsData[userHabit.id] = {
          id: userHabit.id,
          name: userHabit.name,
          frequency: userHabit.frequency,
          targetType: userHabit.targetType,
          targetValue: userHabit.targetValue,
          currentProgress: 0,
          isCompleted: false,
          lastUpdated: DEFAULT_TIMEZONE.getCurrentTime(),
        };
      }
    });

    // Get or create habit progress for the target date
    const existingHabitProgress = habitsData[habitId];
    const currentProgress = existingHabitProgress?.currentProgress || 0;
    const newProgress = currentProgress + progressToAdd;
    const isCompleted = newProgress >= habit.targetValue;

    // Update the specific habit's progress for the target date
    habitsData[habitId] = {
      id: habit.id,
      name: habit.name,
      frequency: habit.frequency,
      targetType: habit.targetType,
      targetValue: habit.targetValue,
      currentProgress: newProgress,
      isCompleted,
      lastUpdated: DEFAULT_TIMEZONE.getCurrentTime(),
    };

    // Save the updated daily progress
    if (dailyProgress) {
      await prisma.dailyProgress.update({
        where: { id: dailyProgress.id },
        data: {
          habitsData: habitsData as unknown as Prisma.InputJsonValue,
        },
      });
    } else {
      await prisma.dailyProgress.create({
        data: {
          userId,
          date: date,
          habitsData: habitsData as unknown as Prisma.InputJsonValue,
        },
      });
    }

    console.log(
      `📈 Added ${progressToAdd} progress to habit ${
        habit.name
      } for ${date.toISOString()}`
    );

    return {
      success: true,
      habitId,
      newProgress,
      isCompleted,
      date: date,
    };
  } catch (error) {
    console.error("Error adding habit progress:", error);
    throw error;
  }
}
