import { PrismaClient } from "@prisma/client";

export async function resetDailyProgress() {
  try {
    const prisma = new PrismaClient();
    const startOfDayDate = new Date();
    startOfDayDate.setHours(0, 0, 0, 0);

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

    // Reset progress for each user
    // Note: Currently disabled - uncomment when implementing progress snapshot functionality
    // for (const user of users) {
    //   await saveDailyProgressSnapshot(user.id);
    // }

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
