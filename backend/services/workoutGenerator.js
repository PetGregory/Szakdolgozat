const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

// 🔥 Firebase config (ugyanaz, mint a projektedben)
const firebaseConfig = {
  apiKey: "AIzaSyA7fxhGCRPovz6oeeCFVax47LnOS5GYrPQ",
  authDomain: "bestrong-74932.firebaseapp.com",
  projectId: "bestrong-74932",
  storageBucket: "bestrong-74932.firebasestorage.app",
  messagingSenderId: "337747001971",
  appId: "1:337747001971:web:850508325def8987256006"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/** 🔹 Firestore-ból letöltés */
async function loadWorkoutData() {
  try {
    const docRef = doc(db, "exerciseData", "default");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Workout data loaded from Firestore");
      return docSnap.data();
    } else {
      throw new Error("No workout data found in Firestore!");
    }
  } catch (error) {
    console.error("Error loading workout data:", error);
    throw error;
  }
}

/** 🔹 Segédfüggvények (változatlan logika) */
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

/** 🔹 Generátor logika Firestore-ból származó adatokkal */
async function generateWorkoutPlan(userData) {
  const { goal, fitnessLevel, availableDays } = userData;

  // 1️⃣ Adatok letöltése Firestore-ból
  let data;
  try {
    data = await loadWorkoutData();
    console.log('📥 Loaded data keys:', Object.keys(data || {}));
  } catch (error) {
    console.error('❌ Error loading from Firestore, using fallback:', error.message);
    // Fallback: használjuk a helyi fájlt
    const fs = require('fs');
    const path = require('path');
    const workoutDataPath = path.join(__dirname, '..', 'workoutData.json');
    data = JSON.parse(fs.readFileSync(workoutDataPath, 'utf8'));
    console.log('📦 Using fallback data from workoutData.json');
  }
  
  const { exercises, workoutTemplates, dayTemplates } = data || {};
  
  // Validáció - ellenőrizzük hogy minden adat megvan
  if (!exercises) {
    throw new Error('Missing exercises data');
  }
  if (!workoutTemplates) {
    throw new Error('Missing workoutTemplates data');
  }
  if (!dayTemplates) {
    throw new Error('Missing dayTemplates data');
  }
  
  console.log('✅ All required data loaded:', {
    hasExercises: !!exercises,
    hasWorkoutTemplates: !!workoutTemplates,
    hasDayTemplates: !!dayTemplates,
    dayTemplateKeys: Object.keys(dayTemplates || {})
  });

  // 2️⃣ Template kiválasztása a cél alapján
  console.log('🎯 Selecting template:', { goal, fitnessLevel });
  console.log('📋 Available goals:', Object.keys(workoutTemplates || {}));
  
  if (!workoutTemplates[goal]) {
    throw new Error(`Goal "${goal}" not found. Available goals: ${Object.keys(workoutTemplates || {}).join(', ')}`);
  }
  
  if (!workoutTemplates[goal][fitnessLevel]) {
    throw new Error(`Fitness level "${fitnessLevel}" not found for goal "${goal}". Available levels: ${Object.keys(workoutTemplates[goal] || {}).join(', ')}`);
  }
  
  const template = workoutTemplates[goal][fitnessLevel];
  console.log('✅ Selected template:', template);

  // 2a️⃣ Szeparáljuk az edzés napokat és rest day-eket a template-ben
  const workoutDaysInTemplate = template.filter(day => day !== 'rest day' && day !== 'rest');
  const restDaysInTemplate = template.filter(day => day === 'rest day' || day === 'rest');
  const restDayCountInTemplate = restDaysInTemplate.length;
  
  console.log(`📊 Template analysis:`, {
    template,
    workoutDaysInTemplate,
    restDaysInTemplate,
    restDayCountInTemplate,
    availableDays
  });
  
  // 2b️⃣ Validáció és automatikus kiigazítás: ha availableDays + rest day-ek száma > 7
  const totalDays = availableDays + restDayCountInTemplate;
  console.log(`🔍 Validation check: ${availableDays} workout days + ${restDayCountInTemplate} rest days = ${totalDays} days`);
  
  let adjustedAvailableDays = availableDays;
  
  if (totalDays > 7) {
    // Automatikusan csökkentjük a workout napok számát, hogy összesen 7 legyen
    adjustedAvailableDays = 7 - restDayCountInTemplate;
    console.log(`⚠️ Adjusting workout days: ${availableDays} → ${adjustedAvailableDays} to fit 7 days total (including ${restDayCountInTemplate} rest days)`);
    
    if (adjustedAvailableDays <= 0) {
      throw new Error(
        `Invalid workout schedule: Cannot create workout plan. The template contains ${restDayCountInTemplate} rest days, which exceeds the maximum 7 days per week.`
      );
    }
  }

  // 3️⃣ Edzés napok kiválasztása az adjustedAvailableDays alapján (rest day-ek NÉLKÜL)
  console.log('📅 Selecting workout days:', {
    originalAvailableDays: availableDays,
    adjustedAvailableDays,
    workoutDaysInTemplate,
    dayTemplateKeys: Object.keys(dayTemplates)
  });
  
  // Először szűrjük ki csak az érvényes napokat
  const validWorkoutDays = workoutDaysInTemplate.filter(day => {
    const exists = dayTemplates && dayTemplates[day];
    if (!exists) {
      console.warn(`⚠️ Invalid dayType in template: ${day} - skipping`);
    }
    return exists;
  });
  
  console.log('✅ Valid workout days:', validWorkoutDays);
  
  if (validWorkoutDays.length === 0) {
    throw new Error(`No valid workout days found in template. Available dayTemplates: ${Object.keys(dayTemplates || {}).join(', ')}`);
  }
  
  const selectedWorkoutDays = [];
  let i = 0;
  let attempts = 0;
  const maxAttempts = adjustedAvailableDays * 2; // Védés végtelen ciklus ellen
  
  while (selectedWorkoutDays.length < adjustedAvailableDays && validWorkoutDays.length > 0 && attempts < maxAttempts) {
    const day = validWorkoutDays[i % validWorkoutDays.length];
    selectedWorkoutDays.push(day);
    i++;
    attempts++;
  }
  
  if (selectedWorkoutDays.length === 0) {
    throw new Error(`Failed to select workout days. Available valid days: ${validWorkoutDays.join(', ')}`);
  }
  
  console.log('✅ Selected workout days:', selectedWorkoutDays);
  
  
  // 3a️⃣ Összevonjuk az edzés napokat és rest day-eket
  const selectedDays = [...selectedWorkoutDays, ...restDaysInTemplate];
  
  console.log(`📋 Final selected days:`, selectedDays);

  // Számoljuk újra a totalDays-t az adjusted értékekkel
  const finalTotalDays = adjustedAvailableDays + restDayCountInTemplate;

  const workoutPlan = {
    weeks: 4,
    goal,
    fitnessLevel,
    availableDays: adjustedAvailableDays, // Az adjusted értéket használjuk
    originalAvailableDays: availableDays, // Eltároljuk az eredetit is info célból
    restDays: restDayCountInTemplate,
    totalDays: finalTotalDays,
    days: []
  };
  
  if (adjustedAvailableDays !== availableDays) {
    console.log(`ℹ️ Workout days adjusted from ${availableDays} to ${adjustedAvailableDays} to accommodate rest days`);
  }
  
  console.log(`✅ Workout plan structure:`, {
    restDays: workoutPlan.restDays,
    totalDays: workoutPlan.totalDays,
    availableDays: workoutPlan.availableDays,
    originalAvailableDays: workoutPlan.originalAvailableDays
  });

  // 4️⃣ Napok és gyakorlatok generálása
  let actualDayIndex = 1; // Külön számláló az actual napokhoz (rest day-ek miatt)
  
  selectedDays.forEach((dayType, index) => {
    // 4a️⃣ Rest day kezelése
    if (dayType === "rest day" || dayType === "rest") {
      workoutPlan.days.push({
        day: actualDayIndex,
        name: "Rest Day",
        type: "rest",
        isRestDay: true,
        exercises: [] // üres tömb = pihenőnap
      });
      actualDayIndex++;
      return;
    }
    
    console.log(`🔍 Looking for dayTemplate with type: "${dayType}"`);
    console.log(`📋 Available dayTemplates keys:`, Object.keys(dayTemplates));
    
    // Biztonságos ellenőrzés - ha nincs ilyen dayType, akkor ugorjuk át
    if (!dayTemplates || !dayTemplates[dayType]) {
      console.error(`❌ Day template not found for: ${dayType}`);
      console.error(`Available templates:`, Object.keys(dayTemplates || {}));
      console.warn(`⚠️ Skipping day type: ${dayType}`);
      return; // Ugorjuk át ezt a napot, nem dobunk hibát
    }
    
    const dayTemplate = dayTemplates[dayType];
    
    // További biztonsági ellenőrzések
    if (!dayTemplate || typeof dayTemplate !== 'object') {
      console.error(`❌ Invalid dayTemplate for: ${dayType}`, dayTemplate);
      console.warn(`⚠️ Skipping invalid day type: ${dayType}`);
      return;
    }
    
    console.log(`✅ Found dayTemplate:`, {
      name: dayTemplate.name,
      type: dayType,
      hasMuscles: !!dayTemplate.muscles,
      hasExerciseCount: !!dayTemplate.exerciseCount
    });
    
    // Ha nincs muscles vagy exerciseCount, akkor hiba
    if (!dayTemplate.muscles || !Array.isArray(dayTemplate.muscles)) {
      console.error(`❌ Day template missing or invalid muscles property:`, dayTemplate);
      console.warn(`⚠️ Skipping day type: ${dayType} - missing muscles array`);
      return;
    }
    
    if (!dayTemplate.exerciseCount || typeof dayTemplate.exerciseCount !== 'number') {
      console.error(`❌ Day template missing or invalid exerciseCount property:`, dayTemplate);
      console.warn(`⚠️ Skipping day type: ${dayType} - missing exerciseCount`);
      return;
    }

    // 4b️⃣ Gyakorlatok kiválasztása
    try {
      const selectedExercises = selectExercises(
        dayTemplate.muscles,
        dayTemplate.exerciseCount,
        fitnessLevel,
        exercises
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
      console.error(`❌ Error selecting exercises for ${dayType}:`, exerciseError);
      console.warn(`⚠️ Skipping day type: ${dayType} due to exercise selection error`);
      // Nem dobunk hibát, csak kihagyjuk ezt a napot
    }
  });
  
  console.log(`🎯 Final workout plan days:`, workoutPlan.days.map(d => ({
    day: d.day,
    name: d.name,
    isRestDay: d.isRestDay
  })));
  
  // Ellenőrizzük hogy van-e legalább egy nap
  if (workoutPlan.days.length === 0) {
    throw new Error('No valid workout days could be generated. Please check your workout templates and available days.');
  }
  
  // Frissítjük a totalDays-t az actual napok száma alapján
  workoutPlan.totalDays = workoutPlan.days.length;
  
  console.log(`📤 Returning workout plan with:`, {
    restDays: workoutPlan.restDays,
    totalDays: workoutPlan.totalDays,
    availableDays: workoutPlan.availableDays,
    daysCount: workoutPlan.days.length,
    workoutDaysCount: workoutPlan.days.filter(d => !d.isRestDay).length,
    restDaysCount: workoutPlan.days.filter(d => d.isRestDay).length
  });

  return workoutPlan;
}


/** 🔹 Gyakorlatválasztó */
function selectExercises(muscles, count, fitnessLevel, exercises) {
  const selectedExercises = [];
  const usedExercises = new Set();
  const musclesPerGroup = Math.ceil(count / muscles.length);

  muscles.forEach(muscle => {
    // Fallback: ha triceps vagy biceps, akkor arms-ot használunk
    let muscleKey = muscle;
    if (muscle === 'triceps' || muscle === 'biceps') {
      muscleKey = 'arms';
      console.log(`🔄 Mapping ${muscle} to arms`);
    }
    
    const muscleData = exercises[muscleKey]?.data || [];
    
    if (!muscleData || muscleData.length === 0) {
      console.warn(`⚠️  No exercises found for muscle group: ${muscleKey} (requested: ${muscle})`);
    }
    
    const take = Math.min(musclesPerGroup, muscleData.length);

    for (let i = 0; i < take && selectedExercises.length < count; i++) {
      const exercise = muscleData[i];
      if (!usedExercises.has(exercise.name)) {
        const { sets, reps, rest } = getSetsAndReps(fitnessLevel, muscle === 'core' ? 'core' : 'strength');
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
      const { sets, reps, rest } = getSetsAndReps(fitnessLevel, randomMuscle === 'core' ? 'core' : 'strength');
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
