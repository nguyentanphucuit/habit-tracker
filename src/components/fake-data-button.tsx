"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Database,
  Calendar,
  Target,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface FakeDataResponse {
  success: boolean;
  message: string;
  data: {
    days: number;
    habits: number;
    progressRecords: number;
    checks: number;
    sampleData: Array<{
      date: string;
      habits: Array<{
        name: string;
        isCompleted: boolean;
        currentProgress: number;
        targetValue: number;
        targetType: string;
      }>;
    }>;
  };
}

export function FakeDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<FakeDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateFakeData = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch("/api/fake-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate fake data");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatProgress = (current: number, target: number, type: string) => {
    if (type === "COUNT") {
      return `${current}/${target}`;
    }
    return `${current}min/${target}min`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Generate Fake Data
          </CardTitle>
          <CardDescription>
            Create realistic sample data for testing your habit tracker. This
            will generate 7 days of data with 7 different habits.
          </CardDescription>
          <p className="text-sm text-red-600 font-medium">
            🚨 TEST: This component is loading!
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={generateFakeData}
            disabled={isLoading}
            className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Generate Fake Data
              </>
            )}
          </Button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {data && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                  <p className="text-2xl font-bold text-blue-700">
                    {data.data.days}
                  </p>
                  <p className="text-sm text-blue-600">Days</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto text-green-600 mb-1" />
                  <p className="text-2xl font-bold text-green-700">
                    {data.data.habits}
                  </p>
                  <p className="text-sm text-green-600">Habits</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Database className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                  <p className="text-2xl font-bold text-purple-700">
                    {data.data.progressRecords}
                  </p>
                  <p className="text-sm text-purple-600">Records</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                  <p className="text-2xl font-bold text-orange-700">
                    {data.data.checks}
                  </p>
                  <p className="text-sm text-orange-600">Checks</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Sample Data Preview</h4>
                {data.data.sampleData.slice(0, 3).map((day, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{day.date}</h5>
                      <Badge variant="outline">
                        {day.habits.length} habits
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {day.habits.slice(0, 4).map((habit, habitIndex) => (
                        <div
                          key={habitIndex}
                          className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{habit.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">
                              {formatProgress(
                                habit.currentProgress,
                                habit.targetValue,
                                habit.targetType
                              )}
                            </span>
                            {habit.isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                      {day.habits.length > 4 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{day.habits.length - 4} more habits
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium">
                  ✅ Fake data generated successfully! You can now view it in
                  your dashboard, history, and stats pages.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
