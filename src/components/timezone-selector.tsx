"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTimezone } from "@/contexts/timezone-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function TimezoneSelector() {
  const { currentTimezone, setTimezone, availableTimezones, isLoading } =
    useTimezone();

  const handleTimezoneChange = (timezoneId: string) => {
    setTimezone(timezoneId);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Timezone Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium mb-2">
              Select Timezone
            </label>
            <Select
              value={currentTimezone.id}
              onValueChange={handleTimezoneChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {availableTimezones.map((timezone) => (
                  <SelectItem key={timezone.id} value={timezone.id}>
                    {timezone.name} ({timezone.utcOffset})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Current timezone: <strong>{currentTimezone.name}</strong>
            </p>
            <p>
              UTC offset: <strong>{currentTimezone.utcOffset}</strong>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
