import { PrismaClient, HabitFrequency, TargetType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: "you@example.com" },
    update: {},
    create: {
      email: "you@example.com",
      displayName: "Test User",
    },
  });

  console.log("✅ Created user:", user.email);

  // Create daily habits with real UUIDs
  const dailyHabits = [
    {
      name: "Uống nước 1.5–2L",
      frequency: HabitFrequency.DAILY,
      targetType: TargetType.COUNT,
      targetValue: 8,
    },
    {
      name: "Ăn rau & trái cây",
      frequency: HabitFrequency.DAILY,
      targetType: TargetType.COUNT,
      targetValue: 5,
    },
    {
      name: "Tập thể dục ≥ 30 phút",
      frequency: HabitFrequency.DAILY,
      targetType: TargetType.MINUTES,
      targetValue: 30,
    },
    {
      name: "Ngủ trước 23:00",
      frequency: HabitFrequency.DAILY,
      targetType: TargetType.BOOLEAN,
      targetValue: 1,
    },
    {
      name: "Đọc sách ≥ 30 phút",
      frequency: HabitFrequency.DAILY,
      targetType: TargetType.MINUTES,
      targetValue: 30,
    },
  ];

  // Create weekly habits with real UUIDs
  const weeklyHabits = [
    {
      name: "Tập thể dục (số buổi/tuần)",
      frequency: HabitFrequency.WEEKLY,
      targetType: TargetType.COUNT,
      targetValue: 4,
    },
    {
      name: "Ra ngoài/tiếp xúc thiên nhiên",
      frequency: HabitFrequency.WEEKLY,
      targetType: TargetType.COUNT,
      targetValue: 3,
    },
    {
      name: "Hạn chế đồ ngọt (ngày/tuần)",
      frequency: HabitFrequency.WEEKLY,
      targetType: TargetType.COUNT,
      targetValue: 6,
    },
  ];

  // Create all habits
  const allHabits = [...dailyHabits, ...weeklyHabits];

  for (const habitData of allHabits) {
    const habit = await prisma.habit.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: habitData.name,
        },
      },
      update: {},
      create: {
        ...habitData,
        userId: user.id,
      },
    });

    console.log(`✅ Created habit: ${habit.name} (ID: ${habit.id})`);
  }

  console.log(`\n🎉 Seeded ${allHabits.length} habits for user ${user.email}`);
  console.log("User ID:", user.id);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
