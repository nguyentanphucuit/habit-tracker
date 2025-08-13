const API_BASE = "http://localhost:3000/api/health";

// Test data - replace userId with an actual user ID from your database
const TEST_USER_ID = "cme8tf1gw0000lxna8mrub899"; // Replace with actual user ID

// Vietnam timezone helper (UTC+7)
function getVietnamTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 60 * 60000); // +7 hours for Vietnam
}

async function testHealthAPI() {
  console.log("🧪 Testing Apple Health API...\n");

  // Test POST endpoint
  console.log("📤 Testing POST /api/health...");
  try {
    const healthData = {
      userId: TEST_USER_ID,
      date: getVietnamTime().toISOString(),
      steps: 8542,
      distance: 6500,
      caloriesBurned: 320,
      activeEnergy: 280,
      restingEnergy: 1800,
      heartRate: 72,
      bloodOxygen: 98.5,
      bodyTemperature: 36.8,
      sleepHours: 7.5,
      sleepQuality: "good",
      exerciseMinutes: 45,
      standHours: 12,
      waterIntake: 2500,
      weight: 70.5,
      height: 175,
      bmi: 23.0,
      notes: "Data imported from Apple Health app",
      source: "apple_health",
    };

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(healthData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ POST successful:", result.message);
      console.log("📊 Data saved with ID:", result.data.id);
    } else {
      console.log("❌ POST failed:", result.error);
    }
  } catch (error) {
    console.log("❌ POST error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test GET endpoint
  console.log("📥 Testing GET /api/health...");
  try {
    const response = await fetch(`${API_BASE}?userId=${TEST_USER_ID}`);
    const result = await response.json();

    if (response.ok) {
      console.log("✅ GET successful");
      console.log(`📊 Found ${result.count} health records`);
      if (result.data.length > 0) {
        console.log("📋 Latest record:", {
          date: result.data[0].date,
          steps: result.data[0].steps,
          heartRate: result.data[0].heartRate,
          sleepHours: result.data[0].sleepHours,
        });
      }
    } else {
      console.log("❌ GET failed:", result.error);
    }
  } catch (error) {
    console.log("❌ GET error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test GET with date range
  console.log("📅 Testing GET /api/health with date range...");
  try {
    const startDate = getVietnamTime();
    startDate.setDate(startDate.getDate() - 7); // 7 days ago

    const response = await fetch(
      `${API_BASE}?userId=${TEST_USER_ID}&startDate=${startDate.toISOString()}&endDate=${getVietnamTime().toISOString()}`
    );
    const result = await response.json();

    if (response.ok) {
      console.log("✅ GET with date range successful");
      console.log(`📊 Found ${result.count} records in the last 7 days`);
    } else {
      console.log("❌ GET with date range failed:", result.error);
    }
  } catch (error) {
    console.log("❌ GET with date range error:", error.message);
  }
}

// Run the test
testHealthAPI().catch(console.error);
