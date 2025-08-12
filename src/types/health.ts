export interface HealthData {
  id?: string;
  userId: string;
  date: string | Date;

  // Basic Metrics
  weight?: number;
  height?: number;
  bmi?: number;

  // Apple Health Specific Metrics
  steps?: number;
  distance?: number;
  caloriesBurned?: number;
  activeEnergy?: number;
  restingEnergy?: number;

  // Vital Signs
  bloodPressure?: string;
  heartRate?: number;
  bloodOxygen?: number;
  bodyTemperature?: number;

  // Sleep Data
  sleepHours?: number;
  sleepQuality?: "good" | "fair" | "poor";

  // Activity Data
  exerciseMinutes?: number;
  standHours?: number;

  // Other Metrics
  waterIntake?: number;
  notes?: string;
  source?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface HealthResponse {
  success: boolean;
  message?: string;
  data: HealthData;
}

export interface HealthListResponse {
  success: boolean;
  data: HealthData[];
  count: number;
}

export interface HealthQueryParams {
  userId: string;
  startDate?: string;
  endDate?: string;
  source?: string;
}
