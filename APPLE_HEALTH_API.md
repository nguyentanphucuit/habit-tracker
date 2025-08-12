# Apple Health API Documentation

This API endpoint allows you to post health data from Apple Health app to your habit tracker database.

## Endpoint

```
POST /api/health
```

## Base URL

```
http://localhost:3000/api/health
```

## Request Headers

```
Content-Type: application/json
```

## Request Body

The API accepts comprehensive health data including Apple Health metrics:

### Required Fields

- `userId` (string): The unique identifier of the user

### Optional Fields

#### Basic Metrics

- `weight` (number): Weight in kilograms (kg)
- `height` (number): Height in centimeters (cm)
- `bmi` (number): Body Mass Index

#### Apple Health Specific Metrics

- `steps` (number): Daily step count
- `distance` (number): Distance walked/run in meters
- `caloriesBurned` (number): Total calories burned in kcal
- `activeEnergy` (number): Active energy burned in kcal
- `restingEnergy` (number): Resting energy in kcal

#### Vital Signs

- `bloodPressure` (string): Blood pressure in format "120/80"
- `heartRate` (number): Heart rate in beats per minute
- `bloodOxygen` (number): Blood oxygen saturation percentage
- `bodyTemperature` (number): Body temperature in Celsius

#### Sleep Data

- `sleepHours` (number): Sleep duration in hours
- `sleepQuality` (string): Sleep quality assessment ("good", "fair", "poor")

#### Activity Data

- `exerciseMinutes` (number): Exercise duration in minutes
- `standHours` (number): Standing hours per day

#### Other Metrics

- `waterIntake` (number): Water intake in milliliters (ml)
- `notes` (string): Additional notes or comments
- `date` (string): Date in ISO format (defaults to current date)
- `source` (string): Data source (defaults to "apple_health")

## Example Request

```json
{
  "userId": "cme8tf1gw0000lxna8mrub899",
  "date": "2024-01-15T00:00:00.000Z",

  "steps": 8542,
  "distance": 6500,
  "caloriesBurned": 320,
  "activeEnergy": 280,
  "restingEnergy": 1800,

  "heartRate": 72,
  "bloodOxygen": 98.5,
  "bodyTemperature": 36.8,

  "sleepHours": 7.5,
  "sleepQuality": "good",

  "exerciseMinutes": 45,
  "standHours": 12,

  "waterIntake": 2500,
  "weight": 70.5,
  "height": 175,
  "bmi": 23.0,

  "notes": "Data imported from Apple Health app",
  "source": "apple_health"
}
```

## Response

### Success Response (200)

```json
{
  "success": true,
  "message": "Health data from Apple Health saved successfully",
  "data": {
    "id": "generated-uuid",
    "userId": "cme8tf1gw0000lxna8mrub899",
    "steps": 8542,
    "distance": 6500,
    "caloriesBurned": 320,
    "activeEnergy": 280,
    "restingEnergy": 1800,
    "heartRate": 72,
    "bloodOxygen": 98.5,
    "bodyTemperature": 36.8,
    "sleepHours": 7.5,
    "sleepQuality": "good",
    "exerciseMinutes": 45,
    "standHours": 12,
    "waterIntake": 2500,
    "weight": 70.5,
    "height": 175,
    "bmi": 23.0,
    "source": "apple_health",
    "notes": "Data imported from Apple Health app",
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response (400)

```json
{
  "error": "userId is required"
}
```

### Error Response (500)

```json
{
  "error": "Failed to save health data"
}
```

## GET Endpoint

You can also retrieve health data using:

```
GET /api/health?userId={userId}&startDate={startDate}&endDate={endDate}&source={source}
```

### Query Parameters

- `userId` (required): The user ID to fetch data for
- `startDate` (optional): Start date in ISO format
- `endDate` (optional): End date in ISO format
- `source` (optional): Filter by data source

### Example GET Request

```
GET /api/health?userId=cme8tf1gw0000lxna8mrub899&startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-15T23:59:59.999Z
```

## Testing

Use the provided test script to test the API:

```bash
node test-health-api.js
```

Make sure your Next.js development server is running on port 3000.

## Data Source Tracking

The API automatically tracks the source of health data. By default, it's set to "apple_health", but you can customize this field to track data from other sources like:

- "apple_health"
- "fitbit"
- "garmin"
- "manual_entry"
- "imported_csv"

## Database Schema

The health data is stored in a `Health` table with the following structure:

- All metrics are stored as nullable fields to accommodate partial data
- Dates are stored in UTC format
- The `source` field helps track where the data originated
- Indexes are created on `userId`, `date`, and `source` for efficient querying

## Integration with Apple Health

To integrate with Apple Health app:

1. Export health data from Apple Health app
2. Parse the exported data (usually CSV or XML format)
3. Transform the data to match the API schema
4. Send POST requests to `/api/health` endpoint
5. Optionally, set up automated imports for regular data updates

## Rate Limiting

Currently, there are no rate limits implemented. Consider implementing rate limiting for production use.

## Security

- Ensure proper authentication and authorization
- Validate user IDs to prevent data leakage
- Consider implementing API keys for external integrations
- Sanitize input data to prevent injection attacks
