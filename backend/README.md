# Workout Generator Backend

Node.js/Express API for generating personalized workout plans.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with Firebase Admin SDK credentials:
```bash
cp .env.example .env
```

3. Get Firebase Admin SDK credentials:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Copy the values to your `.env` file

4. Start the server:
```bash
npm start
# or for development with auto-restart:
npm run dev
```

## API Endpoints

### POST /api/workouts/generate
Generate a personalized workout plan.

**Request Body:**
```json
{
  "userId": "string",
  "age": 25,
  "weight": 70,
  "height": 170,
  "goal": "weight_loss|muscle_gain|endurance|general_fitness",
  "fitnessLevel": "beginner|intermediate|advanced",
  "availableDays": 3
}
```

**Response:**
```json
{
  "success": true,
  "workoutId": "workout_id",
  "workoutPlan": {
    "weeks": 4,
    "goal": "weight_loss",
    "fitnessLevel": "beginner",
    "availableDays": 3,
    "days": [
      {
        "day": 1,
        "name": "Full Body Workout A",
        "type": "full_body_1",
        "exercises": [
          {
            "name": "Bench Press",
            "muscle": "chest",
            "equipment": "barbell",
            "sets": 3,
            "reps": "8-12",
            "rest": 60
          }
        ]
      }
    ]
  }
}
```

### GET /api/workouts/:userId
Get user's workout history.

**Response:**
```json
{
  "workouts": [
    {
      "id": "workout_id",
      "userId": "user_id",
      "userData": {...},
      "workoutPlan": {...},
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## Features

- **Rule-based workout generation** based on fitness level and goals
- **Firebase Firestore integration** for data persistence
- **CORS enabled** for frontend communication
- **Comprehensive exercise database** with different muscle groups
- **Flexible workout templates** for different goals and schedules

## Workout Logic

- **Beginner**: 3 sets, 8-12 reps, 60s rest
- **Intermediate**: 4 sets, 6-10 reps, 90s rest  
- **Advanced**: 5 sets, 4-8 reps, 120s rest

**Goals:**
- Weight Loss: Cardio-focused with full body workouts
- Muscle Gain: Split routines with strength focus
- Endurance: High-rep, cardio-intensive workouts
- General Fitness: Balanced approach

**Available Days:**
- 1-3 days: Full body workouts
- 4-5 days: Push/Pull/Legs split
- 6-7 days: Advanced split with cardio
