"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitStats } from "@/types/habit";

interface StatsOverviewProps {
  stats: HabitStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHabits}</div>
          <p className="text-xs text-muted-foreground">Active habits</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">7-Day Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.sevenDayRate}%</div>
          <p className="text-xs text-muted-foreground">Weekly completion</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.bestStreak}</div>
          <p className="text-xs text-muted-foreground">Longest streak</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.bestDay ? `${stats.bestDay.completionRate}%` : "-"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.bestDay ? stats.bestDay.date : "Most productive"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Worst Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.worstDay ? `${stats.worstDay.completionRate}%` : "-"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.worstDay ? stats.worstDay.date : "Least productive"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
