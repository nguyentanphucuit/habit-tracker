"use client";

import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HabitColumns } from "@/components/habit-columns";
import { AddHabitDialog } from "@/components/add-habit-dialog";

import { TimezoneDisplay } from "@/components/timezone-display";
import { useHabitsWithChecks } from "@/hooks/use-habits";

export function Dashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data: habitsWithChecks } = useHabitsWithChecks();

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
      <HabitColumns />

      <AddHabitDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
