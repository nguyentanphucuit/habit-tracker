"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeatmapCalendar } from "./heatmap-calendar";
import { StatsOverview } from "./stats-overview";
import { useMemo, useState, useEffect } from "react";
import {
  DEFAULT_HABIT_STATS,
  DEFAULT_STATS_DATA,
  DEFAULT_USER,
} from "@/lib/default-data";

interface StatsData {
  totalHabits: number;
  sevenDayRate: number;
  bestStreak: number;
  bestDay: {
    date: string;
    completionRate: number;
    completedHabits: number;
    totalHabits: number;
  } | null;
  worstDay: {
    date: string;
    completionRate: number;
    completedHabits: number;
    totalHabits: number;
  } | null;
  lastUpdated: Date;
}

export function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/stats", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: DEFAULT_USER.id,
            days: 30,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const result = await response.json();

        // If no data exists, use default values
        if (!result.data || result.data.totalHabits === 0) {
          setStats(DEFAULT_STATS_DATA as StatsData);
        } else {
          setStats(result.data);
        }

        // Refresh the heatmap
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch stats"
        );
        console.error("Error fetching stats:", error);

        // Use default values on error
        setStats(DEFAULT_STATS_DATA as StatsData);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Transform stats for StatsOverview component
  const statsForOverview = useMemo(() => {
    if (!stats) {
      return DEFAULT_HABIT_STATS;
    }

    return {
      ...DEFAULT_HABIT_STATS,
      totalHabits: stats.totalHabits,
      sevenDayRate: Math.round(stats.sevenDayRate),
      bestStreak: stats.bestStreak,
      bestDay: stats.bestDay,
      worstDay: stats.worstDay,
      lastUpdated: stats.lastUpdated,
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-lg font-medium text-muted-foreground">
            Loading statistics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 text-red-500">⚠️</div>
          <p className="text-lg font-medium text-red-600 mb-2">
            Error loading statistics
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">
          Track your progress and analyze your habits
        </p>
      </div>

      <StatsOverview stats={statsForOverview} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your daily habit completion over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HeatmapCalendar habits={[]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>
              Overall statistics from the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  7-Day Completion Rate
                </span>
                <Badge variant="secondary">
                  {Math.round(stats?.sevenDayRate || 0)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Best Streak
                </span>
                <Badge variant="secondary">{stats?.bestStreak || 0} days</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Habits
                </span>
                <Badge variant="secondary">
                  {stats?.totalHabits || 0} habits
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best Day</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800">
                  {stats?.bestDay
                    ? `${stats.bestDay.date} (${Math.round(
                        stats.bestDay.completionRate
                      )}%)`
                    : "None"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Worst Day</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {stats?.worstDay
                    ? `${stats.worstDay.date} (${Math.round(
                        stats.worstDay.completionRate
                      )}%)`
                    : "None"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Last Updated
                </span>
                <Badge variant="secondary">
                  {stats
                    ? new Date(stats.lastUpdated).toLocaleDateString()
                    : "Never"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
