-- CreateTable
CREATE TABLE "public"."DailyStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "totalHabits" INTEGER NOT NULL DEFAULT 0,
    "dailyHabits" INTEGER NOT NULL DEFAULT 0,
    "completedHabits" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyStats_userId_idx" ON "public"."DailyStats"("userId");

-- CreateIndex
CREATE INDEX "DailyStats_date_idx" ON "public"."DailyStats"("date");

-- CreateIndex
CREATE INDEX "DailyStats_completionRate_idx" ON "public"."DailyStats"("completionRate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_userId_date_key" ON "public"."DailyStats"("userId", "date");

-- AddForeignKey
ALTER TABLE "public"."DailyStats" ADD CONSTRAINT "DailyStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
