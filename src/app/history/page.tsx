"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface HabitData {
  id: string;
  name: string;
  frequency: string;
  targetType: string;
  targetValue: number;
  lastUpdated: string;
}

interface DailyProgress {
  date: string;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  habits: HabitData[];
  habitsById: Record<string, HabitData>;
}

interface HistoryData {
  summary: DailyProgress[];
}

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/history?days=${days}`);
      if (response.ok) {
        const data = await response.json();
        setHistoryData(data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-yellow-500";
    if (rate >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  // Calculate summary stats from the data
  const calculateSummaryStats = () => {
    if (!historyData?.summary || historyData.summary.length === 0) {
      return {
        totalDays: 0,
        averageCompletionRate: 0,
        totalHabits: 0,
        totalCompleted: 0,
      };
    }

    const totalDays = historyData.summary.length;
    const totalHabits = historyData.summary.reduce(
      (sum, day) => sum + day.totalHabits,
      0
    );
    const totalCompleted = historyData.summary.reduce(
      (sum, day) => sum + day.completedHabits,
      0
    );
    const averageCompletionRate =
      totalDays > 0
        ? historyData.summary.reduce(
            (sum, day) => sum + day.completionRate,
            0
          ) / totalDays
        : 0;

    return {
      totalDays,
      averageCompletionRate,
      totalHabits,
      totalCompleted,
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading history...</div>
      </div>
    );
  }

  const summaryStats = calculateSummaryStats();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 Progress History</h1>
        <p className="text-muted-foreground">
          Track your daily habit completion over time
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.averageCompletionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalHabits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Last {days} days</div>
          </CardContent>
        </Card>
      </div>

      {/* Days Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {[7, 14, 30].map((dayCount) => (
            <Button
              key={dayCount}
              variant={days === dayCount ? "default" : "outline"}
              onClick={() => setDays(dayCount)}>
              {dayCount} days
            </Button>
          ))}
        </div>
      </div>

      {/* Daily Progress */}
      {historyData?.summary && historyData.summary.length > 0 ? (
        historyData.summary.map((day) => (
          <Card key={day.date} className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {formatDate(day.date)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {day.completedHabits}/{day.totalHabits} completed
                  </Badge>
                  <Badge className={getProgressColor(day.completionRate)}>
                    {day.completionRate.toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Progress value={day.completionRate} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {day.habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {habit.frequency} • {habit.targetType}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {habit.targetType} • {habit.targetValue}
                      </div>
                      <Badge variant="secondary">{habit.frequency}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              {summaryStats.totalDays === 0
                ? "No history data available yet. Complete some habits to see your progress!"
                : "No data available for the selected time range."}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
