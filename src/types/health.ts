export interface HealthData {
  id?: string;
  userId: string;

  // Basic metrics
  weight?: number; // in kg
  height?: number; // in cm
  bmi?: number;

  // Apple Health specific metrics
  steps?: number; // daily step count
  distance?: number; // in meters
  caloriesBurned?: number; // in kcal
  activeEnergy?: number; // in kcal
  restingEnergy?: number; // in kcal

  // Vital signs
  bloodPressure?: string; // e.g., "120/80"
  heartRate?: number; // beats per minute
  bloodOxygen?: number; // percentage
  bodyTemperature?: number; // in celsius

  // Sleep data
  sleepHours?: number; // in hours
  sleepQuality?: string; // e.g., "good", "fair", "poor"

  // Activity data
  exerciseMinutes?: number; // in minutes
  standHours?: number; // in hours

  // Other metrics
  waterIntake?: number; // in ml

  // Metadata
  source?: string; // data source (default: "apple_health")
  notes?: string;
  date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HealthRecord extends HealthData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthStats {
  // Basic averages
  averageWeight?: number;
  averageHeight?: number;
  averageBMI?: number;

  // Apple Health averages
  averageSteps?: number;
  averageDistance?: number;
  averageCaloriesBurned?: number;
  averageActiveEnergy?: number;
  averageRestingEnergy?: number;

  // Vital signs averages
  averageHeartRate?: number;
  averageBloodOxygen?: number;
  averageBodyTemperature?: number;

  // Sleep averages
  averageSleepHours?: number;

  // Activity averages
  averageExerciseMinutes?: number;
  averageStandHours?: number;

  // Trends
  weightTrend?: "increasing" | "decreasing" | "stable";
  stepsTrend?: "increasing" | "decreasing" | "stable";
  sleepTrend?: "increasing" | "decreasing" | "stable";

  // Summary
  recordCount: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

// Apple Health specific data structure
export interface AppleHealthData {
  userId: string;
  date: string; // ISO date string
  steps?: number;
  distance?: number;
  caloriesBurned?: number;
  activeEnergy?: number;
  restingEnergy?: number;
  heartRate?: number;
  bloodOxygen?: number;
  bodyTemperature?: number;
  sleepHours?: number;
  sleepQuality?: string;
  exerciseMinutes?: number;
  standHours?: number;
  waterIntake?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  bloodPressure?: string;
  notes?: string;
}
