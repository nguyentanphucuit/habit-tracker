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
    }

    console.log(`✅ Daily progress snapshots saved for ${users.length} users`);
  } catch (error) {
    console.error("❌ Error saving daily progress snapshots:", error);
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
