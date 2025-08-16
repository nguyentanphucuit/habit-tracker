"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserTimezone,
  getDefaultTimezone,
  getTimezoneById,
  USER_TIMEZONES,
} from "@/lib/user-timezone";

interface TimezoneContextType {
  currentTimezone: UserTimezone;
  setTimezone: (timezoneId: string) => void;
  availableTimezones: UserTimezone[];
  isLoading: boolean;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(
  undefined
);

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error("useTimezone must be used within a TimezoneProvider");
  }
  return context;
};

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTimezone, setCurrentTimezone] = useState<UserTimezone>(
    getDefaultTimezone()
  );
  const [isLoading, setIsLoading] = useState(false);

  // Load saved timezone from localStorage and API on mount
  useEffect(() => {
    const loadUserTimezone = async () => {
      try {
        // First try to get from localStorage
        const savedTimezoneId = localStorage.getItem("user-timezone");
        if (savedTimezoneId) {
          const savedTimezone = getTimezoneById(savedTimezoneId);
          if (savedTimezone) {
            setCurrentTimezone(savedTimezone);
          }
        }

        // Then try to get from API
        const response = await fetch("/api/user/timezone");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.timezone) {
            const apiTimezone = getTimezoneById(data.timezone);
            if (apiTimezone) {
              setCurrentTimezone(apiTimezone);
              localStorage.setItem("user-timezone", data.timezone);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load user timezone:", error);
      }
    };

    loadUserTimezone();
  }, []);

  const setTimezone = async (timezoneId: string) => {
    const timezone = getTimezoneById(timezoneId);
    if (timezone) {
      setIsLoading(true);
      try {
        // Update local state
        setCurrentTimezone(timezone);
        localStorage.setItem("user-timezone", timezoneId);

        // Save to API
        const response = await fetch("/api/user/timezone", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ timezone: timezoneId }),
        });

        if (!response.ok) {
          console.error("Failed to save timezone to API");
        }
      } catch (error) {
        console.error("Error saving timezone:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const value: TimezoneContextType = {
    currentTimezone,
    setTimezone,
    availableTimezones: USER_TIMEZONES,
    isLoading,
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
};
