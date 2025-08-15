"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HabitColumns } from "@/components/habit-columns";
import { CompactDatePicker } from "@/components/compact-date-picker";
import { useHabitsWithProgressForDate } from "@/hooks/use-habits";
import { DEFAULT_TIMEZONE } from "@/lib/default-data";

export function DashboardContent() {
  const searchParams = useSearchParams();
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  // Get date from URL params or use today
  const dateParam = searchParams.get("date");

  // Update current date when URL changes
  useEffect(() => {
    setCurrentDate(dateParam);
  }, [dateParam]);

  const selectedDate = useMemo(() => {
    return currentDate ? new Date(currentDate) : DEFAULT_TIMEZONE.getCurrentTime();
  }, [currentDate]);

  // Fetch habits with progress for the selected date
  const {
    data: habitsWithProgress,
    isLoading,
    error,
    refetch,
  } = useHabitsWithProgressForDate(selectedDate);

  // Debug logging
  useEffect(() => {
    console.log("DashboardContent - Date changed:", dateParam);
    console.log("DashboardContent - Selected date:", selectedDate);
    console.log("DashboardContent - Habits data:", habitsWithProgress);
  }, [dateParam, selectedDate, habitsWithProgress]);

  // Refetch data when date changes
  useEffect(() => {
    if (currentDate) {
      console.log("DashboardContent - Refetching data for date:", currentDate);
      refetch();
    }
  }, [currentDate, refetch]);

  const handleDateChange = (date: Date) => {
    console.log("Selected date:", date);
    // The URL will be updated automatically by the CompactDatePicker
    // Data will be refetched automatically due to the useEffect above
    // No need to force update since the URL change will trigger a re-render
  };

  return (
    <>
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
    </>
  );
}
