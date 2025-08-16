"use client";

import {
  useMemo,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { HabitWithChecks } from "@/types/habit";
import { DEFAULT_USER } from "@/lib/default-data";
import { getTodayString } from "@/lib/time";

// Helper function to convert date to start of day
function toStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Helper function to get start of day
function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

// Interface for habit data from daily progress
interface DailyProgressHabit {
  id: string;
  name: string;
  frequency: string;
  targetType: string;
  targetValue: number;
  currentProgress: number;
  isCompleted: boolean;
  lastUpdated: Date;
}

interface HeatmapCalendarProps {
  habits?: HabitWithChecks[];
  userId?: string;
}

export interface HeatmapCalendarRef {
  refreshStats: () => void;
}

export const HeatmapCalendar = forwardRef<
  HeatmapCalendarRef,
  HeatmapCalendarProps
>(({ habits, userId = DEFAULT_USER.id }, ref) => {
  // Get daily progress data for the last 30 days
  const [dailyProgress, setDailyProgress] = useState<{
    [date: string]: {
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
      habitsData: Record<string, DailyProgressHabit>;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDailyProgress = async () => {
    try {
      setIsLoading(true);
      // Use default date
      const today = new Date();

      // Create end date at end of day in Vietnam timezone (1 day in the future)
      const endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
        23,
        59,
        59,
        999
      );

      // Calculate start date by going back 29 days in Vietnam timezone
      const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 29
      );

      console.log("🔍 API Request Date Range:", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateFormatted: format(startDate, "yyyy-MM-dd"),
        endDateFormatted: format(endDate, "yyyy-MM-dd"),
        vietnamToday: today.toISOString(),
        localToday: new Date().toISOString(),
        timezoneOffset: today.getTimezoneOffset(),
        vietnamOffset: 7 * 60, // Vietnam is UTC+7
        range: "29 days ago → today → 1 day in future",
      });

      const params = new URLSearchParams({
        userId,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });

      // Fetch directly from daily-progress API to get daily habit data
      const response = await fetch(`/api/daily-progress?${params}`);

      if (response.ok) {
        const data = await response.json();
        console.log("🔍 API Response:", {
          success: data.success,
          dataCount: data.data?.length || 0,
          rawData: data.data,
        });
        console.log(startDate, endDate);

        if (data.success && data.data) {
          // Transform the daily progress data into a date-indexed map
          const progressMap: {
            [date: string]: {
              totalHabits: number;
              completedHabits: number;
              completionRate: number;
              habitsData: Record<string, DailyProgressHabit>;
            };
          } = {};

          data.data.forEach(
            (progress: {
              date: string;
              habitsData: Record<string, DailyProgressHabit>;
            }) => {
              // Parse the date
              const parsedDate = new Date(progress.date);
              const dateStr = format(parsedDate, "yyyy-MM-dd");

              console.log("🔍 Processing Progress Date:", {
                originalDate: progress.date,
                parsedDate: parsedDate.toISOString(),
                formattedDateStr: dateStr,
                habitsCount: Object.keys(progress.habitsData || {}).length,
              });

              const habitsData = progress.habitsData || {};
              const habitsArray = Object.values(habitsData);

              // Filter for DAILY habits only for completion rate
              const dailyHabitsArray = habitsArray.filter(
                (habit: DailyProgressHabit) => habit.frequency === "DAILY"
              );

              const totalHabits = habitsArray.length; // Keep total for display
              const dailyHabits = dailyHabitsArray.length;
              const completedDailyHabits = dailyHabitsArray.filter(
                (habit: DailyProgressHabit) => habit.isCompleted
              ).length;

              // Calculate completion rate based on DAILY habits only
              const completionRate =
                dailyHabits > 0
                  ? (completedDailyHabits / dailyHabits) * 100
                  : 0;

              progressMap[dateStr] = {
                totalHabits,
                completedHabits: completedDailyHabits, // Only daily habits count
                completionRate: Math.round(completionRate * 100) / 100,
                habitsData,
              };
            }
          );

          setDailyProgress(progressMap);
        }
      }
    } catch (error) {
      console.error("Error fetching daily progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyProgress();
  }, [userId]);

  // Add refresh function that can be called externally
  const refreshStats = () => {
    fetchDailyProgress();
  };

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refreshStats,
  }));

  // Helper function to create empty square
  const createEmptySquare = (key: string) => (
    <div
      key={key}
      className="w-7 h-7 rounded border border-border bg-transparent"
    />
  );

  // Create day data for the calendar
  const createDayData = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayProgress = dailyProgress?.[dateStr];

    if (!dayProgress) {
      return {
        date,
        dateStr,
        completionRate: 0,
        eligibleHabits: 0,
        completedHabits: 0,
        totalHabits: 0,
        dailyHabits: 0,
        hasData: false,
        habitsData: null,
      };
    }

    const habitsArray = Object.values(dayProgress.habitsData || {});

    return {
      date,
      dateStr,
      completionRate: dayProgress.completionRate / 100, // Convert percentage to decimal
      eligibleHabits: habitsArray.length,
      completedHabits: dayProgress.completedHabits,
      totalHabits: dayProgress.totalHabits,
      dailyHabits: habitsArray.filter((h) => h.frequency === "DAILY").length,
      hasData: true,
      habitsData: dayProgress.habitsData,
    };
  };

  const calendarData = useMemo(() => {
    // Generate 31 days: 29 days ago + today + 1 day in the future
    const today = new Date();

    // Create dates in Vietnam timezone by manually calculating days
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1 // 1 day in the future
    );

    // Calculate start date by going back 29 days in Vietnam timezone
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 29
    );

    console.log("🔍 Calendar Date Range:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startDateFormatted: format(startDate, "yyyy-MM-dd"),
      endDateFormatted: format(endDate, "yyyy-MM-dd"),
      daysDifference: Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
      vietnamToday: today.toISOString(),
      localToday: new Date().toISOString(),
      range: "29 days ago → today → 1 day in future",
    });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    console.log(
      "🔍 Generated Calendar Days:",
      days.map((day) => format(day, "yyyy-MM-dd"))
    );

    return days.map((date) => createDayData(date));
  }, [dailyProgress]);

  // Remove automatic stats saving - heatmap should only display data
  // Stats are saved when users update their progress, not automatically by the heatmap

  const getColorClass = (completionRate: number) => {
    if (completionRate === 0) return "bg-gray-100 dark:bg-gray-800"; // 0% completion (including no data)
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
        <div className="text-sm text-muted-foreground">
          29 days ago → today → 1 day ahead
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span>Less</span>
          <div className="flex space-x-1">
            <div
              className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded"
              title="0% completion (including no data)"></div>
            <div
              className="w-4 h-4 bg-red-200 dark:bg-red-900 rounded"
              title="1-24% completion"></div>
            <div
              className="w-4 h-4 bg-orange-200 dark:bg-orange-900 rounded"
              title="25-49% completion"></div>
            <div
              className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900 rounded"
              title="50-74% completion"></div>
            <div
              className="w-4 h-4 bg-green-200 dark:bg-green-900 rounded"
              title="75-99% completion"></div>
            <div
              className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded"
              title="100% completion"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-xs text-center text-muted-foreground py-1 font-medium">
              {day}
            </div>
          ))}

          {/* Fill in any missing squares at the beginning to align with weekdays */}
          {(() => {
            const firstDay = calendarData[0]?.date;
            if (firstDay) {
              const dayOfWeek = firstDay.getDay();
              return Array.from({ length: dayOfWeek }, (_, i) =>
                createEmptySquare(`empty-start-${i}`)
              );
            }
            return [];
          })()}

          {calendarData.map((dayData) => (
            <div
              key={dayData.dateStr}
              className={`w-7 h-7 rounded border ${getColorClass(
                dayData.completionRate
              )} 
                       flex items-center justify-center text-xs font-medium transition-colors hover:scale-110 cursor-pointer shadow-sm`}
              title={`${format(dayData.date, "MMM d, yyyy")}
${dayData.completedHabits}/${dayData.dailyHabits} daily habits completed
${Math.round(dayData.completionRate * 100)}% daily completion rate
Last updated: ${
                dayData.habitsData && Object.values(dayData.habitsData)[0]
                  ? new Date(
                      Object.values(dayData.habitsData)[0].lastUpdated
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"
              }`}
            />
          ))}

          {/* Fill in any missing squares at the end to complete the grid */}
          {(() => {
            const totalSquares =
              7 * Math.ceil((weekDays.length + calendarData.length) / 7);
            const currentSquares = weekDays.length + calendarData.length;
            const remainingSquares = totalSquares - currentSquares;

            return Array.from({ length: remainingSquares }, (_, i) =>
              createEmptySquare(`empty-end-${i}`)
            );
          })()}
        </div>
      </div>
    </div>
  );
});

HeatmapCalendar.displayName = "HeatmapCalendar";
