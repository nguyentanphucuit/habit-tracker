import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Habit,
  HabitCheck,
  HabitWithChecks,
  HabitWithProgress,
} from "@/types/habit";
import { useMemo } from "react";

// API response types
interface ApiHabit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  frequency: "daily" | "weekly" | "monthly";
  customDays: number[];
  startDate: string;
  createdAt: string;
  updatedAt: string;
  targetValue: number;
  targetType: string;
  checks: ApiHabitCheck[];
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
}

interface ApiHabitCheck {
  habitId: string;
  date: string;
  completed: boolean;
  timestamp: string;
}

interface ApiResponse {
  success: boolean;
  habits: ApiHabit[];
}

// Transform API habits to local format
const transformHabits = (apiHabits: ApiHabit[]): Habit[] => {
  return apiHabits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    emoji: habit.emoji,
    color: habit.color,
    frequency: habit.frequency,
    customDays: habit.customDays,
    startDate: habit.startDate,
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
    targetValue: habit.targetValue,
    targetType: habit.targetType,
  }));
};

// Extract checks from habits
const extractChecks = (apiHabits: ApiHabit[]): HabitCheck[] => {
  return apiHabits.flatMap((habit) =>
    habit.checks.map((check) => ({
      habitId: check.habitId,
      date: check.date,
      completed: check.completed,
      timestamp: check.timestamp,
    }))
  );
};

// Transform to habits with checks
const transformHabitsWithChecks = (
  habits: Habit[],
  checks: HabitCheck[]
): HabitWithChecks[] => {
  return habits.map((habit) => {
    const habitChecks = checks.filter((check) => check.habitId === habit.id);

    return {
      ...habit,
      checks: habitChecks,
      currentStreak: 0, // You can calculate this based on your logic
      bestStreak: 0, // You can calculate this based on your logic
      completionRate: 0, // This will be calculated from daily progress
    };
  });
};

// Fetch habits from API
const fetchHabits = async (): Promise<{
  habits: Habit[];
  checks: HabitCheck[];
}> => {
  const response = await fetch("/api/habits");
  if (!response.ok) {
    throw new Error("Failed to fetch habits");
  }

  const data: ApiResponse = await response.json();
  if (!data.success) {
    throw new Error("API returned error");
  }

  const habits = transformHabits(data.habits);
  const checks = extractChecks(data.habits);

  return { habits, checks };
};

// Hook for fetching habits
export const useHabits = () => {
  return useQuery({
    queryKey: ["habits"],
    queryFn: fetchHabits,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for fetching habits with checks
export const useHabitsWithChecks = () => {
  const { data, isLoading, error, refetch } = useHabits();

  if (data) {
    const habitsWithChecks = transformHabitsWithChecks(
      data.habits,
      data.checks
    );
    return {
      data: habitsWithChecks,
      isLoading,
      error,
      refetch,
    };
  }

  return {
    data: [],
    isLoading,
    error,
    refetch,
  };
};

// Hook for updating habit progress
export const useUpdateHabitProgress = (currentDate?: Date) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      progressToAdd,
      date,
    }: {
      habitId: string;
      progressToAdd: number;
      date?: string; // Changed from Date to string
    }) => {
      const response = await fetch(`/api/habits/${habitId}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progressToAdd, date }),
      });

      if (!response.ok) {
        throw new Error("Failed to update habit progress");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate the specific daily progress query for the current date
      if (currentDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        queryClient.invalidateQueries({
          queryKey: ["dailyProgress", "cmebt23m00000lx4fekjp8yr4", dateString],
        });
      }

      // Also invalidate all daily progress queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["dailyProgress"] });
      // Also invalidate habits queries
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (error) => {
      console.error("Failed to update progress:", error);
    },
  });
};

// Hook for getting habit progress from daily progress
export const useHabitProgress = (
  habitId: string,
  userId: string = "cmebt23m00000lx4fekjp8yr4",
  date?: Date
) => {
  const {
    data: dailyProgress,
    isLoading,
    error,
  } = useDailyProgress(userId, date);

  if (dailyProgress && dailyProgress.habitsData) {
    const habitProgress = dailyProgress.habitsData[habitId];
    return {
      data: habitProgress || { currentProgress: 0, isCompleted: false },
      isLoading,
      error,
    };
  }

  return {
    data: { currentProgress: 0, isCompleted: false },
    isLoading,
    error,
  };
};

// Hook for fetching daily progress
export const useDailyProgress = (
  userId: string = "cmebt23m00000lx4fekjp8yr4",
  date?: Date
) => {
  const queryKey = date
    ? ["dailyProgress", userId, date.toISOString().split("T")[0]]
    : ["dailyProgress", userId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL("/api/daily-progress", window.location.origin);
      url.searchParams.set("userId", userId);
      if (date) {
        // Send only the date part (YYYY-MM-DD) not the full ISO string
        const dateString = date.toISOString().split("T")[0];
        url.searchParams.set("date", dateString);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch daily progress");
      }
      return response.json();
    },
    staleTime: 0, // Always refetch when requested
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
  });
};

// Hook for fetching weekly progress (for weekly habits)
export const useWeeklyProgress = (
  userId: string = "cmebt23m00000lx4fekjp8yr4",
  date?: Date
) => {
  const queryKey = date
    ? ["weeklyProgress", userId, getWeekKey(date)]
    : ["weeklyProgress", userId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!date) return { habitsData: {} };

      // Get the start and end of the week
      const weekStart = getWeekStart(date);
      const weekEnd = getWeekEnd(date);

      // Fetch progress for each day of the week
      const weekProgress: Record<
        string,
        {
          id: string;
          name: string;
          frequency: string;
          targetType: string;
          isCompleted: boolean;
          lastUpdated: string;
          targetValue: number;
          currentProgress: number;
        }
      > = {};

      for (
        let d = new Date(weekStart);
        d <= weekEnd;
        d.setDate(d.getDate() + 1)
      ) {
        const dateString = d.toISOString().split("T")[0];
        const url = new URL("/api/daily-progress", window.location.origin);
        url.searchParams.set("userId", userId);
        url.searchParams.set("date", dateString);

        try {
          const response = await fetch(url.toString());
          if (response.ok) {
            const data = await response.json();
            if (data.habitsData) {
              // Merge progress data for the week
              Object.keys(data.habitsData).forEach((habitId) => {
                if (!weekProgress[habitId]) {
                  weekProgress[habitId] = { ...data.habitsData[habitId] };
                } else {
                  // For weekly habits, if completed on any day, mark as completed for the week
                  if (data.habitsData[habitId].isCompleted) {
                    weekProgress[habitId].isCompleted = true;
                    weekProgress[habitId].currentProgress = Math.max(
                      weekProgress[habitId].currentProgress,
                      data.habitsData[habitId].currentProgress
                    );
                  }
                }
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching progress for ${dateString}:`, error);
        }
      }

      return { habitsData: weekProgress };
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Helper function to get week start (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

// Helper function to get week end (Sunday)
function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

// Helper function to get week key for caching
function getWeekKey(date: Date): string {
  const weekStart = getWeekStart(date);
  return weekStart.toISOString().split("T")[0];
}

// Hook for fetching habits with progress for a specific date
export const useHabitsWithProgressForDate = (
  date: Date,
  userId: string = "cmebt23m00000lx4fekjp8yr4"
) => {
  const {
    data: habitsData,
    isLoading: habitsLoading,
    error: habitsError,
    refetch: refetchHabits,
  } = useHabits();
  const {
    data: dailyProgress,
    isLoading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
  } = useDailyProgress(userId, date);
  const {
    data: weeklyProgress,
    isLoading: weeklyProgressLoading,
    error: weeklyProgressError,
    refetch: refetchWeeklyProgress,
  } = useWeeklyProgress(userId, date);

  // Combine habits with their progress for the specific date
  const habitsWithProgress = useMemo((): HabitWithProgress[] => {
    console.log("🔍 useHabitsWithProgressForDate - Data combination:");
    console.log("  - habitsData:", habitsData);
    console.log("  - dailyProgress:", dailyProgress);
    console.log("  - weeklyProgress:", weeklyProgress);

    if (!habitsData?.habits || !dailyProgress?.habitsData) {
      console.log("  - Missing data, returning empty array");
      return [];
    }

    const result = habitsData.habits.map((habit) => {
      let habitProgress = dailyProgress.habitsData[habit.id];
      let isCompleted = habitProgress?.isCompleted || false;
      let currentProgress = habitProgress?.currentProgress || 0;
      let lastUpdated = habitProgress?.lastUpdated || null;

      // For weekly habits, check weekly progress instead of daily
      if (habit.frequency === "weekly" && weeklyProgress?.habitsData) {
        const weeklyHabitProgress = weeklyProgress.habitsData[habit.id];
        if (weeklyHabitProgress) {
          habitProgress = weeklyHabitProgress;
          isCompleted = weeklyHabitProgress.isCompleted || false;
          currentProgress = weeklyHabitProgress.currentProgress || 0;
          lastUpdated = weeklyHabitProgress.lastUpdated || null;
        }
      }

      const habitChecks = habitsData.checks.filter(
        (check) => check.habitId === habit.id
      );

      const habitWithProgress = {
        ...habit,
        checks: habitChecks,
        currentStreak: 0, // Will be calculated from daily progress
        bestStreak: 0, // Will be calculated from daily progress
        completionRate: 0, // Will be calculated from daily progress
        // Add progress data for the specific date/week
        currentProgress,
        isCompleted,
        lastUpdated,
      };

      console.log(`  - Habit ${habit.name} (${habit.id}):`, {
        frequency: habit.frequency,
        dailyProgress: dailyProgress.habitsData[habit.id],
        weeklyProgress: weeklyProgress?.habitsData?.[habit.id],
        final: habitWithProgress,
      });

      return habitWithProgress;
    });

    console.log("  - Final result:", result);
    return result;
  }, [habitsData, dailyProgress, weeklyProgress]);

  // Combined refetch function
  const refetch = () => {
    refetchHabits();
    refetchProgress();
    refetchWeeklyProgress();
  };

  return {
    data: habitsWithProgress,
    isLoading: habitsLoading || progressLoading || weeklyProgressLoading,
    error: habitsError || progressError || weeklyProgressError,
    refetch,
  };
};
