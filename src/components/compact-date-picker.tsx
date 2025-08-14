"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  format,
  addDays,
  subDays,
  isToday,
  isSameDay,
  parseISO,
} from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

interface CompactDatePickerProps {
  onDateChange?: (date: Date) => void;
  initialDate?: string; // ISO date string from URL params
}

export function CompactDatePicker({
  onDateChange,
  initialDate,
}: CompactDatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isTodayClicked, setIsTodayClicked] = useState(false);
  const [dateKey, setDateKey] = useState(0); // Force re-render key

  // Initialize selected date from URL params or use today
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialDate) {
      try {
        return parseISO(initialDate);
      } catch {
        return new Date();
      }
    }
    return new Date();
  });

  const [centerDate, setCenterDate] = useState(() => {
    if (initialDate) {
      try {
        return parseISO(initialDate);
      } catch {
        return new Date();
      }
    }
    return new Date();
  });

  // Update URL when date changes
  const updateURL = async (date: Date) => {
    const params = new URLSearchParams(searchParams);

    // Use local date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    console.log("updateURL - Updating URL with date:", dateString);
    console.log("updateURL - Current searchParams:", searchParams.toString());
    params.set("date", dateString);
    const newURL = `?${params.toString()}`;
    console.log("updateURL - New URL:", newURL);

    // Wait for the router to complete navigation
    await router.push(newURL, { scroll: false });

    // Call onDateChange after URL is updated
    onDateChange?.(date);
  };

  // Helper function to calculate days difference from today
  const getDaysDifference = (date: Date) => {
    const today = new Date();
    return Math.floor(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  // Helper function to check if previous button should be disabled
  const isPreviousDisabled = () => {
    return getDaysDifference(centerDate) <= -30;
  };

  // Helper function to check if next button should be disabled
  const isNextDisabled = () => {
    return getDaysDifference(centerDate) >= 30;
  };

  // Generate the 7 visible dates around the center date
  const getVisibleDates = () => {
    const dates: Date[] = [];

    // Generate 7 dates: 3 before center date, center date, 3 after center date
    for (let i = -3; i <= 3; i++) {
      dates.push(addDays(centerDate, i));
    }

    return dates;
  };

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    await updateURL(date);
  };

  const goToPrevious = async () => {
    const newCenterDate = subDays(centerDate, 7);
    setCenterDate(newCenterDate);
    setSelectedDate(newCenterDate);
    await updateURL(newCenterDate);
  };

  const goToNext = async () => {
    const newCenterDate = addDays(centerDate, 7);
    setCenterDate(newCenterDate);
    setSelectedDate(newCenterDate);
    await updateURL(newCenterDate);
  };

  const goToToday = async () => {
    const today = new Date();
    console.log("goToToday - Today's date:", today);
    console.log("goToToday - Current selectedDate:", selectedDate);
    console.log("goToToday - Current centerDate:", centerDate);

    // Always update the URL even if we're already on today's date
    // This ensures the URL reflects the current date
    setSelectedDate(today);
    setCenterDate(today);

    // Force URL update
    await updateURL(today);

    // Force re-render
    setDateKey((prev) => prev + 1);

    // Show visual feedback
    setIsTodayClicked(true);
    setTimeout(() => setIsTodayClicked(false), 1000);
  };

  const formatDateDisplay = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    }
    return format(date, "MMM d");
  };

  const formatFullDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy");
  };

  const visibleDates = getVisibleDates();

  return (
    <div key={dateKey} className="space-y-4">
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            {formatFullDate(selectedDate)}
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className={`text-xs ${
            isTodayClicked ? "bg-green-100 border-green-300" : ""
          }`}>
          {isTodayClicked ? "✓ Today" : "Go to Today"}
        </Button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center space-x-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={isPreviousDisabled()}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {/* 7 Date Buttons */}
        <div className="flex items-center space-x-1">
          {visibleDates.map((date, index) => (
            <Button
              key={index}
              variant={isSameDay(date, selectedDate) ? "default" : "outline"}
              size="sm"
              className={`h-9 w-16 ${
                isToday(date) ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => handleDateSelect(date)}>
              <div className="text-sm font-semibold">
                {formatDateDisplay(date)}
              </div>
            </Button>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={isNextDisabled()}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
