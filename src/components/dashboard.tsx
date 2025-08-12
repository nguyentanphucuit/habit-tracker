"use client";

import { useState } from "react";
import { Plus, Target, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HabitList } from "@/components/habit-list";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { FakeDataButton } from "@/components/fake-data-button";
import { useHabits } from "@/contexts/habit-context";
import { getToday } from "@/lib/habit-utils";

export function Dashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { stats, habitsWithChecks } = useHabits();
  const today = getToday();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your daily and weekly habits to build a better routine
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Habit</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHabits}</div>
            <p className="text-xs text-muted-foreground">Active habits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalHabits > 0
                ? `${Math.round(
                    (stats.completedToday / stats.totalHabits) * 100
                  )}%`
                : "0%"}{" "}
              of daily goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7-Day Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completionRate7Days}%
            </div>
            <p className="text-xs text-muted-foreground">Weekly completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestStreak}</div>
            <p className="text-xs text-muted-foreground">Longest streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Fake Data Generator */}
      <FakeDataButton />

      {/* Today's Habits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today&apos;s Habits</span>
          </CardTitle>
          <CardDescription>
            {today} - Mark off your daily progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {habitsWithChecks.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first habit to start tracking your progress
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                Create Your First Habit
              </Button>
            </div>
          ) : (
            <HabitList habits={habitsWithChecks} />
          )}
        </CardContent>
      </Card>

      <AddHabitDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
