"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useHabits } from "@/contexts/habit-context";
import { FREQUENCY_OPTIONS, DAYS_OF_WEEK, HABIT_COLORS } from "@/types/habit";
import { getEmojiSuggestions } from "@/lib/habit-utils";
import { getToday } from "@/lib/habit-utils";
import { DEFAULT_HABIT_FORM_DATA } from "@/lib/default-data";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddHabitDialog({ open, onOpenChange }: AddHabitDialogProps) {
  const { addHabit } = useHabits();
  const [formData, setFormData] = useState(DEFAULT_HABIT_FORM_DATA);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    addHabit({
      ...formData,
      startDate: getToday(),
    });

    // Reset form
    setFormData(DEFAULT_HABIT_FORM_DATA);

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
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track. You can customize the frequency and
            appearance.
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Type</Label>
              <Select
                value={formData.targetType}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, targetType: value }))
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COUNT">Count</SelectItem>
                  <SelectItem value="MINUTES">Minutes</SelectItem>
                  <SelectItem value="BOOLEAN">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Value</Label>
              <Input
                type="number"
                min="1"
                value={formData.targetValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetValue: parseInt(e.target.value) || 1,
                  }))
                }
                placeholder="e.g., 30"
                required
              />
            </div>
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
            <Button type="submit">Create Habit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
