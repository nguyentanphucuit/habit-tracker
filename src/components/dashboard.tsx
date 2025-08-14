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
import { HabitColumns } from "@/components/habit-columns";
import { AddHabitDialog } from "@/components/add-habit-dialog";

import { TimezoneDisplay } from "@/components/timezone-display";
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
          <TimezoneDisplay />
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Habit</span>
        </Button>
      </div>

      {/* Habit Overview */}
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
        <HabitColumns habits={habitsWithChecks} />
      )}

      <AddHabitDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
