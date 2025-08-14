"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isToday, isSameDay } from "date-fns";
import { HabitWithChecks } from "@/types/habit";

interface CompactDatePickerProps {
  habits: HabitWithChecks[];
  onDateChange?: (date: Date) => void;
}

export function CompactDatePicker({
  habits,
  onDateChange,
}: CompactDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [centerDate, setCenterDate] = useState(new Date());

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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateChange?.(date);
  };

  const goToPrevious = () => {
    // Always update state, let the disabled prop handle the interaction
    const newCenterDate = subDays(centerDate, 7);
    setCenterDate(newCenterDate);
    setSelectedDate(newCenterDate);
  };

  const goToNext = () => {
    // Always update state, let the disabled prop handle the interaction
    const newCenterDate = addDays(centerDate, 7);
    setCenterDate(newCenterDate);
    setSelectedDate(newCenterDate);
  };

  const formatDateDisplay = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    }
    return format(date, "MMM d");
  };

  const visibleDates = getVisibleDates();

  return (
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
  );
}
