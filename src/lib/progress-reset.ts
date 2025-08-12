import { PrismaClient } from "@prisma/client";
import { startOfDay } from "date-fns";
import { saveDailyProgressSnapshot } from "./daily-progress-service";

const prisma = new PrismaClient();

export async function checkAndResetDailyProgress() {
  try {
    const today = startOfDay(new Date());

    // Get all users with active habits
    const users = await prisma.user.findMany({
      where: {
        habits: {
          some: {
            active: true,
          },
        },
      },
      select: {
        id: true,
      },
    });

    for (const user of users) {
      // Save daily progress snapshot before resetting
      await saveDailyProgressSnapshot(user.id);

      // Reset current progress for all active habits
      await prisma.habit.updateMany({
        where: {
          userId: user.id,
          active: true,
        },
        data: {
          currentProgress: 0,
          isCompleted: false,
          lastUpdated: new Date(),
          lastResetDate: today,
        },
      });
    }

    console.log(`✅ Daily progress reset completed for ${users.length} users`);
  } catch (error) {
    console.error("❌ Error resetting daily progress:", error);
  }
}

export function calculateCompletionStatus(
  progress: number,
  target: number,
  type: string
): boolean {
  if (type === "BOOLEAN") {
    return progress >= 1;
  }
  return progress >= target;
}

export async function checkWeeklyProgressReset() {
  // TODO: Implement weekly progress reset logic
  console.log("Weekly progress reset not yet implemented");
}
