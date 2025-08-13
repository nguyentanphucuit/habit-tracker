"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HabitWithChecks } from "@/types/habit";
import { useHabits } from "@/contexts/habit-context";
import { EditHabitDialog } from "./edit-habit-dialog";

interface HabitListProps {
  habits: HabitWithChecks[];
}

export function HabitList({ habits }: HabitListProps) {
  const [editingHabit, setEditingHabit] = useState<HabitWithChecks | null>(
    null
  );
  const { deleteHabit } = useHabits();

  const handleDelete = (habit: HabitWithChecks) => {
    if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      deleteHabit(habit.id);
    }
  };

  return (
    <div className="space-y-3">
      {habits.map((habit) => {
        return (
          <div
            key={habit.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3 flex-1">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${habit.color}20` }}>
                {habit.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{habit.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Streak: {habit.currentStreak}</span>
                  <span>•</span>
                  <span>Best: {habit.bestStreak}</span>
                  <span>•</span>
                  <span>{habit.completionRate}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingHabit(habit)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(habit)}
                    className="text-red-600 dark:text-red-400">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}

      {editingHabit && (
        <EditHabitDialog
          habit={editingHabit}
          open={!!editingHabit}
          onOpenChange={() => setEditingHabit(null)}
        />
      )}
    </div>
  );
}
