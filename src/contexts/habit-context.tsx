"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Habit, HabitCheck, HabitWithChecks, HabitStats } from "@/types/habit";
import { storage } from "@/lib/storage";
import {
  calculateStreak,
  calculateCompletionRate,
  getHabitStats,
  generateId,
  isDateEligible,
} from "@/lib/habit-utils";

interface HabitContextType {
  habits: Habit[];
  checks: HabitCheck[];
  stats: HabitStats;
  habitsWithChecks: HabitWithChecks[];
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "updatedAt">) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleCheck: (habitId: string, date: string) => void;
  getHabitChecks: (habitId: string) => HabitCheck[];
  refreshStats: () => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return context;
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checks, setChecks] = useState<HabitCheck[]>([]);
  const [stats, setStats] = useState<HabitStats>({
    totalHabits: 0,
    completedToday: 0,
    completionRate7Days: 0,
    completionRate30Days: 0,
    bestStreak: 0,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHabits = storage.getHabits();
    const savedChecks = storage.getChecks();

    setHabits(savedHabits);
    setChecks(savedChecks);
  }, []);

  // Calculate habits with checks and stats
  const habitsWithChecks = React.useMemo(() => {
    return habits.map((habit) => {
      const habitChecks = checks.filter((check) => check.habitId === habit.id);
      const { current, best } = calculateStreak(habit, habitChecks);
      const completionRate = calculateCompletionRate(habit, habitChecks, 30);

      return {
        ...habit,
        checks: habitChecks,
        currentStreak: current,
        bestStreak: best,
        completionRate,
      };
    });
  }, [habits, checks]);

  // Update stats when habits or checks change
  useEffect(() => {
    const newStats = getHabitStats(habits, checks);
    setStats(newStats);
  }, [habits, checks]);

  const addHabit = useCallback(
    (habitData: Omit<Habit, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newHabit: Habit = {
        ...habitData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };

      const newHabits = [...habits, newHabit];
      setHabits(newHabits);
      storage.saveHabits(newHabits);
    },
    [habits]
  );

  const updateHabit = useCallback(
    (id: string, updates: Partial<Habit>) => {
      const newHabits = habits.map((habit) =>
        habit.id === id
          ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
          : habit
      );

      setHabits(newHabits);
      storage.saveHabits(newHabits);
    },
    [habits]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      const newHabits = habits.filter((habit) => habit.id !== id);
      const newChecks = checks.filter((check) => check.habitId !== id);

      setHabits(newHabits);
      setChecks(newChecks);
      storage.saveHabits(newHabits);
      storage.saveChecks(newChecks);
    },
    [habits, checks]
  );

  const toggleCheck = useCallback(
    (habitId: string, date: string) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit || !isDateEligible(habit, date)) return;

      const existingCheckIndex = checks.findIndex(
        (check) => check.habitId === habitId && check.date === date
      );

      let newChecks: HabitCheck[];

      if (existingCheckIndex >= 0) {
        // Toggle existing check
        newChecks = [...checks];
        newChecks[existingCheckIndex] = {
          ...newChecks[existingCheckIndex],
          completed: !newChecks[existingCheckIndex].completed,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Add new check
        const newCheck: HabitCheck = {
          habitId,
          date,
          completed: true,
          timestamp: new Date().toISOString(),
        };
        newChecks = [...checks, newCheck];
      }

      setChecks(newChecks);
      storage.saveChecks(newChecks);
    },
    [habits, checks]
  );

  const getHabitChecks = useCallback(
    (habitId: string) => {
      return checks.filter((check) => check.habitId === habitId);
    },
    [checks]
  );

  const refreshStats = useCallback(() => {
    const newStats = getHabitStats(habits, checks);
    setStats(newStats);
  }, [habits, checks]);

  const value: HabitContextType = {
    habits,
    checks,
    stats,
    habitsWithChecks,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCheck,
    getHabitChecks,
    refreshStats,
  };

  return (
    <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
  );
};
