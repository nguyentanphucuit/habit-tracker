"use client";

import { useHealth } from "@/contexts/health-context";
import { useTimezone } from "@/contexts/timezone-context";
import { getTodayStringInTimezone } from "@/lib/user-timezone";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, TrendingUp, Target } from "lucide-react";
import { HealthData } from "@/types/health";

export function HealthOverview() {
  const { healthData, isLoading } = useHealth();
  const { currentTimezone } = useTimezone();
  const [mounted, setMounted] = useState(false);

  // Only show time after component mounts to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get today's date string in user's selected timezone
  const todayString = useMemo(() => {
    return getTodayStringInTimezone(currentTimezone);
  }, [currentTimezone]);

  // Get today's health data
  const todayData = useMemo(() => {
    if (!healthData || healthData.length === 0) return null;

    const today = getTodayStringInTimezone(currentTimezone);
    return healthData.find((data: HealthData) => data.date === today);
  }, [healthData, currentTimezone]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!healthData || healthData.length === 0) {
      return {
        totalSteps: 0,
        totalCalories: 0,
        totalDistance: 0,
        totalFlights: 0,
      };
    }

    return healthData.reduce(
      (sum: Record<string, number>, day: HealthData) => ({
        totalSteps: (sum.totalSteps || 0) + (day.steps || 0),
        totalCalories: (sum.totalCalories || 0) + (day.caloriesBurned || 0),
        totalDistance: (sum.totalDistance || 0) + (day.distance || 0),
        totalFlights: (sum.totalFlights || 0) + (day.exerciseMinutes || 0),
      }),
      {}
    );
  }, [healthData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!todayData && !summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No health data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Health Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header with timezone info */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Health Overview</h1>
            </div>
          </div>

          {/* Today's Data */}
          {todayData && (
            <div>
              <h4 className="font-medium mb-2">Today</h4>
              <div className="grid grid-cols-2 gap-4">
                {todayData.steps !== undefined && (
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold">
                      {todayData.steps.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Steps</div>
                  </div>
                )}
                {todayData.caloriesBurned !== undefined && (
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold">
                      {todayData.caloriesBurned}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Calories
                    </div>
                  </div>
                )}
                {todayData.sleepHours !== undefined && (
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold">
                      {todayData.sleepHours}h
                    </div>
                    <div className="text-xs text-muted-foreground">Sleep</div>
                  </div>
                )}
                {todayData.heartRate !== undefined && (
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold">
                      {todayData.heartRate}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Heart Rate
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Weekly Summary */}
          {summary && (
            <div>
              <h4 className="font-medium mb-2">This Week</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold">
                    {summary.totalSteps.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Steps
                  </div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold">
                    {summary.totalCalories.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Calories
                  </div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold">
                    {summary.avgSleep.toFixed(1)}h
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Sleep</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
