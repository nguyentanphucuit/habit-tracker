import { NextRequest, NextResponse } from "next/server";
import { getTimezoneById } from "@/lib/user-timezone";

// GET - Retrieve user timezone preference
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default-user";

    // For now, return default timezone
    // In a real app, you would fetch from database
    const defaultTimezone = "vietnam";

    return NextResponse.json({
      success: true,
      userId,
      timezone: defaultTimezone,
    });
  } catch (error) {
    console.error("Error fetching user timezone:", error);
    return NextResponse.json(
      { error: "Failed to fetch user timezone" },
      { status: 500 }
    );
  }
}

// POST - Save user timezone preference
export async function POST(request: NextRequest) {
  try {
    const { userId, timezone } = await request.json();

    // Validate timezone
    const validTimezone = getTimezoneById(timezone);
    if (!validTimezone) {
      return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
    }

    // For now, just return success
    // In a real app, you would save to database
    console.log(`Saving timezone ${timezone} for user ${userId}`);

    return NextResponse.json({
      success: true,
      userId: userId || "default-user",
      timezone,
      message: "Timezone saved successfully",
    });
  } catch (error) {
    console.error("Error saving user timezone:", error);
    return NextResponse.json(
      { error: "Failed to save user timezone" },
      { status: 500 }
    );
  }
}
