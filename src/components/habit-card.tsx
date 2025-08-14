"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { HabitWithChecks } from "@/types/habit";
import { useUpdateHabitProgress } from "@/hooks/use-habits";

interface HabitCardProps {
  habit: HabitWithChecks;
}

export function HabitCard({ habit }: HabitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [progressInput, setProgressInput] = useState("");
  const updateProgress = useUpdateHabitProgress();

  const handleProgressUpdate = async (progressToAdd: string) => {
    try {
      const progressValue = parseInt(progressToAdd) || 0;

      await updateProgress.mutateAsync({
        habitId: habit.id,
        progressToAdd: progressValue,
      });

      // Reset editing state
      setIsEditing(false);
      setProgressInput("");
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors mb-3">
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
            <div className="flex items-center space-x-2">
              <span>
                {habit.currentProgress}/{habit.targetValue}{" "}
                {habit.targetType?.toLowerCase()}
              </span>
              {habit.isCompleted && (
                <span className="text-green-600 font-medium">✓</span>
              )}
            </div>
          </div>
          <Progress
            value={Math.min(
              (habit.currentProgress / habit.targetValue) * 100,
              100
            )}
            className={`h-2 ${habit.isCompleted ? "bg-green-100" : ""}`}
          />

          {/* Progress Update Section */}
          <div className="flex items-center justify-center">
            {isEditing ? (
              <div className="flex items-center space-x-2 w-full">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="1"
                    max={habit.targetValue - habit.currentProgress}
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
                variant={habit.isCompleted ? "default" : "outline"}
                onClick={() => setIsEditing(true)}
                disabled={habit.isCompleted}
                className={`w-full h-8 ${
                  habit.isCompleted
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : ""
                }`}>
                {habit.isCompleted ? (
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
