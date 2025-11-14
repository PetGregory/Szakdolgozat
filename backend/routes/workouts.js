

const express = require('express');

const router = express.Router();

const { generateWorkoutPlan } = require('../services/workoutGenerator');

router.post('/generate', async (req, res) => {
  try {

    const { userId, age, weight, height, goal, fitnessLevel, availableDays, gender } = req.body;

    if (!userId || !goal || !fitnessLevel || !availableDays) {
      return res.status(400).json({
        error: 'Missing required fields: userId, goal, fitnessLevel, availableDays'
      });
    }

    const workoutPlan = await generateWorkoutPlan({
      age: age || 25,
      weight: weight || 70,
      height: height || 170,
      goal,
      fitnessLevel,
      availableDays,
      gender: gender
    });

    console.log('Generated workout plan structure:', {
      restDays: workoutPlan?.restDays,
      totalDays: workoutPlan?.totalDays,
      availableDays: workoutPlan?.availableDays,
      daysCount: workoutPlan?.days?.length,
      hasRestDays: workoutPlan?.restDays !== undefined,
      hasTotalDays: workoutPlan?.totalDays !== undefined
    });

    if (workoutPlan.days) {
      workoutPlan.days.forEach((day, index) => {

        if (day.isRestDay === undefined) {
          console.warn(`⚠️  Day ${index + 1} (${day.name}) missing isRestDay field, setting to false`);
          day.isRestDay = false;
        }
      });
    }

    res.json({
      success: true,
      workoutId: `workout-${Date.now()}`,
      workoutPlan
    });

  } catch (error) {

    console.error('Error generating workout:', error);

    const statusCode = error.message.includes('Invalid workout schedule') ? 400 : 500;

    res.status(statusCode).json({
      error: 'Failed to generate workout plan',
      details: error.message
    });
  }
});

module.exports = router;
