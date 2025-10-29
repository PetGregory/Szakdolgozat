const express = require('express');
const router = express.Router();
const workoutGenerator = require('../services/workoutGenerator');

// POST /api/workouts/generate
router.post('/generate', async (req, res) => {
  try {
    const { userId, age, weight, height, goal, fitnessLevel, availableDays } = req.body;

    if (!userId || !goal || !fitnessLevel || !availableDays) {
      return res.status(400).json({
        error: 'Missing required fields: userId, goal, fitnessLevel, availableDays'
      });
    }

    const workoutPlan = workoutGenerator.generateWorkoutPlan({
      age: age || 25,
      weight: weight || 70,
      height: height || 170,
      goal,
      fitnessLevel,
      availableDays
    });

    res.json({
      success: true,
      workoutId: `workout-${Date.now()}`,
      workoutPlan
    });

  } catch (error) {
    console.error('Error generating workout:', error);
    res.status(500).json({
      error: 'Failed to generate workout plan',
      details: error.message
    });
  }
});

// GET /api/workouts/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    res.json({ workouts: [] });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({
      error: 'Failed to fetch workouts',
      details: error.message
    });
  }
});

module.exports = router;
