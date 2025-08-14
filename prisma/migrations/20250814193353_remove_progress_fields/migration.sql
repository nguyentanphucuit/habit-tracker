-- CreateEnum
CREATE TYPE "public"."HabitFrequency" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "public"."TargetType" AS ENUM ('COUNT', 'MINUTES', 'BOOLEAN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Habit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" "public"."HabitFrequency" NOT NULL,
    "targetType" "public"."TargetType" NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DailyProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "habitsData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HabitCheck" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "timestamp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabitCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Health" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "steps" INTEGER,
    "distance" INTEGER,
    "caloriesBurned" INTEGER,
    "activeEnergy" INTEGER,
    "restingEnergy" INTEGER,
    "bloodPressure" TEXT,
    "heartRate" INTEGER,
    "bloodOxygen" DOUBLE PRECISION,
    "bodyTemperature" DOUBLE PRECISION,
    "sleepHours" DOUBLE PRECISION,
    "sleepQuality" TEXT,
    "exerciseMinutes" INTEGER,
    "standHours" INTEGER,
    "waterIntake" INTEGER,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'apple_health',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Health_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Habit_userId_idx" ON "public"."Habit"("userId");

-- CreateIndex
CREATE INDEX "Habit_active_idx" ON "public"."Habit"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Habit_userId_name_key" ON "public"."Habit"("userId", "name");

-- CreateIndex
CREATE INDEX "DailyProgress_userId_idx" ON "public"."DailyProgress"("userId");

-- CreateIndex
CREATE INDEX "DailyProgress_date_idx" ON "public"."DailyProgress"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyProgress_userId_date_key" ON "public"."DailyProgress"("userId", "date");

-- CreateIndex
CREATE INDEX "HabitCheck_habitId_idx" ON "public"."HabitCheck"("habitId");

-- CreateIndex
CREATE INDEX "HabitCheck_userId_idx" ON "public"."HabitCheck"("userId");

-- CreateIndex
CREATE INDEX "HabitCheck_date_idx" ON "public"."HabitCheck"("date");

-- CreateIndex
CREATE INDEX "HabitCheck_completed_idx" ON "public"."HabitCheck"("completed");

-- CreateIndex
CREATE INDEX "Health_userId_idx" ON "public"."Health"("userId");

-- CreateIndex
CREATE INDEX "Health_date_idx" ON "public"."Health"("date");

-- CreateIndex
CREATE INDEX "Health_source_idx" ON "public"."Health"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Health_userId_date_key" ON "public"."Health"("userId", "date");

-- AddForeignKey
ALTER TABLE "public"."Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DailyProgress" ADD CONSTRAINT "DailyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HabitCheck" ADD CONSTRAINT "HabitCheck_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HabitCheck" ADD CONSTRAINT "HabitCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Health" ADD CONSTRAINT "Health_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
