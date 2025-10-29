// Exercise database
const exercises = {
  chest: [
    { name: 'Bench Press', muscle: 'chest', equipment: 'barbell' },
    { name: 'Incline Dumbbell Press', muscle: 'chest', equipment: 'dumbbell' },
    { name: 'Push-ups', muscle: 'chest', equipment: 'bodyweight' },
    { name: 'Chest Flyes', muscle: 'chest', equipment: 'dumbbell' },
    { name: 'Dips', muscle: 'chest', equipment: 'bodyweight' }
  ],
  back: [
    { name: 'Pull-ups', muscle: 'back', equipment: 'bodyweight' },
    { name: 'Bent-over Row', muscle: 'back', equipment: 'barbell' },
    { name: 'Lat Pulldown', muscle: 'back', equipment: 'machine' },
    { name: 'Deadlift', muscle: 'back', equipment: 'barbell' },
    { name: 'T-Bar Row', muscle: 'back', equipment: 'barbell' }
  ],
  shoulders: [
    { name: 'Overhead Press', muscle: 'shoulders', equipment: 'barbell' },
    { name: 'Lateral Raises', muscle: 'shoulders', equipment: 'dumbbell' },
    { name: 'Rear Delt Flyes', muscle: 'shoulders', equipment: 'dumbbell' },
    { name: 'Face Pulls', muscle: 'shoulders', equipment: 'cable' },
    { name: 'Arnold Press', muscle: 'shoulders', equipment: 'dumbbell' }
  ],
  legs: [
    { name: 'Squats', muscle: 'legs', equipment: 'barbell' },
    { name: 'Lunges', muscle: 'legs', equipment: 'bodyweight' },
    { name: 'Leg Press', muscle: 'legs', equipment: 'machine' },
    { name: 'Romanian Deadlift', muscle: 'legs', equipment: 'barbell' },
    { name: 'Calf Raises', muscle: 'legs', equipment: 'bodyweight' }
  ],
  arms: [
    { name: 'Bicep Curls', muscle: 'biceps', equipment: 'dumbbell' },
    { name: 'Tricep Dips', muscle: 'triceps', equipment: 'bodyweight' },
    { name: 'Hammer Curls', muscle: 'biceps', equipment: 'dumbbell' },
    { name: 'Overhead Tricep Extension', muscle: 'triceps', equipment: 'dumbbell' },
    { name: 'Close-grip Bench Press', muscle: 'triceps', equipment: 'barbell' }
  ],
  core: [
    { name: 'Plank', muscle: 'core', equipment: 'bodyweight' },
    { name: 'Russian Twists', muscle: 'core', equipment: 'bodyweight' },
    { name: 'Mountain Climbers', muscle: 'core', equipment: 'bodyweight' },
    { name: 'Dead Bug', muscle: 'core', equipment: 'bodyweight' },
    { name: 'Bicycle Crunches', muscle: 'core', equipment: 'bodyweight' }
  ]
};

// Workout templates based on goals
const workoutTemplates = {
  weight_loss: {
    beginner: ['full_body_1', 'cardio', 'full_body_2', 'cardio', 'full_body_3'],
    intermediate: ['push', 'pull', 'legs', 'cardio', 'push', 'pull', 'legs'],
    advanced: ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'cardio']
  },
  muscle_gain: {
    beginner: ['full_body_1', 'rest', 'full_body_2', 'rest', 'full_body_3', 'rest', 'rest'],
    intermediate: ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'legs'],
    advanced: ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'rest']
  },
  endurance: {
    beginner: ['cardio', 'full_body_1', 'cardio', 'full_body_2', 'cardio', 'rest', 'rest'],
    intermediate: ['cardio', 'push', 'cardio', 'pull', 'cardio', 'legs', 'rest'],
    advanced: ['cardio', 'push', 'cardio', 'pull', 'cardio', 'legs', 'cardio']
  },
  general_fitness: {
    beginner: ['full_body_1', 'rest', 'full_body_2', 'rest', 'full_body_3', 'rest', 'rest'],
    intermediate: ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'legs'],
    advanced: ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'rest']
  }
};

// Day templates
const dayTemplates = {
  full_body_1: {
    name: 'Full Body Workout A',
    muscles: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'],
    exerciseCount: 6
  },
  full_body_2: {
    name: 'Full Body Workout B',
    muscles: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'],
    exerciseCount: 6
  },
  full_body_3: {
    name: 'Full Body Workout C',
    muscles: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'],
    exerciseCount: 6
  },
  push: {
    name: 'Push Day',
    muscles: ['chest', 'shoulders', 'triceps'],
    exerciseCount: 8
  },
  pull: {
    name: 'Pull Day',
    muscles: ['back', 'biceps'],
    exerciseCount: 6
  },
  legs: {
    name: 'Leg Day',
    muscles: ['legs', 'core'],
    exerciseCount: 6
  },
  cardio: {
    name: 'Cardio Day',
    muscles: ['core'],
    exerciseCount: 4
  }
};

function getSetsAndReps(fitnessLevel, exerciseType) {
  const configs = {
    beginner: {
      strength: { sets: 3, reps: '8-12', rest: 60 },
      cardio: { sets: 3, reps: '30-45 sec', rest: 30 },
      core: { sets: 3, reps: '10-15', rest: 45 }
    },
    intermediate: {
      strength: { sets: 4, reps: '6-10', rest: 90 },
      cardio: { sets: 4, reps: '45-60 sec', rest: 45 },
      core: { sets: 4, reps: '15-20', rest: 60 }
    },
    advanced: {
      strength: { sets: 5, reps: '4-8', rest: 120 },
      cardio: { sets: 5, reps: '60-90 sec', rest: 60 },
      core: { sets: 5, reps: '20-25', rest: 75 }
    }
  };

  if (exerciseType === 'cardio') return configs[fitnessLevel].cardio;
  if (exerciseType === 'core') return configs[fitnessLevel].core;
  return configs[fitnessLevel].strength;
}

function selectExercises(muscles, count, fitnessLevel) {
  const selectedExercises = [];
  const usedExercises = new Set();

  // Distribute exercises across muscle groups
  const musclesPerGroup = Math.ceil(count / muscles.length);
  
  muscles.forEach(muscle => {
    const muscleExercises = exercises[muscle] || [];
    const exercisesToTake = Math.min(musclesPerGroup, muscleExercises.length);
    
    for (let i = 0; i < exercisesToTake && selectedExercises.length < count; i++) {
      const exercise = muscleExercises[i];
      if (!usedExercises.has(exercise.name)) {
        const { sets, reps, rest } = getSetsAndReps(fitnessLevel, muscle === 'core' ? 'core' : 'strength');
        selectedExercises.push({
          name: exercise.name,
          muscle: exercise.muscle,
          equipment: exercise.equipment,
          sets,
          reps,
          rest
        });
        usedExercises.add(exercise.name);
      }
    }
  });

  // Fill remaining slots with random exercises
  while (selectedExercises.length < count) {
    const allMuscles = Object.keys(exercises);
    const randomMuscle = allMuscles[Math.floor(Math.random() * allMuscles.length)];
    const muscleExercises = exercises[randomMuscle];
    const randomExercise = muscleExercises[Math.floor(Math.random() * muscleExercises.length)];
    
    if (!usedExercises.has(randomExercise.name)) {
      const { sets, reps, rest } = getSetsAndReps(fitnessLevel, randomMuscle === 'core' ? 'core' : 'strength');
      selectedExercises.push({
        name: randomExercise.name,
        muscle: randomExercise.muscle,
        equipment: randomExercise.equipment,
        sets,
        reps,
        rest
      });
      usedExercises.add(randomExercise.name);
    }
  }

  return selectedExercises.slice(0, count);
}

function generateWorkoutPlan(userData) {
  const { goal, fitnessLevel, availableDays } = userData;
  
  // Get workout template
  const template = workoutTemplates[goal][fitnessLevel];
  const selectedDays = template.slice(0, availableDays);
  
  const workoutPlan = {
    weeks: 4,
    goal,
    fitnessLevel,
    availableDays,
    days: []
  };

  selectedDays.forEach((dayType, index) => {
    const dayTemplate = dayTemplates[dayType];
    const exercises = selectExercises(
      dayTemplate.muscles,
      dayTemplate.exerciseCount,
      fitnessLevel
    );

    workoutPlan.days.push({
      day: index + 1,
      name: dayTemplate.name,
      type: dayType,
      exercises
    });
  });

  return workoutPlan;
}

module.exports = {
  generateWorkoutPlan
};
