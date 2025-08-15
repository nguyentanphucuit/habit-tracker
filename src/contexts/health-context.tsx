"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { HealthData, HealthListResponse } from "@/types/health";
import { DEFAULT_USER } from "@/lib/default-data";

interface HealthContextType {
  healthData: HealthData[];
  isLoading: boolean;
  error: string | null;
  fetchHealthData: (startDate?: string, endDate?: string) => Promise<void>;
  addHealthData: (data: Partial<HealthData>) => Promise<void>;
  refreshData: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
};

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = useCallback(
    async (startDate?: string, endDate?: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          userId: DEFAULT_USER.id,
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          source: "apple_health",
        });

        const response = await fetch(`/api/health?${params}`);
        if (response.ok) {
          const data: HealthListResponse = await response.json();
          if (data.success) {
            setHealthData(data.data);
          } else {
            setError("Failed to fetch health data");
          }
        } else {
          setError("Failed to fetch health data");
        }
      } catch (error) {
        console.error("Error fetching health data:", error);
        setError("Failed to fetch health data");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const addHealthData = useCallback(
    async (data: Partial<HealthData>) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/health", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: DEFAULT_USER.id,
            ...data,
            source: "apple_health",
          }),
        });

        if (response.ok) {
          // Refresh the data after adding
          await fetchHealthData();
        } else {
          setError("Failed to add health data");
        }
      } catch (error) {
        console.error("Error adding health data:", error);
        setError("Failed to add health data");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchHealthData]
  );

  const refreshData = useCallback(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Load initial data
  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  return (
    <HealthContext.Provider
      value={{
        healthData,
        isLoading,
        error,
        fetchHealthData,
        addHealthData,
        refreshData,
      }}>
      {children}
    </HealthContext.Provider>
  );
};
