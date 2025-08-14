"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HabitCard } from "./habit-card";
import { HabitWithProgress } from "@/types/habit";
import { format } from "date-fns";
import { Repeat, Calendar, Clock, Target, Loader2 } from "lucide-react";

interface HabitColumnsProps {
  habits?: HabitWithProgress[];
  selectedDate?: Date;
  isLoading?: boolean;
  error?: Error | null;
}

// Helper function to get daily habit counts
const getDailyHabitCounts = (habits: HabitWithProgress[]) => {
  const dailyCompleted = habits.filter(
    (h) => h.frequency === "daily" && h.isCompleted
  ).length;
  const dailyTotal = habits.filter((h) => h.frequency === "daily").length;
  const dailyRemaining = dailyTotal - dailyCompleted;

  return { dailyCompleted, dailyTotal, dailyRemaining };
};

// Helper function to get motivational message
const getMotivationalMessage = (
  dailyCompleted: number,
  dailyTotal: number,
  dailyRemaining: number
) => {
  const completionPercentage =
    dailyTotal > 0 ? (dailyCompleted / dailyTotal) * 100 : 0;

  switch (true) {
    case completionPercentage === 0:
      return {
        message: "🚀 Let's get started!",
        subtitle: `You have ${dailyTotal} daily habits to complete today`,
        color: "text-blue-600",
      };
    case completionPercentage === 100:
      return {
        message: "🎉 AMAZING! You're all done!",
        subtitle: `All ${dailyTotal} daily habits completed today`,
        color: "text-green-600",
      };
    case completionPercentage >= 80:
      return {
        message: "🔥 Almost there!",
        subtitle: `Just ${dailyRemaining} more habit${
          dailyRemaining === 1 ? "" : "s"
        } to go - you've got this!`,
        color: "text-orange-600",
      };
    case completionPercentage >= 50:
      return {
        message: "💪 Great progress!",
        subtitle: `You're halfway there! ${dailyRemaining} habits left to complete today`,
        color: "text-orange-600",
      };
    case completionPercentage >= 25:
      return {
        message: "🌟 Keep going!",
        subtitle: `Good start! ${dailyRemaining} habits left to complete today`,
        color: "text-blue-600",
      };
    default:
      return {
        message: "🌱 Getting started!",
        subtitle: `You've completed ${dailyCompleted} of ${dailyTotal} daily habits`,
        color: "text-blue-600",
      };
  }
};

// Helper function to render empty state
const renderEmptyState = (
  icon: React.ReactNode,
  title: string,
  subtitle: string
) => (
  <div className="text-center py-6 text-muted-foreground">
    <div className="h-8 w-8 mx-auto mb-2 opacity-50">{icon}</div>
    <p className="text-sm">{title}</p>
    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
  </div>
);

// Helper function to render habit column
const renderHabitColumn = (
  title: string,
  icon: React.ReactNode,
  iconColor: string,
  habits: HabitWithProgress[],
  emptyTitle: string,
  emptySubtitle: string,
  selectedDate?: Date
) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center space-x-2 text-lg">
        <div className={`h-5 w-5 ${iconColor}`}>{icon}</div>
        <span>{title}</span>
        <Badge variant="secondary" className="ml-auto">
          {habits.length}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {habits.length === 0
        ? renderEmptyState(icon, emptyTitle, emptySubtitle)
        : habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              selectedDate={selectedDate}
            />
          ))}
    </CardContent>
  </Card>
);

export function HabitColumns({
  habits,
  selectedDate,
  isLoading: externalLoading,
  error: externalError,
}: HabitColumnsProps) {
  const habitsWithChecks = habits || [];
  const activeHabits = habitsWithChecks.filter(
    (habit: HabitWithProgress) => !habit.isCompleted
  );
  const completedHabits = habitsWithChecks.filter(
    (habit: HabitWithProgress) => habit.isCompleted
  );

  const activeDailyHabits = activeHabits.filter(
    (habit: HabitWithProgress) => habit.frequency === "daily"
  );
  const activeWeeklyHabits = activeHabits.filter(
    (habit: HabitWithProgress) => habit.frequency === "weekly"
  );
  const activeMonthlyHabits = activeHabits.filter(
    (habit: HabitWithProgress) => habit.frequency === "monthly"
  );

  // Show loading state if external loading is true
  if (externalLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground">
            Loading habits for{" "}
            {selectedDate
              ? format(selectedDate, "MMMM d, yyyy")
              : "selected date"}
            ...
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  // Show error state if external error is true
  if (externalError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 text-red-500">⚠️</div>
          <p className="text-lg font-medium text-red-600 mb-2">
            Error loading habits
          </p>
          <p className="text-sm text-muted-foreground">
            {externalError instanceof Error
              ? externalError.message
              : "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  // Show empty state if no habits
  if (habitsWithChecks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground">
            {selectedDate ? "No habits for selected date" : "No habits yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {selectedDate
              ? `Try selecting a different date or create some habits for ${format(
                  selectedDate,
                  "MMMM d, yyyy"
                )}`
              : "Create your first habit to start tracking your progress"}
          </p>
        </div>
      </div>
    );
  }

  const { dailyCompleted, dailyTotal, dailyRemaining } =
    getDailyHabitCounts(habitsWithChecks);
  const motivationalMessage = getMotivationalMessage(
    dailyCompleted,
    dailyTotal,
    dailyRemaining
  );

  return (
    <div className="space-y-6">
      {/* Overall Progress Bar */}
      {habitsWithChecks.length > 0 && (
        <Card>
          <CardContent>
            {/* Motivational Message */}
            <div className="text-center mb-4">
              <div
                className={`text-lg font-semibold ${motivationalMessage.color}`}>
                {motivationalMessage.message}
              </div>
              <div className="text-sm text-muted-foreground">
                {motivationalMessage.subtitle}
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  dailyCompleted === dailyTotal
                    ? "bg-green-500"
                    : dailyCompleted > 0
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
                style={{
                  width: `${
                    dailyTotal > 0 ? (dailyCompleted / dailyTotal) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Daily Habits Column */}
        {renderHabitColumn(
          "Daily",
          <Repeat className="h-5 w-5" />,
          "text-blue-500",
          activeDailyHabits,
          "All daily habits completed!",
          "Great job!",
          selectedDate
        )}

        {/* Active Weekly Habits Column */}
        {renderHabitColumn(
          "Weekly",
          <Calendar className="h-5 w-5" />,
          "text-purple-500",
          activeWeeklyHabits,
          "All weekly habits completed!",
          "You're on fire!",
          selectedDate
        )}

        {/* Active Monthly Habits Column */}
        {renderHabitColumn(
          "Monthly",
          <Clock className="h-5 w-5" />,
          "text-orange-500",
          activeMonthlyHabits,
          "All monthly habits completed!",
          "Incredible progress!",
          selectedDate
        )}

        {/* Completed Habits Column */}
        {renderHabitColumn(
          "Completed",
          <div className="h-5 w-5">✓</div>,
          "text-green-500",
          completedHabits,
          "No habits completed yet",
          "Keep working on your goals!",
          selectedDate
        )}
      </div>
    </div>
  );
}
