"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardContent } from "./dashboard-content";
import { CompactDatePicker } from "./compact-date-picker";
import { HabitColumns } from "./habit-columns";
import { AddHabitDialog } from "./add-habit-dialog";

export function Dashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false);

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

      <DashboardContent />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HabitColumns />
        </div>
        <div>
          <CompactDatePicker
            onDateChange={(date) => console.log("Date selected:", date)}
          />
        </div>
      </div>
      <AddHabitDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
