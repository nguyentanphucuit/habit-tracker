// Test script to verify timezone functions
const { DEFAULT_TIMEZONE } = require("./src/lib/default-data.ts");

console.log("🧪 Testing Timezone Functions...\n");

// Test current time
const now = new Date();
const vietnamNow = DEFAULT_TIMEZONE.getCurrentTime();

console.log("Current Local Time:", now.toISOString());
console.log("Current Vietnam Time:", vietnamNow.toISOString());
console.log("Local Timezone Offset (minutes):", now.getTimezoneOffset());
console.log("Vietnam Timezone Offset (minutes):", 7 * 60);

// Test date conversion
const testDate = new Date("2024-01-15T10:00:00Z");
const vietnamDate = DEFAULT_TIMEZONE.fromUTC(testDate);

console.log("\nTest Date (UTC):", testDate.toISOString());
console.log("Test Date (Vietnam):", vietnamDate.toISOString());

// Test date range calculation
const today = DEFAULT_TIMEZONE.getCurrentTime();
const startDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() - 29
);
const endDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
  23,
  59,
  59,
  999
);

console.log("\nDate Range for Heatmap:");
console.log("Today (Vietnam):", today.toISOString());
console.log("Start Date (29 days ago):", startDate.toISOString());
console.log("End Date (end of today):", endDate.toISOString());

// Test date formatting
const formattedStart = startDate.toISOString().split("T")[0];
const formattedEnd = endDate.toISOString().split("T")[0];

console.log("\nFormatted Dates:");
console.log("Start Date (YYYY-MM-DD):", formattedStart);
console.log("End Date (YYYY-MM-DD):", formattedEnd);

console.log("\n✅ Timezone test completed!");
