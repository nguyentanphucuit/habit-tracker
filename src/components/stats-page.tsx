"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHabitsWithChecks } from "@/hooks/use-habits";
import { HeatmapCalendar } from "./heatmap-calendar";
import { StatsOverview } from "./stats-overview";

export function StatsPage() {
  const { data: habitsWithChecks, isLoading, error } = useHabitsWithChecks();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-lg font-medium text-muted-foreground">
            Loading statistics...
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 text-red-500">⚠️</div>
          <p className="text-lg font-medium text-red-600 mb-2">
            Error loading statistics
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats from habits data
  const stats = {
    totalHabits: habitsWithChecks.length,
    completedToday: habitsWithChecks.filter((habit) =>
      habit.checks.some(
        (check) =>
          check.date === new Date().toISOString().split("T")[0] &&
          check.completed
      )
    ).length,
    completionRate7Days:
      habitsWithChecks.length > 0
        ? Math.round(
            habitsWithChecks.reduce(
              (sum, habit) => sum + habit.completionRate,
              0
            ) / habitsWithChecks.length
          )
        : 0,
    completionRate30Days:
      habitsWithChecks.length > 0
        ? Math.round(
            habitsWithChecks.reduce(
              (sum, habit) => sum + habit.completionRate,
              0
            ) / habitsWithChecks.length
          )
        : 0,
    bestStreak:
      habitsWithChecks.length > 0
        ? Math.max(...habitsWithChecks.map((habit) => habit.bestStreak))
        : 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">
          Track your progress and analyze your habits
        </p>
      </div>

      <StatsOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your habit completion over the last 8 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HeatmapCalendar habits={habitsWithChecks} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Habits with the best completion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {habitsWithChecks
                .sort((a, b) => b.completionRate - a.completionRate)
                .slice(0, 5)
                .map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ backgroundColor: `${habit.color}20` }}>
                        {habit.emoji}
                      </div>
                      <span className="font-medium">{habit.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{habit.completionRate}%</Badge>
                      <span className="text-sm text-muted-foreground">
                        {habit.currentStreak} day streak
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Stats</CardTitle>
          <CardDescription>Individual habit performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {habitsWithChecks.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${habit.color}20` }}>
                    {habit.emoji}
                  </div>
                  <div>
                    <h3 className="font-medium">{habit.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {habit.frequency === "daily"
                        ? "Daily"
                        : "Custom schedule"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-right">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Current Streak
                    </div>
                    <div className="font-medium">{habit.currentStreak}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Best Streak
                    </div>
                    <div className="font-medium">{habit.bestStreak}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Completion Rate
                    </div>
                    <div className="font-medium">{habit.completionRate}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
