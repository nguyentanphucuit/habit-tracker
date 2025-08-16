"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime, formatDate } from "@/lib/time";

export function TimezoneDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
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
