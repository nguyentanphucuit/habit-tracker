"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { HabitWithChecks } from "@/types/habit";
import { useHabits } from "@/contexts/habit-context";

interface HabitCardProps {
  habit: HabitWithChecks;
}

export function HabitCard({ habit }: HabitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [progressInput, setProgressInput] = useState("");
  const { updateHabit } = useHabits();

  const handleProgressUpdate = async (newProgress: string) => {
    try {
      const response = await fetch(`/api/habits/${habit.id}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentProgress: parseInt(newProgress) || 0 }),
      });

      if (response.ok) {
        // Update local state through context
        updateHabit(habit.id, { currentProgress: parseInt(newProgress) || 0 });

        // Reset editing state
        setIsEditing(false);
        setProgressInput("");
      }
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
            <span>
              {habit.currentProgress}/{habit.targetValue}{" "}
              {habit.targetType?.toLowerCase()}
            </span>
          </div>
          <Progress
            value={(habit.currentProgress / habit.targetValue) * 100}
            className="h-2"
          />

          {/* Progress Update Section */}
          <div className="flex items-center justify-center">
            {isEditing ? (
              <div className="flex items-center space-x-2 w-full">
                <Input
                  type="number"
                  min="0"
                  max={habit.targetValue}
                  value={progressInput}
                  onChange={(e) => setProgressInput(e.target.value)}
                  placeholder={`0-${habit.targetValue}`}
                  className="h-8 text-xs flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => handleProgressUpdate(progressInput || "0")}
                  className="h-8 px-2 text-xs">
                  ✓
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
                variant={
                  habit.currentProgress === habit.targetValue - 1
                    ? "default"
                    : "outline"
                }
                onClick={() => setIsEditing(true)}
                className={`w-full h-8 ${
                  habit.currentProgress === habit.targetValue - 1
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : ""
                }`}>
                {habit.currentProgress === habit.targetValue - 1 ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
