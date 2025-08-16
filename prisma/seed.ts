import {
  PrismaClient,
  HabitFrequency,
  TargetType,
  Prisma,
} from "@prisma/client";
import { DEFAULT_USER } from "../src/lib/default-data";

const prisma = new PrismaClient();

// Type for habits data in daily progress
interface HabitProgressData {
  id: string;
  name: string;
  frequency: string;
  targetType: string;
  targetValue: number;
  currentProgress: number;
  isCompleted: boolean;
  lastUpdated: Date;
}

interface DailyProgressByHabitId {
  [habitId: string]: HabitProgressData;
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Create default user with fixed ID from defaults
  const user = await prisma.user.upsert({
    where: { id: DEFAULT_USER.id },
    update: {
      email: DEFAULT_USER.email,
      displayName: DEFAULT_USER.displayName,
    },
    create: {
      id: DEFAULT_USER.id,
      email: DEFAULT_USER.email,
      displayName: DEFAULT_USER.displayName,
    },
  });

  console.log("✅ Created/Updated user:", user.email, "with ID:", user.id);

  // Create daily habits with real UUIDs
  const dailyHabits = [
    {
      name: "Uống nước 1.5–2L",
      emoji: "💧",
      color: "#06b6d4",
      frequency: HabitFrequency.DAILY,
      customDays: [],
      startDate: "2025-01-01",
      targetType: TargetType.COUNT,
      targetValue: 8,
    },
    {
      name: "Ăn rau & trái cây",
      emoji: "🥬",
      color: "#22c55e",
      frequency: HabitFrequency.DAILY,
      customDays: [],
      startDate: "2025-01-01",
      targetType: TargetType.COUNT,
      targetValue: 5,
    },
    {
      name: "Tập thể dục ≥ 30 phút",
      emoji: "🏃‍♂️",
      color: "#f97316",
      frequency: HabitFrequency.DAILY,
      customDays: [],
      startDate: "2025-01-01",
      targetType: TargetType.MINUTES,
      targetValue: 30,
    },
    {
      name: "Ngủ trước 23:00",
      emoji: "😴",
      color: "#8b5cf6",
      frequency: HabitFrequency.DAILY,
      customDays: [],
      startDate: "2025-01-01",
      targetType: TargetType.BOOLEAN,
      targetValue: 1,
    },
    {
      name: "Đọc sách ≥ 30 phút",
      emoji: "📚",
      color: "#eab308",
      frequency: HabitFrequency.DAILY,
      customDays: [],
      startDate: "2025-01-01",
      targetType: TargetType.MINUTES,
      targetValue: 30,
    },
  ];

  // Create weekly habits with real UUIDs
  const weeklyHabits = [
    {
      name: "Tập thể dục (số buổi/tuần)",
      emoji: "💪",
      color: "#ef4444",
      frequency: HabitFrequency.WEEKLY,
      customDays: [1, 3, 5], // Monday, Wednesday, Friday
      startDate: "2025-01-01",
      targetType: TargetType.COUNT,
      targetValue: 4,
    },
    {
      name: "Ra ngoài/tiếp xúc thiên nhiên",
      emoji: "🌳",
      color: "#14b8a6",
      frequency: HabitFrequency.WEEKLY,
      customDays: [0, 6], // Sunday, Saturday
      startDate: "2025-01-01",
      targetType: TargetType.COUNT,
      targetValue: 3,
    },
    {
      name: "Hạn chế đồ ngọt (ngày/tuần)",
      emoji: "🍰",
      color: "#ec4899",
      frequency: HabitFrequency.WEEKLY,
      customDays: [2, 4], // Tuesday, Thursday
      startDate: "2025-01-01",
      targetType: TargetType.COUNT,
      targetValue: 6,
    },
  ];

  // Create monthly habits
  const monthlyHabits = [
    {
      name: "Đánh giá tháng",
      emoji: "📊",
      color: "#6366f1",
      frequency: HabitFrequency.MONTHLY,
      customDays: [],
      startDate: "2025-01-01",
      targetType: TargetType.BOOLEAN,
      targetValue: 1,
    },
  ];

  // Combine all habits
  const allHabits = [...dailyHabits, ...weeklyHabits, ...monthlyHabits];

  // Create habits for the default user
  for (const habitData of allHabits) {
    const habit = await prisma.habit.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: habitData.name,
        },
      },
      update: {
        ...habitData,
        userId: user.id,
      },
      create: {
        ...habitData,
        userId: user.id,
      },
    });

    console.log(`✅ Created/Updated habit: ${habit.name} (${habit.frequency})`);
  }

  // Create some sample daily progress data for the past few days
  const today = new Date();
  const sampleDates = [
    new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - 3
      )
    ), // 3 days ago
    new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - 2
      )
    ), // 2 days ago
    new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - 1
      )
    ), // 1 day ago
    new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    ), // today
  ];

  for (const date of sampleDates) {
    const dateString = date.toISOString().split("T")[0];

    // Create sample progress data
    const habitsData: DailyProgressByHabitId = {
      cmecsnek60006lx0top2ayrwa: {
        id: "cmecsnek60006lx0top2ayrwa",
        name: "Tập thể dục ≥ 30 phút",
        frequency: "DAILY",
        targetType: "MINUTES",
        targetValue: 30,
        currentProgress: Math.random() > 0.5 ? 30 : 15,
        isCompleted: Math.random() > 0.5,
        lastUpdated: new Date(),
      },
      cmecsnf4k000alx0tb1gn303k: {
        id: "cmecsnf4k000alx0tb1gn303k",
        name: "Đọc sách ≥ 30 phút",
        frequency: "DAILY",
        targetType: "MINUTES",
        targetValue: 30,
        currentProgress: Math.random() > 0.5 ? 30 : 20,
        isCompleted: Math.random() > 0.5,
        lastUpdated: new Date(),
      },
    };

    await prisma.dailyProgress.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: date,
        },
      },
      update: {
        habitsData: habitsData as unknown as Prisma.InputJsonValue,
      },
      create: {
        userId: user.id,
        date: date,
        habitsData: habitsData as unknown as Prisma.InputJsonValue,
      },
    });

    console.log(`✅ Created sample progress for ${dateString}`);
  }

  console.log("🎉 Database seeding completed successfully!");
  console.log(`📊 Created ${allHabits.length} habits for user: ${user.email}`);
  console.log(`📅 Created sample progress for ${sampleDates.length} days`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
