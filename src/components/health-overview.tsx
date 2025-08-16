"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHealth } from "@/contexts/health-context";

export function HealthOverview() {
  const { healthData, isLoading } = useHealth();

  // Get today's health data
  const todayData = useMemo(() => {
    if (healthData.length === 0) return null;

    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    return healthData.find((data) => {
      const dataDate = new Date(data.date);
      const dataDateString = dataDate.toISOString().split("T")[0];
      return dataDateString === todayString;
    });
  }, [healthData]);

  // Get weekly summary
  const weeklySummary = useMemo(() => {
    if (healthData.length === 0) return null;

    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekData = healthData.filter((data) => {
      const dataDate = new Date(data.date);
      return dataDate >= sevenDaysAgo && dataDate <= today;
    });

    if (weekData.length === 0) return null;

    const totalSteps = weekData.reduce((sum, day) => sum + (day.steps || 0), 0);
    const totalCalories = weekData.reduce(
      (sum, day) => sum + (day.caloriesBurned || 0),
      0
    );
    const avgSleep =
      weekData.reduce((sum, day) => sum + (day.sleepHours || 0), 0) /
      weekData.length;

    return {
      totalSteps,
      totalCalories,
      avgSleep,
      daysWithData: weekData.length,
    };
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

  if (!todayData && !weeklySummary) {
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
          {weeklySummary && (
            <div>
              <h4 className="font-medium mb-2">This Week</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold">
                    {weeklySummary.totalSteps.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Steps
                  </div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold">
                    {weeklySummary.totalCalories.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Calories
                  </div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold">
                    {weeklySummary.avgSleep.toFixed(1)}h
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
