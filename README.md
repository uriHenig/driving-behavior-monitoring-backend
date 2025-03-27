# Driving Behavior Monitoring API

This API monitors driving behavior, flags unsafe driving events, and calculates a sustainability score based on driving patterns.

## Backend Setup Instructions

1. Install dependencies:

   ```
   npm install
   ```

2. Make sure MongoDB is running on your local machine at port 27017. If you're using a different MongoDB connection string, update it in `server.js`.

3. Start the server:

   ```
   npm start
   ```

   Or for development with auto-restart:

   ```
   npm run dev
   ```

4. The server will run on port 5000 by default. You can change this by setting the PORT environment variable.

## API Endpoints

### POST /monitor-behavior

Monitors driving behavior and calculates a sustainability score.

**Request Body:**

```json
{
  "driverId": "driver123",
  "acceleration": 4.5, // m/s²
  "braking": 5.2, // m/s²
  "turn": 3.0, // m/s² (lateral force)
  "timestamp": "2025-02-14T15:30:00Z" // Optional
}
```

**Response:**

```json
{
  "driverId": "driver123",
  "acceleration": 4.5,
  "braking": 5.2,
  "turn": 3.0,
  "isFlagged": true,
  "timestamp": "2025-02-14T15:30:00Z",
  "sustainabilityScore": 0.72
}
```

## Assumptions and Design Choices

### Flagging Criteria

- Acceleration threshold: 3.0 m/s²
- Braking threshold: 4.0 m/s²
- Turn threshold: 2.5 m/s²

### Sustainability Score Calculation

- The sustainability score is calculated as:
  `1 - (average of normalized acceleration, braking, and turn values)`
- Each value is normalized against its threshold (capped at 1 for values exceeding the threshold)
- A higher score indicates more sustainable driving
- The score ranges from 0 (poor) to 1 (excellent)

### Error Handling

- The API performs basic input validation
- Errors are logged to the console and appropriate HTTP status codes are returned

### Database

- MongoDB is used to store driving event data
- The schema includes all driving parameters, flag status, and the sustainability score
