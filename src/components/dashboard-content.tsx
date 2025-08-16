"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { HabitColumns } from "@/components/habit-columns";
import { CompactDatePicker } from "@/components/compact-date-picker";
import { HealthOverview } from "@/components/health-overview";
import { useHabitsWithProgressForDate } from "@/hooks/use-habits";
import { useTimezone } from "@/contexts/timezone-context";
import { getTodayStringInTimezone } from "@/lib/user-timezone";

export function DashboardContent() {
  const searchParams = useSearchParams();
  const { currentTimezone } = useTimezone();
  const [currentDate, setCurrentDate] = useState<string>("");

  // Get date from URL params or use today
  const dateParam = searchParams.get("date");

  // Update current date when URL changes
  useEffect(() => {
    setCurrentDate(dateParam || "");
  }, [dateParam]);

  // Get current date in user's selected timezone
  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(getTodayStringInTimezone(currentTimezone));
    };

    updateDate();
    const timer = setInterval(updateDate, 60 * 1000); // Update every minute

    return () => clearInterval(timer);
  }, [currentTimezone]);

  const selectedDate = useMemo(() => {
    if (currentDate) {
      // If we have a date from URL, use it
      return new Date(currentDate);
    } else {
      // If no date specified, use today in user's timezone
      const todayString = getTodayStringInTimezone(currentTimezone);
      return new Date(todayString);
    }
  }, [currentDate, currentTimezone]);

  // Fetch habits with progress for the selected date
  const {
    data: habitsWithProgress,
    isLoading,
    error,
  } = useHabitsWithProgressForDate(selectedDate);

  // Debug logging - only in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("DashboardContent - Date changed:", dateParam);
      console.log("DashboardContent - Selected date:", selectedDate);
    }
  }, [dateParam, selectedDate]);

  const handleDateChange = (date: Date) => {
    if (process.env.NODE_ENV === "development") {
      console.log("Selected date:", date);
    }
    // The URL will be updated automatically by the CompactDatePicker
    // Data will be refetched automatically due to React Query's dependency tracking
  };

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <CompactDatePicker
        key={currentDate || "today"}
        onDateChange={handleDateChange}
        initialDate={currentDate || undefined}
      />

      {/* Habit Overview */}
      <HabitColumns
        habits={habitsWithProgress}
        selectedDate={selectedDate}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
