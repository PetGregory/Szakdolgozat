function loadWorkoutData() {
  const fs = require('fs');
  const path = require('path');
  const workoutDataPath = path.join(__dirname, '..', 'workoutData.json');
  return JSON.parse(fs.readFileSync(workoutDataPath, 'utf8'));
}

function getRestTime(goal, exerciseType) {
  if (exerciseType === 'cardio') {
    return 60;
  }
  
  if (exerciseType === 'core') {
    return 60;
  }
  
  switch (goal) {
    case 'weight_loss':
    case 'endurance':
      return 60;
    case 'muscle_gain':
      return 75;
    case 'general_fitness':
      return 190;
    default:
      return 60;
  }
}

function getSetsAndReps(fitnessLevel, exerciseType, goal) {
  const rest = getRestTime(goal, exerciseType);

  const configs = {
    beginner: {
      strength: { sets: 3, reps: '8-12', rest: rest },
      cardio: { sets: 3, reps: '30-45 sec', rest: rest },
      core: { sets: 3, reps: '10-15', rest: rest }
    },
    intermediate: {
      strength: { sets: 4, reps: '6-10', rest: rest },
      cardio: { sets: 4, reps: '45-60 sec', rest: rest },
      core: { sets: 4, reps: '15-20', rest: rest }
    },
    advanced: {
      strength: { sets: 5, reps: '4-8', rest: rest },
      cardio: { sets: 5, reps: '60-90 sec', rest: rest },
      core: { sets: 5, reps: '20-25', rest: rest }
    }
  };

  if (exerciseType === 'cardio') return configs[fitnessLevel].cardio;
  if (exerciseType === 'core') return configs[fitnessLevel].core;
  return configs[fitnessLevel].strength;
}

async function generateWorkoutPlan(userData) {
  const { goal, fitnessLevel, availableDays, age, weight, height, gender } = userData;

  const data = loadWorkoutData();
  
  const { exercises, workoutTemplates, dayTemplates } = data || {};
  
  if (!exercises) {
    throw new Error('Missing exercises data');
  }
  if (!workoutTemplates) {
    throw new Error('Missing workoutTemplates data');
  }
  if (!dayTemplates) {
    throw new Error('Missing dayTemplates data');
  }
  
  if (!workoutTemplates[goal]) {
    throw new Error(`Goal "${goal}" not found. Available goals: ${Object.keys(workoutTemplates || {}).join(', ')}`);
  }
  
  if (!workoutTemplates[goal][fitnessLevel]) {
    throw new Error(`Fitness level "${fitnessLevel}" not found for goal "${goal}". Available levels: ${Object.keys(workoutTemplates[goal] || {}).join(', ')}`);
  }
  
  const template = workoutTemplates[goal][fitnessLevel];

  const workoutDaysInTemplate = template.filter(day => day !== 'rest day' && day !== 'rest');
  const restDaysInTemplate = template.filter(day => day === 'rest day' || day === 'rest');
  const restDayCountInTemplate = restDaysInTemplate.length;
  
  let adjustedAvailableDays = Math.min(availableDays, 7);
  
  const selectedDays = [];
  let workoutDaysCount = 0;
  let daysSinceLastRest = 0;

  function addRestDayIfNeeded() {
    if (daysSinceLastRest >= 3 && selectedDays.length < 7) {
      selectedDays.push('rest day');
      daysSinceLastRest = 0;
      return true;
    }
    return false;
  }

  for (let i = 0; i < template.length && selectedDays.length < 7; i++) {
    const dayType = template[i];
    
    if (dayType === 'rest day' || dayType === 'rest') {
      if (selectedDays.length < 7) {
        selectedDays.push(dayType);
        daysSinceLastRest = 0;
      }
    } else if (dayTemplates && dayTemplates[dayType]) {
      if (daysSinceLastRest >= 3) {
        addRestDayIfNeeded();
      }
      
      if (workoutDaysCount < adjustedAvailableDays && selectedDays.length < 7) {
        selectedDays.push(dayType);
        workoutDaysCount++;
        daysSinceLastRest++;
      }
    }
  }
  
  let loopIndex = 0;
  const maxLoops = template.length * 5;
  
  while (workoutDaysCount < adjustedAvailableDays && selectedDays.length < 7 && loopIndex < maxLoops) {
    if (daysSinceLastRest >= 3) {
      addRestDayIfNeeded();
      if (selectedDays.length >= 7) break;
    }

    const dayType = template[loopIndex % template.length];
    loopIndex++;
    
    if (dayType === 'rest day' || dayType === 'rest') {
      continue;
    }
    
    if (dayTemplates && dayTemplates[dayType]) {
      selectedDays.push(dayType);
      workoutDaysCount++;
      daysSinceLastRest++;
    }
  }
  
  while (selectedDays.length < 7) {
    if (daysSinceLastRest >= 3) {
      selectedDays.push('rest day');
      daysSinceLastRest = 0;
    } else {
      if (workoutDaysCount < adjustedAvailableDays) {
        const availableDayType = Object.keys(dayTemplates).find(type => 
          type !== 'rest day' && type !== 'rest'
        );
        if (availableDayType) {
          selectedDays.push(availableDayType);
          workoutDaysCount++;
          daysSinceLastRest++;
        } else {
          selectedDays.push('rest day');
          daysSinceLastRest = 0;
        }
      } else {
        selectedDays.push('rest day');
        daysSinceLastRest = 0;
      }
    }
  }
  
  const actualRestDays = selectedDays.filter(d => d === 'rest day' || d === 'rest').length;
  const actualTotalDays = 7;

  const workoutPlan = {
    weeks: 4,
    goal,
    fitnessLevel,
    availableDays: adjustedAvailableDays,
    originalAvailableDays: availableDays,
    restDays: actualRestDays,
    totalDays: actualTotalDays,
    days: []
  };

  let actualDayIndex = 1;
  
  selectedDays.forEach((dayType, index) => {
    if (dayType === "rest day" || dayType === "rest") {
      workoutPlan.days.push({
        day: actualDayIndex,
        name: "Rest Day",
        type: "rest",
        isRestDay: true,
        exercises: []
      });
      actualDayIndex++;
      return;
    }
    
    if (!dayTemplates || !dayTemplates[dayType]) {
      return;
    }
    
    const dayTemplate = dayTemplates[dayType];
    
    if (!dayTemplate || typeof dayTemplate !== 'object') {
      return;
    }
    
    if (!dayTemplate.muscles || !Array.isArray(dayTemplate.muscles)) {
      return;
    }
    
    if (!dayTemplate.exerciseCount || typeof dayTemplate.exerciseCount !== 'number') {
      return;
    }

    try {
      const selectedExercises = selectExercises(
        dayTemplate.muscles,
        dayTemplate.exerciseCount,
        fitnessLevel,
        exercises,
        goal
      );

      workoutPlan.days.push({
        day: actualDayIndex,
        name: dayTemplate.name || `Day ${actualDayIndex}`,
        type: dayType,
        isRestDay: false,
        exercises: selectedExercises
      });
      actualDayIndex++;
    } catch (exerciseError) {
    }
  });
  
  if (workoutPlan.days.length === 0) {
    throw new Error('No valid workout days could be generated. Please check your workout templates and available days.');
  }
  
  while (workoutPlan.days.length < 7) {
    workoutPlan.days.push({
      day: workoutPlan.days.length + 1,
      name: "Rest Day",
      type: "rest",
      isRestDay: true,
      exercises: []
    });
  }
  
  workoutPlan.totalDays = 7;
  
  workoutPlan.restDays = workoutPlan.days.filter(d => d.isRestDay === true).length;

  return workoutPlan;
}

function selectExercises(muscles, count, fitnessLevel, exercises, goal) {
  const selectedExercises = [];
  const usedExercises = new Set();
  const musclesPerGroup = Math.ceil(count / muscles.length);

  muscles.forEach(muscle => {
    let muscleKey = muscle;
    if (muscle === 'triceps' || muscle === 'biceps') {
      muscleKey = 'arms';
    }
    
    const muscleData = exercises[muscleKey]?.data || [];
    
    const take = Math.min(musclesPerGroup, muscleData.length);

    for (let i = 0; i < take && selectedExercises.length < count; i++) {
      const exercise = muscleData[i];
      if (!usedExercises.has(exercise.name)) {
        const exerciseType = muscle === 'core' ? 'core' : 'strength';
        const { sets, reps, rest } = getSetsAndReps(fitnessLevel, exerciseType, goal);
        selectedExercises.push({ ...exercise, sets, reps, rest });
        usedExercises.add(exercise.name);
      }
    }
  });

  while (selectedExercises.length < count) {
    const allMuscles = Object.keys(exercises);
    const randomMuscle = allMuscles[Math.floor(Math.random() * allMuscles.length)];
    const randomList = exercises[randomMuscle]?.data || [];
    const randomExercise = randomList[Math.floor(Math.random() * randomList.length)];

    if (randomExercise && !usedExercises.has(randomExercise.name)) {
      const exerciseType = randomMuscle === 'core' ? 'core' : 'strength';
      const { sets, reps, rest } = getSetsAndReps(fitnessLevel, exerciseType, goal);
      selectedExercises.push({ ...randomExercise, sets, reps, rest });
      usedExercises.add(randomExercise.name);
    }
  }

  return selectedExercises.slice(0, count);
}

module.exports = {
  generateWorkoutPlan,
  loadWorkoutData
};
