"use client";

import { useMemo } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { HabitWithChecks } from "@/types/habit";
import { isDateEligible } from "@/lib/habit-utils";

interface HeatmapCalendarProps {
  habits: HabitWithChecks[];
}

export function HeatmapCalendar({ habits }: HeatmapCalendarProps) {
  const calendarData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 55); // 8 weeks

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const eligibleHabits = habits.filter((habit) =>
        isDateEligible(habit, dateStr)
      );
      const completedHabits = eligibleHabits.filter((habit) => {
        const check = habit.checks.find((c) => c.date === dateStr);
        return check?.completed;
      });

      const completionRate =
        eligibleHabits.length > 0
          ? completedHabits.length / eligibleHabits.length
          : 0;

      return {
        date,
        dateStr,
        completionRate,
        eligibleHabits: eligibleHabits.length,
        completedHabits: completedHabits.length,
      };
    });
  }, [habits]);

  const getColorClass = (completionRate: number) => {
    if (completionRate === 0) return "bg-gray-100 dark:bg-gray-800";
    if (completionRate < 0.25) return "bg-red-200 dark:bg-red-900";
    if (completionRate < 0.5) return "bg-orange-200 dark:bg-orange-900";
    if (completionRate < 0.75) return "bg-yellow-200 dark:bg-yellow-900";
    if (completionRate < 1) return "bg-green-200 dark:bg-green-900";
    return "bg-green-500 dark:bg-green-600";
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">Last 8 weeks</div>
        <div className="flex items-center space-x-2 text-xs">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
            <div className="w-3 h-3 bg-red-200 dark:bg-red-900 rounded-sm"></div>
            <div className="w-3 h-3 bg-orange-200 dark:bg-orange-900 rounded-sm"></div>
            <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-900 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-xs text-center text-muted-foreground py-1">
            {day}
          </div>
        ))}

        {calendarData.map((dayData) => (
          <div
            key={dayData.dateStr}
            className={`w-8 h-8 rounded-sm border border-border ${getColorClass(
              dayData.completionRate
            )} 
                       flex items-center justify-center text-xs transition-colors hover:scale-110 cursor-pointer`}
            title={`${format(dayData.date, "MMM d, yyyy")}
${dayData.completedHabits}/${dayData.eligibleHabits} habits completed
${Math.round(dayData.completionRate * 100)}% completion rate`}
          />
        ))}
      </div>
    </div>
  );
}
