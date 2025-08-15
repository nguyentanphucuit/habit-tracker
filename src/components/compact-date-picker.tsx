"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  format,
  addDays,
  subDays,
  parseISO,
  isToday,
  isSameDay,
} from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [centerDate, setCenterDate] = useState<Date>(new Date());
  const [dateKey, setDateKey] = useState(0);
  const [isTodayClicked, setIsTodayClicked] = useState(false);
  const [visibleDatesCount, setVisibleDatesCount] = useState(7);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Handle responsive date count updates
  useEffect(() => {
    const updateVisibleDatesCount = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        if (width < 640) setVisibleDatesCount(3); // Mobile: 3 dates
        else if (width < 1024) setVisibleDatesCount(7); // Tablet: 7 dates
        else setVisibleDatesCount(9); // Desktop: 9 dates
      }
    };

    // Set initial count
    updateVisibleDatesCount();

    // Add resize listener
    window.addEventListener("resize", updateVisibleDatesCount);

    // Cleanup
    return () => window.removeEventListener("resize", updateVisibleDatesCount);
  }, []);

  // Initialize selected date from URL params or use today
  useEffect(() => {
    if (initialDate) {
      try {
        const parsedDate = parseISO(initialDate);
        setSelectedDate(parsedDate);
        setCenterDate(parsedDate);
      } catch {
        const today = new Date();
        setSelectedDate(today);
        setCenterDate(today);
      }
    }
  }, [initialDate]);

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
    return Math.floor(
      (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
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

  const datesToShow = Math.floor(visibleDatesCount / 2);

  // Generate dates to display
  const generateVisibleDates = () => {
    const dates = [];

    for (let i = -datesToShow; i <= datesToShow; i++) {
      const date = new Date(centerDate);
      date.setDate(centerDate.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const visibleDates = generateVisibleDates();

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    await updateURL(date);
  };

  const goToPrevious = async () => {
    const newCenterDate = subDays(centerDate, 7);
    setCenterDate(newCenterDate);
    // Also update the selected date to the center of the new range
    const newSelectedDate = new Date(newCenterDate);
    setSelectedDate(newSelectedDate);
    await updateURL(newSelectedDate);
  };

  const goToNext = async () => {
    const newCenterDate = addDays(centerDate, 7);
    setCenterDate(newCenterDate);
    // Also update the selected date to the center of the new range
    const newSelectedDate = new Date(newCenterDate);
    setSelectedDate(newSelectedDate);
    await updateURL(newSelectedDate);
  };

  const goToToday = async () => {
    const today = new Date();
    setSelectedDate(today);
    setCenterDate(today);
    await updateURL(today);
    setDateKey((prev) => prev + 1); // Force re-render
    setIsTodayClicked(true);
    setTimeout(() => setIsTodayClicked(false), 2000);
  };

  const formatFullDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy");
  };

  const formatShortDate = (date: Date) => {
    return format(date, "MMM d");
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      handleDateSelect(date);
    }
  };

  return (
    <div key={dateKey} className="space-y-4">
      {/* Compact Date Picker Section */}
      <div className="space-y-4">
        {/* Date Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              {formatFullDate(selectedDate)}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" side="top">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleCalendarSelect}
                  initialFocus
                  fromDate={subDays(new Date(), 30)}
                  toDate={addDays(new Date(), 30)}
                  defaultMonth={selectedDate}
                  disabled={(date) => {
                    const daysDiff = getDaysDifference(date);
                    return daysDiff < -30 || daysDiff > 30;
                  }}
                />
              </PopoverContent>
            </Popover>
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
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-center space-x-4">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={isPreviousDisabled()}
            className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Date Buttons */}
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
                  {formatShortDate(date)}
                </div>
              </Button>
            ))}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={isNextDisabled()}
            className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
