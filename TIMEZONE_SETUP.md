# Vietnam Timezone Setup 🇻🇳

This application is configured to use **Vietnam timezone (UTC+7)** for all date and time operations.

## 🕐 Timezone Configuration

- **Timezone**: Asia/Ho_Chi_Minh (UTC+7)
- **Offset**: +7 hours from UTC
- **Location**: Vietnam

## 📁 Files Updated

### 1. **`src/lib/time.ts`** - Main timezone utilities

- `getVietnamTime()` - Get current time in Vietnam timezone
- `adjustToVietnamTimezone()` - Convert any date to Vietnam timezone
- `todayRange()` - Get today's start/end in Vietnam timezone
- `weekRange()` - Get this week's range in Vietnam timezone
- `lastNDaysRange()` - Get range for last N days
- `formatTime()` - Format time in Vietnam timezone
- `formatDate()` - Format date in Vietnam timezone

### 2. **`src/lib/habit-utils.ts`** - Habit utilities

- Updated to use Vietnam timezone for date calculations
- Streak calculations now use Vietnam timezone
- Completion rate calculations respect Vietnam dates

### 3. **`src/app/api/health/route.ts`** - Health API

- Default dates now use Vietnam timezone
- All health data timestamps are in Vietnam time

### 4. **`src/components/timezone-display.tsx`** - Time display

- Shows current Vietnam time in real-time
- Updates every second
- Displays both date and time

### 5. **`src/components/dashboard.tsx`** - Dashboard

- Added timezone display showing current Vietnam time

## 🚀 How It Works

The timezone system automatically:

1. **Detects your local timezone** (wherever you're running the app)
2. **Converts to Vietnam timezone** (UTC+7)
3. **Applies to all date operations** (habits, health data, etc.)

## 📅 Example Usage

```typescript
import { getVietnamTime, getTodayString } from "@/lib/time";

// Get current Vietnam time
const now = getVietnamTime();

// Get today's date in Vietnam timezone
const today = getTodayString(); // "2024-01-15"

// Check if a date is today in Vietnam
import { isToday } from "@/lib/time";
const isTodayInVietnam = isToday(someDate);
```

## 🌍 Benefits

- **Accurate habit tracking** - Habits reset at the right time in Vietnam
- **Correct date calculations** - All dates are in Vietnam timezone
- **Health data synchronization** - Apple Health data uses Vietnam time
- **User experience** - Users see times in their local Vietnam timezone

## 🔧 Testing

The timezone system is tested in:

- `test-health-api.js` - Health API testing with Vietnam timezone
- All date calculations throughout the app
- Real-time timezone display on dashboard

## 📝 Notes

- **Server timezone**: The server should ideally be set to UTC
- **Client timezone**: Automatically detected and converted
- **Database**: All timestamps are stored in UTC but displayed in Vietnam timezone
- **API responses**: All dates are returned in ISO format (UTC) but interpreted as Vietnam timezone

## 🚨 Important

If you need to change the timezone to a different location:

1. Update `VIETNAM_TIMEZONE_OFFSET` in `src/lib/time.ts`
2. Update the timezone name in comments
3. Update the flag emoji in `TimezoneDisplay` component
4. Test all date-related functionality

