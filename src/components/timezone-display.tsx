"use client";

import { useState, useEffect } from "react";
import { DEFAULT_TIMEZONE } from "@/lib/default-data";
import { formatTime, formatDate } from "@/lib/time";

export function TimezoneDisplay() {
  const [currentTime, setCurrentTime] = useState<Date>(
    DEFAULT_TIMEZONE.getCurrentTime()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(DEFAULT_TIMEZONE.getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-sm text-muted-foreground">
      <span className="mr-2">🇻🇳 Vietnam Time:</span>
      <span className="font-mono">
        {formatDate(currentTime)} {formatTime(currentTime)}
      </span>
    </div>
  );
}
