import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Habit, HabitCheck, HabitWithChecks } from "@/types/habit";

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
export const useUpdateHabitProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      progressToAdd,
    }: {
      habitId: string;
      progressToAdd: number;
    }) => {
      const response = await fetch(`/api/habits/${habitId}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progressToAdd }),
      });

      if (!response.ok) {
        throw new Error("Failed to update habit progress");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Force refetch to ensure UI is up to date
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      // Also invalidate daily progress queries
      queryClient.invalidateQueries({ queryKey: ["dailyProgress"] });
    },
    onError: (error) => {
      console.error("Failed to update progress:", error);
      // Refetch to ensure UI shows correct state
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
};

// Hook for getting habit progress from daily progress
export const useHabitProgress = (
  habitId: string,
  userId: string = "default-user",
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
  userId: string = "default-user",
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
        url.searchParams.set("date", date.toISOString());
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch daily progress");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
