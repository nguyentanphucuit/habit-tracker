"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Habit {
  id: string;
  name: string;
  targetType: "COUNT" | "MINUTES" | "BOOLEAN";
  targetValue: number;
  progress: number;
  unit: string;
  isCompleted?: boolean;
}

interface TodoResponse {
  habits: Habit[];
  dateRange: {
    start: string;
    end: string;
  };
}

export default function HomePage() {
  const [dailyHabits, setDailyHabits] = useState<Habit[]>([]);
  const [weeklyHabits, setWeeklyHabits] = useState<Habit[]>([]);
  const [completedDailyHabits, setCompletedDailyHabits] = useState<Habit[]>([]);
  const [completedWeeklyHabits, setCompletedWeeklyHabits] = useState<Habit[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>(
    {}
  );
  const [updatingHabits, setUpdatingHabits] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const [dailyRes, weeklyRes] = await Promise.all([
        fetch("/api/daily"),
        fetch("/api/weekly"),
      ]);

      const dailyData: TodoResponse = await dailyRes.json();
      const weeklyData: TodoResponse = await weeklyRes.json();

      // Separate incomplete and completed habits
      const incompleteDaily = dailyData.habits.filter(
        (habit) => !habit.isCompleted
      );
      const completedDaily = dailyData.habits.filter(
        (habit) => habit.isCompleted
      );

      const incompleteWeekly = weeklyData.habits.filter(
        (habit) => !habit.isCompleted
      );
      const completedWeekly = weeklyData.habits.filter(
        (habit) => habit.isCompleted
      );

      setDailyHabits(incompleteDaily);
      setWeeklyHabits(incompleteWeekly);
      setCompletedDailyHabits(completedDaily);
      setCompletedWeeklyHabits(completedWeekly);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDone = async (habit: Habit, amount?: number) => {
    try {
      const finalAmount = amount ?? (habit.targetType === "BOOLEAN" ? 1 : 1);

      // Set loading state for this specific habit
      setUpdatingHabits((prev) => ({ ...prev, [habit.id]: true }));

      const response = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId: habit.id, amount: finalAmount }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(
          `✅ Successfully updated ${result.habit.name} progress to ${result.habit.currentProgress}`
        );

        // Refresh the lists immediately
        await fetchTodos();

        // Clear custom amount input
        setCustomAmounts((prev) => {
          const newAmounts = { ...prev };
          delete newAmounts[habit.id];
          return newAmounts;
        });
      } else {
        console.error("Failed to update habit:", response.status);
      }
    } catch (error) {
      console.error("Error marking habit as done:", error);
    } finally {
      // Clear loading state for this habit
      setUpdatingHabits((prev) => ({ ...prev, [habit.id]: false }));
    }
  };

  const handleCustomAmount = async (habit: Habit) => {
    const amount = customAmounts[habit.id];
    if (amount && amount > 0) {
      await handleMarkAsDone(habit, amount);
    }
  };

  const getProgressPercentage = (habit: Habit) => {
    return Math.min((habit.progress / habit.targetValue) * 100, 100);
  };

  const renderHabitCard = (habit: Habit, isCompleted = false) => (
    <Card
      key={habit.id}
      className={`mb-4 ${
        isCompleted ? "opacity-75 bg-green-50 border-green-200" : ""
      }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h3
              className={`font-medium text-lg ${
                isCompleted ? "text-green-700" : ""
              }`}>
              {habit.name}
              {isCompleted && <span className="ml-2 text-green-600">✅</span>}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                {habit.targetType === "MINUTES"
                  ? "⏱️"
                  : habit.targetType === "COUNT"
                  ? "🔢"
                  : "✅"}{" "}
                {habit.targetType}
              </Badge>
              <span
                className={`text-sm ${
                  isCompleted ? "text-green-600" : "text-muted-foreground"
                }`}>
                {habit.progress}/{habit.targetValue} {habit.unit}
              </span>
            </div>
          </div>
        </div>

        <Progress value={getProgressPercentage(habit)} className="mb-3" />

        {!isCompleted ? (
          <div className="flex gap-2">
            {habit.targetType === "BOOLEAN" ? (
              <Button
                onClick={() => handleMarkAsDone(habit)}
                disabled={updatingHabits[habit.id]}
                className="flex-1">
                {updatingHabits[habit.id]
                  ? "⏳ Updating..."
                  : "✅ Mark as Done"}
              </Button>
            ) : habit.targetType === "MINUTES" ? (
              <div className="flex gap-2 flex-1">
                <Input
                  type="number"
                  placeholder="Minutes"
                  value={customAmounts[habit.id] || ""}
                  onChange={(e) =>
                    setCustomAmounts((prev) => ({
                      ...prev,
                      [habit.id]: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="flex-1"
                  min="1"
                  disabled={updatingHabits[habit.id]}
                />
                <Button
                  onClick={() => handleCustomAmount(habit)}
                  disabled={updatingHabits[habit.id]}>
                  {updatingHabits[habit.id] ? "⏳" : "➕ Add"}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 flex-1">
                <Button
                  onClick={() => handleMarkAsDone(habit)}
                  disabled={updatingHabits[habit.id]}
                  className="flex-1">
                  {updatingHabits[habit.id] ? "⏳ Updating..." : "➕ Add 1"}
                </Button>
                <Button
                  onClick={() => handleMarkAsDone(habit, 2)}
                  disabled={updatingHabits[habit.id]}
                  variant="outline">
                  {updatingHabits[habit.id] ? "⏳" : "➕ Add 2"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              🎉 Completed!
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Habit Tracker</h1>
        <p className="text-muted-foreground">
          Track your daily and weekly habits to build a better routine
        </p>
        <div className="mt-4">
          <a
            href="/history"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            📊 View Progress History
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Incomplete Habits */}
        <div className="lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Daily Habits */}
            <div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  🌅 Daily Habits
                  <Badge variant="secondary">{dailyHabits.length}</Badge>
                </CardTitle>
              </CardHeader>

              {dailyHabits.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      🎉 All daily habits completed!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                dailyHabits.map((habit) => renderHabitCard(habit, false))
              )}
            </div>

            {/* Weekly Habits */}
            <div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  📅 Weekly Habits
                  <Badge variant="secondary">{weeklyHabits.length}</Badge>
                </CardTitle>
              </CardHeader>

              {weeklyHabits.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      🎉 All weekly habits completed!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                weeklyHabits.map((habit) => renderHabitCard(habit, false))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Completed Habits */}
        <div className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              🏆 Completed Today
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800">
                {completedDailyHabits.length + completedWeeklyHabits.length}
              </Badge>
            </CardTitle>
          </CardHeader>

          {completedDailyHabits.length === 0 &&
          completedWeeklyHabits.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Start completing habits to see them here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedDailyHabits.map((habit) =>
                renderHabitCard(habit, true)
              )}
              {completedWeeklyHabits.map((habit) =>
                renderHabitCard(habit, true)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
