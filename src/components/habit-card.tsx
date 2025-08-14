"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { HabitWithProgress } from "@/types/habit";
import { useUpdateHabitProgress } from "@/hooks/use-habits";

interface HabitCardProps {
  habit: HabitWithProgress;
  selectedDate?: Date;
}

export function HabitCard({ habit, selectedDate }: HabitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [progressInput, setProgressInput] = useState("");
  const updateProgress = useUpdateHabitProgress(selectedDate);

  // Use progress data from the habit (which comes from the selected date)
  const currentProgress = habit.currentProgress || 0;
  const isCompleted = habit.isCompleted || false;

  const handleProgressUpdate = async (progressToAdd: string) => {
    try {
      const progressValue = parseInt(progressToAdd) || 0;

      // Convert the date to YYYY-MM-DD string to avoid timezone issues
      const dateString = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : undefined;

      await updateProgress.mutateAsync({
        habitId: habit.id,
        progressToAdd: progressValue,
        date: dateString, // Send the date as YYYY-MM-DD string
      });

      // Reset editing state
      setIsEditing(false);
      setProgressInput("");
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border mb-3 transition-colors ${
        isCompleted
          ? "bg-green-50 border-green-200 hover:bg-green-100"
          : "bg-card hover:bg-accent/50 border-border"
      }`}>
      {/* Header with emoji, name, and actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
              isCompleted ? "ring-2 ring-green-300" : ""
            }`}
            style={{ backgroundColor: `${habit.color}20` }}>
            {habit.emoji}
          </div>
          <div className="min-w-0">
            <h4
              className={`font-semibold text-base overflow-ellipsis ${
                isCompleted ? "text-green-800" : ""
              }`}>
              {habit.name}
            </h4>
            {isCompleted && (
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-xs text-green-600 font-medium">
                  ✓ Completed
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isCompleted && (
            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
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
            <div className="flex items-center space-x-2">
              <span>
                {currentProgress}/{habit.targetValue}{" "}
                {habit.targetType?.toLowerCase()}
              </span>
              {isCompleted && (
                <span className="text-green-600 font-medium">✓</span>
              )}
            </div>
          </div>
          <Progress
            value={Math.min((currentProgress / habit.targetValue) * 100, 100)}
            className={`h-2 ${isCompleted ? "bg-green-100" : ""}`}
          />

          {/* Progress Update Section */}
          <div className="flex items-center justify-center">
            {isEditing ? (
              <div className="flex items-center space-x-2 w-full">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="1"
                    max={habit.targetValue - currentProgress}
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                    placeholder="1"
                    className="h-8 text-xs"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleProgressUpdate(progressInput || "1")}
                  disabled={updateProgress.isPending}
                  className="h-8 px-3 text-xs">
                  {updateProgress.isPending ? "..." : "Add"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setProgressInput("");
                  }}
                  className="h-8 px-2 text-xs">
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant={isCompleted ? "default" : "outline"}
                onClick={() => setIsEditing(true)}
                disabled={isCompleted}
                className={`w-full h-8 ${
                  isCompleted
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : ""
                }`}>
                {isCompleted ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Completed
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Progress
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
