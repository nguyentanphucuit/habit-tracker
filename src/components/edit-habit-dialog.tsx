"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHabits } from "@/contexts/habit-context";
import {
  HabitWithChecks,
  FREQUENCY_OPTIONS,
  DAYS_OF_WEEK,
  HABIT_COLORS,
} from "@/types/habit";
import { getEmojiSuggestions } from "@/lib/habit-utils";

interface EditHabitDialogProps {
  habit: HabitWithChecks;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Default empty habit object (constant, not a function)
const DEFAULT_HABIT: HabitWithChecks = {
  id: "",
  name: "",
  emoji: "🎯",
  color: "#ef4444",
  frequency: "daily",
  startDate: new Date().toISOString().split("T")[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  targetValue: 1,
  targetType: "COUNT",
  checks: [],
  currentStreak: 0,
  bestStreak: 0,
  completionRate: 0,
};

export function EditHabitDialog({
  habit,
  open,
  onOpenChange,
}: EditHabitDialogProps) {
  const { updateHabit } = useHabits();

  // Use the actual habit or default to empty habit
  const currentHabit = habit || DEFAULT_HABIT;

  const [formData, setFormData] = useState({
    name: currentHabit.name,
    emoji: currentHabit.emoji,
    color: currentHabit.color,
    frequency: currentHabit.frequency,
    customDays: currentHabit.customDays || [],
    targetValue: currentHabit.targetValue,
    targetType: currentHabit.targetType,
  });

  useEffect(() => {
    setFormData({
      name: currentHabit.name,
      emoji: currentHabit.emoji,
      color: currentHabit.color,
      frequency: currentHabit.frequency,
      customDays: currentHabit.customDays || [],
      targetValue: currentHabit.targetValue,
      targetType: currentHabit.targetType,
    });
  }, [currentHabit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    updateHabit(currentHabit.id, formData);
    onOpenChange(false);
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter((d) => d !== day)
        : [...prev.customDays, day],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Modify your habit settings and appearance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Drink water, Read, Exercise"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Emoji</Label>
              <div className="grid grid-cols-5 gap-2">
                {getEmojiSuggestions().map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, emoji }))}
                    className={`w-10 h-10 rounded-lg border-2 text-lg transition-colors ${
                      formData.emoji === emoji
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-full border-2 transition-colors ${
                      formData.color === color
                        ? "border-primary scale-110"
                        : "border-border hover:border-primary/50"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: "daily" | "weekly" | "monthly") =>
                setFormData((prev) => ({ ...prev, frequency: value }))
              }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.frequency === "weekly" && (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <div className="flex space-x-1">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`w-10 h-10 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.customDays.includes(day.value)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}>
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
