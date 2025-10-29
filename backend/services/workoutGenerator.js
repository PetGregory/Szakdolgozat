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
    console.log('Loaded data keys:', Object.keys(data || {}));
  } catch (error) {
    console.error('Error loading from Firestore, using fallback:', error.message);
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
  
  console.log('All required data loaded:', {
    hasExercises: !!exercises,
    hasWorkoutTemplates: !!workoutTemplates,
    hasDayTemplates: !!dayTemplates,
    dayTemplateKeys: Object.keys(dayTemplates || {})
  });

  // 2️⃣ Template kiválasztása a cél alapján
  console.log('Selecting template:', { goal, fitnessLevel });
  console.log('Available goals:', Object.keys(workoutTemplates || {}));
  
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
  
  // 2b️⃣ Validáció: A felhasználó által választott workout napok számát használjuk
  // Mindig 7 nap lesz összesen, a maradék rest day lesz
  console.log(`🔍 Validation check: ${availableDays} workout days selected, template has ${restDayCountInTemplate} rest days`);
  
  // Az adjustedAvailableDays = az eredeti, de biztosítjuk hogy ne legyen több mint 7
  let adjustedAvailableDays = Math.min(availableDays, 7);

  // 3️⃣ Napok kiválasztása template sorrendben - MINDIG 7 nap lesz
  // 1. Template sorrendben kiválasztjuk a kért számú workout napot
  // 2. A template-ből hozzáadjuk a rest day-eket a helyükön
  // 3. Ha még nincs 7 nap, rest day-ekkel töltjük fel
  console.log('📅 Selecting days in template order (target: always 7 days):', {
    originalAvailableDays: availableDays,
    adjustedAvailableDays,
    template,
    dayTemplateKeys: Object.keys(dayTemplates)
  });
  
  const selectedDays = [];
  let workoutDaysCount = 0;
  
  // Első kör: végigmegyünk a template-en, kiválasztjuk a workout napokat és a rest day-eket
  for (let i = 0; i < template.length; i++) {
    const dayType = template[i];
    
    if (dayType === 'rest day' || dayType === 'rest') {
      // Rest day-t mindig hozzáadjuk a helyükön (de csak ha még nincs 7 nap)
      if (selectedDays.length < 7) {
        selectedDays.push(dayType);
      }
    } else if (dayTemplates && dayTemplates[dayType]) {
      // Workout napot csak ha még van szükség rá és van hely (max 7 nap)
      if (workoutDaysCount < adjustedAvailableDays && selectedDays.length < 7) {
        selectedDays.push(dayType);
        workoutDaysCount++;
      }
    } else {
      console.warn(`⚠️ Skipping invalid dayType: ${dayType}`);
    }
  }
  
  // Második kör: ha még nincs elég workout nap, körbevesszük a template-et (csak workout napokat)
  let loopIndex = 0;
  const maxLoops = template.length * 5; // Védés végtelen ciklus ellen
  
  while (workoutDaysCount < adjustedAvailableDays && selectedDays.length < 7 && loopIndex < maxLoops) {
    const dayType = template[loopIndex % template.length];
    loopIndex++;
    
    // Rest day-eket kihagyjuk a kiegészítésből
    if (dayType === 'rest day' || dayType === 'rest') {
      continue;
    }
    
    // Érvényes workout napot hozzáadjuk
    if (dayTemplates && dayTemplates[dayType]) {
      selectedDays.push(dayType);
      workoutDaysCount++;
    }
  }
  
  // Harmadik kör: Ha még nincs 7 nap, rest day-ekkel töltjük fel
  while (selectedDays.length < 7) {
    selectedDays.push('rest day');
  }
  
  console.log('✅ Selected days in template order (7 days total):', selectedDays);

  // Számoljuk meg a ténylegesen kiválasztott rest day-eket
  const actualRestDays = selectedDays.filter(d => d === 'rest day' || d === 'rest').length;
  const actualTotalDays = 7; // Mindig 7 nap

  const workoutPlan = {
    weeks: 4,
    goal,
    fitnessLevel,
    availableDays: adjustedAvailableDays, // A felhasználó által választott workout napok száma
    originalAvailableDays: availableDays, // Eltároljuk az eredetit is info célból
    restDays: actualRestDays, // A ténylegesen kiválasztott rest day-ek száma
    totalDays: actualTotalDays, // Mindig 7
    days: []
  };
  
  console.log(`✅ Workout plan structure:`, {
    workoutDays: workoutPlan.availableDays,
    restDays: workoutPlan.restDays,
    totalDays: workoutPlan.totalDays,
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
  
  // Biztosítjuk hogy mindig 7 nap legyen (ha valamiért kevesebb generálódott, rest day-ekkel pótoljuk)
  while (workoutPlan.days.length < 7) {
    workoutPlan.days.push({
      day: workoutPlan.days.length + 1,
      name: "Rest Day",
      type: "rest",
      isRestDay: true,
      exercises: []
    });
  }
  
  // TotalDays mindig 7
  workoutPlan.totalDays = 7;
  
  // Frissítjük a restDays számát a ténylegesen generált napok alapján
  workoutPlan.restDays = workoutPlan.days.filter(d => d.isRestDay === true).length;
  
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
