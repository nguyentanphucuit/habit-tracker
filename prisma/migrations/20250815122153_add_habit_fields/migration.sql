-- AlterEnum
ALTER TYPE "public"."HabitFrequency" ADD VALUE 'MONTHLY';

-- AlterTable
ALTER TABLE "public"."Habit" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#3b82f6',
ADD COLUMN     "customDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "emoji" TEXT NOT NULL DEFAULT '📝',
ADD COLUMN     "startDate" TEXT NOT NULL DEFAULT '';
