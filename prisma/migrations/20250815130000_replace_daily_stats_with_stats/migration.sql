-- Drop the old DailyStats table and create new Stats table
-- This migration replaces the old daily stats schema with the new unified stats schema

-- First, drop the old table (data will be lost, but stats are calculated on-demand now)
DROP TABLE IF EXISTS "DailyStats";

-- Create the new Stats table
CREATE TABLE "Stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "totalHabits" INTEGER NOT NULL DEFAULT 0,
    "sevenDayRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "bestDay" JSONB,
    "worstDay" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("id")
);

-- Create indexes for the new table
CREATE INDEX "Stats_userId_idx" ON "Stats"("userId");
CREATE INDEX "Stats_date_idx" ON "Stats"("date");
CREATE INDEX "Stats_sevenDayRate_idx" ON "Stats"("sevenDayRate");
CREATE INDEX "Stats_bestStreak_idx" ON "Stats"("bestStreak");

-- Create unique constraint
CREATE UNIQUE INDEX "Stats_userId_date_key" ON "Stats"("userId", "date");

-- Add foreign key constraint
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

