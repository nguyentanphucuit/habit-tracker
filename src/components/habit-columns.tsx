"use client";

import {
  Calendar,
  Clock,
  Repeat,
  CheckCircle,
  Loader2,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { HabitCard } from "./habit-card";
import { useHabitsWithChecks } from "@/hooks/use-habits";
import { HabitWithChecks } from "@/types/habit";

export function HabitColumns({ habits }: { habits?: HabitWithChecks[] }) {
  const { data: defaultHabits, isLoading, error } = useHabitsWithChecks();

  // Use provided habits or fall back to fetched habits
  const habitsWithChecks = habits || defaultHabits || [];

  // Categorize habits by frequency (show all habits since completion is handled by daily progress)
  const dailyHabits = habitsWithChecks.filter(
    (habit: HabitWithChecks) => habit.frequency === "daily"
  );
  const weeklyHabits = habitsWithChecks.filter(
    (habit: HabitWithChecks) => habit.frequency === "weekly"
  );
  const monthlyHabits = habitsWithChecks.filter(
    (habit: HabitWithChecks) => habit.frequency === "monthly"
  );

  return (
    <div className="space-y-6">
      {isLoading && !habits ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              Loading habits...
            </p>
            <p className="text-sm text-muted-foreground">
              Please wait while we fetch your data
            </p>
          </div>
        </div>
      ) : error && !habits ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto mb-4 text-red-500">⚠️</div>
            <p className="text-lg font-medium text-red-600 mb-2">
              Error loading habits
            </p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        </div>
      ) : habitsWithChecks.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              {habits ? "No habits for selected date" : "No habits yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {habits
                ? "Try selecting a different date or create some habits"
                : "Create your first habit to start tracking your progress"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                dailyHabits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))
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
                weeklyHabits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))
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
                monthlyHabits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
