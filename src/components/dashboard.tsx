"use client";

import { useState, Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { TimezoneDisplay } from "@/components/timezone-display";
import { DashboardContent } from "@/components/dashboard-content";

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
          <TimezoneDisplay />
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Habit</span>
        </Button>
      </div>

      {/* Dashboard Content with Suspense */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground">
                ⏳
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                Loading dashboard...
              </p>
            </div>
          </div>
        }>
        <DashboardContent />
      </Suspense>

      <AddHabitDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
