"use client";

import { useHealth } from "@/contexts/health-context";
import { useTimezone } from "@/contexts/timezone-context";
import { getTodayStringInTimezone } from "@/lib/user-timezone";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Heart,
  Activity,
  TrendingUp,
  Target,
} from "lucide-react";
import { HealthData } from "@/types/health";

export default function HealthPage() {
  const { healthData, isLoading, addHealthData, fetchHealthData } = useHealth();
  const { currentTimezone } = useTimezone();
  const [mounted, setMounted] = useState(false);

  // Only show time after component mounts to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the last 7 days of data
  const last7Days = useMemo(() => {
    if (!healthData || !Array.isArray(healthData) || healthData.length === 0) {
      return [];
    }

    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return healthData
      .filter((data) => {
        const dataDate = new Date(data.date);
        return dataDate >= sevenDaysAgo && dataDate <= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [healthData]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!last7Days || last7Days.length === 0) return null;

    const totalSteps = last7Days.reduce(
      (sum, day) => sum + (day.steps || 0),
      0
    );
    const totalCalories = last7Days.reduce(
      (sum, day) => sum + (day.caloriesBurned || 0),
      0
    );
    const totalSleep = last7Days.reduce(
      (sum, day) => sum + (day.sleepHours || 0),
      0
    );
    const totalExercise = last7Days.reduce(
      (sum, day) => sum + (day.exerciseMinutes || 0),
      0
    );

    const avgSteps = totalSteps / last7Days.length;
    const avgCalories = totalCalories / last7Days.length;
    const avgSleep = totalSleep / last7Days.length;
    const avgExercise = totalExercise / last7Days.length;

    return {
      totalSteps,
      totalCalories,
      totalSleep,
      totalExercise,
      avgSteps,
      avgCalories,
      avgSleep,
      avgExercise,
    };
  }, [last7Days]);

  // Get latest health data
  const latestData = useMemo(() => {
    if (!healthData || !Array.isArray(healthData) || healthData.length === 0)
      return null;
    return healthData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }, [healthData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getMetricValue = (data: HealthData, metric: string) => {
    switch (metric) {
      case "steps":
        return data.steps || 0;
      case "calories":
        return data.caloriesBurned || 0;
      case "sleep":
        return data.sleepHours || 0;
      case "exercise":
        return data.exerciseMinutes || 0;
      case "heartRate":
        return data.heartRate || 0;
      case "weight":
        return data.weight || 0;
      default:
        return 0;
    }
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case "steps":
        return "steps";
      case "calories":
        return "kcal";
      case "sleep":
        return "hours";
      case "exercise":
        return "min";
      case "heartRate":
        return "bpm";
      case "weight":
        return "kg";
      default:
        return "";
    }
  };

  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case "steps":
        if (value >= 10000) return "bg-green-500";
        if (value >= 8000) return "bg-yellow-500";
        return "bg-red-500";
      case "sleep":
        if (value >= 7) return "bg-green-500";
        if (value >= 6) return "bg-yellow-500";
        return "bg-red-500";
      case "exercise":
        if (value >= 30) return "bg-green-500";
        if (value >= 20) return "bg-yellow-500";
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading health data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header with timezone info */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Health</h1>
        </div>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Steps (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryStats.avgSteps.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {summaryStats.totalSteps.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Calories (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryStats.avgCalories.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {summaryStats.totalCalories.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Sleep (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryStats.avgSleep.toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {summaryStats.totalSleep.toFixed(1)}h
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Exercise (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryStats.avgExercise.toFixed(0)}m
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {summaryStats.totalExercise.toFixed(0)}m
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Data Message */}
      {healthData.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              No health data available yet. Connect your Apple Health app to see
              your wellness metrics!
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <Button onClick={() => fetchHealthData()} variant="outline">
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
