"use client";

import { Calendar, Clock, Repeat, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HabitWithChecks } from "@/types/habit";

interface HabitColumnsProps {
  habits: HabitWithChecks[];
}

export function HabitColumns({ habits }: HabitColumnsProps) {
  // Categorize habits by new frequency system
  const dailyHabits = habits.filter((habit) => habit.frequency === "daily");
  const weeklyHabits = habits.filter((habit) => habit.frequency === "weekly");
  const monthlyHabits = habits.filter((habit) => habit.frequency === "monthly");

  const renderHabitCard = (habit: HabitWithChecks) => {
    // Debug: Log habit data to see what fields are available
    console.log("Habit data:", habit);

    // Format start date for display
    const startDate = new Date(habit.startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return (
      <div
        key={habit.id}
        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors mb-3">
        {/* Header with emoji, name, and actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: `${habit.color}20` }}>
              {habit.emoji}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-base overflow-ellipsis">
                {habit.name}
              </h4>
            </div>
          </div>

          <div className="flex items-center space-x-2"></div>
        </div>

        {/* Habit Details */}
        <div className="space-y-2">
          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">🔥</span>
                <span className="font-medium">{habit.currentStreak}</span>
                <span className="text-muted-foreground text-xs">current</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">🏆</span>
                <span className="font-medium">{habit.bestStreak}</span>
                <span className="text-muted-foreground text-xs">best</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {habit.currentProgress}/{habit.targetValue}{" "}
                {habit.targetType?.toLowerCase()}
              </span>
            </div>
            <Progress
              value={(habit.currentProgress / habit.targetValue) * 100}
              className="h-2"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Habits Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Repeat className="h-5 w-5 text-blue-500" />
              <span>Daily</span>
              <Badge variant="secondary" className="ml-auto">
                {dailyHabits.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyHabits.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No daily habits</p>
              </div>
            ) : (
              dailyHabits.map(renderHabitCard)
            )}
          </CardContent>
        </Card>

        {/* Weekly Habits Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span>Weekly</span>
              <Badge variant="secondary" className="ml-auto">
                {weeklyHabits.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyHabits.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No weekly habits</p>
              </div>
            ) : (
              weeklyHabits.map(renderHabitCard)
            )}
          </CardContent>
        </Card>

        {/* Monthly Habits Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Clock className="h-5 w-5 text-orange-500" />
              <span>Monthly</span>
              <Badge variant="secondary" className="ml-auto">
                {monthlyHabits.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyHabits.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No monthly habits</p>
              </div>
            ) : (
              monthlyHabits.map(renderHabitCard)
            )}
          </CardContent>
        </Card>

        {/* Done/Completed Habits Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Done</span>
              <Badge variant="secondary" className="ml-auto">
                0
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No completed habits</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
