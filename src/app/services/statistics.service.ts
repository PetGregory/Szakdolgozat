import { Injectable } from '@angular/core';
import { WorkoutEntry, UserData } from './user.service';
import { WorkoutPlan, WorkoutDay } from './workout.service';

export interface CategoryStat {
  category: string;
  categoryName: string;
  expectedCount: number;
  loggedCount: number;
  percentage: number;
  exercises: string[];
}

export interface MonthlyExerciseStat {
  exerciseName: string;
  totalSets: number;
  workoutCount: number;
  medal: 'gold' | 'silver' | 'bronze' | null;
}

export interface DailyCalorieStat {
  date: string;
  calories: number;
  target: number;
  percentage: number;
}

export interface WeeklyCalorieStat {
  weekStart: string;
  weekEnd: string;
  totalCalories: number;
  targetCalories: number;
  percentage: number;
  dailyStats: DailyCalorieStat[];
}

export interface MonthlyCalorieStat {
  monthKey: string;
  monthName: string;
  totalCalories: number;
  targetCalories: number;
  percentage: number;
  weeklyStats: WeeklyCalorieStat[];
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  
  private bodyPartMapping: { [key: string]: string[] } = {
    'push': ['chest', 'shoulders', 'upper arms', 'lower arms'],
    'pull': ['back', 'upper arms', 'lower arms'],
    'legs': ['upper legs', 'lower legs', 'waist'],
    'full_body_1': ['chest', 'back', 'upper legs', 'lower legs', 'shoulders', 'upper arms', 'lower arms', 'waist', 'neck'],
    'full_body_2': ['chest', 'back', 'upper legs', 'lower legs', 'shoulders', 'upper arms', 'lower arms', 'waist', 'neck'],
    'full_body_3': ['chest', 'back', 'upper legs', 'lower legs', 'shoulders', 'upper arms', 'lower arms', 'waist', 'neck'],
    'cardio': ['cardio', 'waist']
  };

  private dayTemplates: { [key: string]: { name: string; exerciseCount: number } } = {
    'full_body_1': { name: 'Full Body Workout A', exerciseCount: 6 },
    'full_body_2': { name: 'Full Body Workout B', exerciseCount: 6 },
    'full_body_3': { name: 'Full Body Workout C', exerciseCount: 6 },
    'push': { name: 'Push Day', exerciseCount: 8 },
    'pull': { name: 'Pull Day', exerciseCount: 6 },
    'legs': { name: 'Leg Day', exerciseCount: 6 },
    'cardio': { name: 'Cardio Day', exerciseCount: 4 }
  };

  getCategoryName(category: string): string {
    return this.dayTemplates[category]?.name || category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  }

  calculateWeeklyStats(userData: UserData, workoutPlan: WorkoutPlan | null): CategoryStat[] {
    return this.calculateWeeklyStatsForWeek(userData, workoutPlan, 0);
  }

  private matchesBodyPart(workoutBodyPart: string, mappedBodyParts: string[]): boolean {
    if (!workoutBodyPart || mappedBodyParts.length === 0) return false;
    
    const workoutBodyParts = workoutBodyPart
      .toLowerCase()
      .split(',')
      .map(bp => bp.trim())
      .filter(bp => bp.length > 0);
    
    return workoutBodyParts.some(workoutBp => {
      return mappedBodyParts.some(mappedBp => {
        const mappedBpLower = mappedBp.toLowerCase().trim();
        return workoutBp === mappedBpLower || 
               workoutBp.includes(mappedBpLower) || 
               mappedBpLower.includes(workoutBp);
      });
    });
  }

  getCategoryExercises(category: string, stats: CategoryStat[]): string[] {
    const stat = stats.find(s => s.category === category);
    return stat?.exercises || [];
  }

  getCategoryBodyParts(category: string): string[] {
    return this.bodyPartMapping[category] || [];
  }

  getMatchingCategories(exerciseBodyPart: string): string[] {
    if (!exerciseBodyPart) return [];
    
    const matchingCategories: string[] = [];
    Object.keys(this.bodyPartMapping).forEach(category => {
      if (this.matchesBodyPart(exerciseBodyPart, this.bodyPartMapping[category])) {
        matchingCategories.push(category);
      }
    });
    
    return matchingCategories;
  }

  getWeekDates(weekOffset: number = 0): { start: string; end: string; dates: string[] } {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);
    
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }

    const startStr = dates[0];
    const endStr = dates[6];

    return { start: startStr, end: endStr, dates };
  }

  getMonthDates(year: number, month: number): { start: string; end: string; dates: string[] } {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    const dates: string[] = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const yearStr = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      dates.push(`${yearStr}-${monthStr}-${dayStr}`);
    }

    const startStr = dates[0];
    const endStr = dates[dates.length - 1];

    return { start: startStr, end: endStr, dates };
  }

  calculateWeeklyStatsForWeek(userData: UserData, workoutPlan: WorkoutPlan | null, weekOffset: number = 0): CategoryStat[] {
    if (!workoutPlan || !workoutPlan.days) {
      return [];
    }

    const weekDates = this.getWeekDates(weekOffset);
    const loggedWorkouts: WorkoutEntry[] = [];

    weekDates.dates.forEach(date => {
      const dailyWorkouts = userData.dailyWorkouts?.[date] || [];
      loggedWorkouts.push(...dailyWorkouts);
    });

    const categoryCounts = new Map<string, number>();
    workoutPlan.days.forEach(day => {
      if (day.type && day.type !== 'rest' && !day.isRestDay) {
        const count = categoryCounts.get(day.type) || 0;
        categoryCounts.set(day.type, count + 1);
      }
    });

    const stats: CategoryStat[] = [];

    categoryCounts.forEach((dayCount, category) => {
      const template = this.dayTemplates[category];
      if (!template) return;

      const expectedCount = template.exerciseCount * dayCount;
      const bodyParts = this.bodyPartMapping[category] || [];
      
      const matchingExercises = loggedWorkouts.filter(workout => {
        if (!workout.bodyPart) return false;
        return this.matchesBodyPart(workout.bodyPart, bodyParts);
      });

      const uniqueExerciseNames = new Set<string>();
      matchingExercises.forEach(exercise => {
        uniqueExerciseNames.add(exercise.exerciseName);
      });

      const loggedCount = uniqueExerciseNames.size;
      const percentage = expectedCount > 0 ? Math.min(100, Math.round((loggedCount / expectedCount) * 100)) : 0;

      const categoryName = dayCount > 1 
        ? `${this.getCategoryName(category)} (${dayCount}x)`
        : this.getCategoryName(category);

      stats.push({
        category,
        categoryName,
        expectedCount,
        loggedCount,
        percentage,
        exercises: Array.from(uniqueExerciseNames)
      });
    });

    return stats.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }

  calculateMonthlyStats(userData: UserData, year: number, month: number): MonthlyExerciseStat[] {
    const monthDates = this.getMonthDates(year, month);
    const loggedWorkouts: WorkoutEntry[] = [];

    monthDates.dates.forEach(date => {
      const dailyWorkouts = userData.dailyWorkouts?.[date] || [];
      loggedWorkouts.push(...dailyWorkouts);
    });

    const exerciseStats = new Map<string, { totalSets: number; workoutCount: number }>();

    loggedWorkouts.forEach(workout => {
      const exerciseName = workout.exerciseName;
      const setsCount = workout.sets ? workout.sets.length : 0;
      
      if (exerciseStats.has(exerciseName)) {
        const stat = exerciseStats.get(exerciseName)!;
        stat.totalSets += setsCount;
        stat.workoutCount += 1;
      } else {
        exerciseStats.set(exerciseName, {
          totalSets: setsCount,
          workoutCount: 1
        });
      }
    });

    const stats: MonthlyExerciseStat[] = Array.from(exerciseStats.entries())
      .map(([exerciseName, data]) => ({
        exerciseName,
        totalSets: data.totalSets,
        workoutCount: data.workoutCount,
        medal: null as 'gold' | 'silver' | 'bronze' | null
      }))
      .sort((a, b) => b.totalSets - a.totalSets);

    if (stats.length >= 3) {
      stats[0].medal = 'gold';
      stats[1].medal = 'silver';
      stats[2].medal = 'bronze';
    } else if (stats.length === 2) {
      stats[0].medal = 'gold';
      stats[1].medal = 'silver';
    } else if (stats.length === 1) {
      stats[0].medal = 'gold';
    }

    return stats;
  }

  getWeekKey(weekStart: string): string {
    return weekStart;
  }

  getMonthKey(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  getAvailableWeeksForMonth(year: number, month: number): { label: string; weekStart: string; weekOffset: number }[] {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    const today = new Date();
    const todayDayOfWeek = today.getDay();
    const todayDiff = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek;
    const todayMonday = new Date(today);
    todayMonday.setDate(today.getDate() + todayDiff);
    todayMonday.setHours(0, 0, 0, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const firstDiff = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    const firstMonday = new Date(firstDay);
    firstMonday.setDate(firstDay.getDate() + firstDiff);
    
    const weeks: { label: string; weekStart: string; weekOffset: number }[] = [];
    let weekStart = new Date(firstMonday);
    
    while (weekStart <= lastDay || (weekStart.getMonth() === month - 1 && weekStart <= lastDay)) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const daysDiff = Math.floor((weekStart.getTime() - todayMonday.getTime()) / (1000 * 60 * 60 * 24));
      const calculatedOffset = Math.floor(daysDiff / 7);
      
      const startStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
      const endStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
      
      const startFormatted = this.formatDateForDisplay(startStr);
      const endFormatted = this.formatDateForDisplay(endStr);
      
      weeks.push({
        label: `${startFormatted} - ${endFormatted}`,
        weekStart: startStr,
        weekOffset: calculatedOffset
      });
      
      weekStart.setDate(weekStart.getDate() + 7);
      
      if (weekStart > lastDay && weekStart.getMonth() !== month - 1) {
        break;
      }
    }
    
    return weeks;
  }

  getAvailableMonths(): { label: string; year: number; month: number }[] {
    const today = new Date();
    const months: { label: string; year: number; month: number }[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      months.push({
        label,
        year: date.getFullYear(),
        month: date.getMonth() + 1
      });
    }
    
    return months;
  }

  private formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }

  calculateWeeklyCalorieStats(userData: UserData, workoutPlan: WorkoutPlan | null, weekOffset: number = 0): WeeklyCalorieStat | null {
    if (!workoutPlan || !workoutPlan.calorieTarget) {
      return null;
    }

    const weekDates = this.getWeekDates(weekOffset);
    const dailyTarget = workoutPlan.calorieTarget;
    const dailyStats: DailyCalorieStat[] = [];

    weekDates.dates.forEach(date => {
      const dailyIntake = userData.dailyCalorieIntake?.[date] || [];
      const totalCalories = dailyIntake.reduce((sum, entry) => sum + entry.calories, 0);
      const percentage = dailyTarget > 0 ? Math.min(100, Math.round((totalCalories / dailyTarget) * 100)) : 0;

      dailyStats.push({
        date,
        calories: totalCalories,
        target: dailyTarget,
        percentage
      });
    });

    const totalCalories = dailyStats.reduce((sum, day) => sum + day.calories, 0);
    const targetCalories = dailyTarget * 7;
    const percentage = targetCalories > 0 ? Math.min(100, Math.round((totalCalories / targetCalories) * 100)) : 0;

    return {
      weekStart: weekDates.start,
      weekEnd: weekDates.end,
      totalCalories,
      targetCalories,
      percentage,
      dailyStats
    };
  }

  calculateMonthlyCalorieStats(userData: UserData, workoutPlan: WorkoutPlan | null, year: number, month: number): MonthlyCalorieStat | null {
    if (!workoutPlan || !workoutPlan.calorieTarget) {
      return null;
    }

    const monthDates = this.getMonthDates(year, month);
    const dailyTarget = workoutPlan.calorieTarget;
    
    const weeks: WeeklyCalorieStat[] = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    const today = new Date();
    const todayDayOfWeek = today.getDay();
    const todayDiff = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek;
    const todayMonday = new Date(today);
    todayMonday.setDate(today.getDate() + todayDiff);
    todayMonday.setHours(0, 0, 0, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const firstDiff = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    const firstMonday = new Date(firstDay);
    firstMonday.setDate(firstDay.getDate() + firstDiff);
    
    let weekStart = new Date(firstMonday);
    
    while (weekStart <= lastDay || (weekStart.getMonth() === month - 1 && weekStart <= lastDay)) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      if (weekStart > lastDay && weekStart.getMonth() !== month - 1) {
        break;
      }
      
      const daysDiff = Math.floor((weekStart.getTime() - todayMonday.getTime()) / (1000 * 60 * 60 * 24));
      const weekOffset = Math.floor(daysDiff / 7);
      
      const weekStat = this.calculateWeeklyCalorieStats(userData, workoutPlan, weekOffset);
      if (weekStat) {
        weeks.push(weekStat);
      }
      
      weekStart.setDate(weekStart.getDate() + 7);
    }

    const totalCalories = weeks.reduce((sum, week) => sum + week.totalCalories, 0);
    const daysInMonth = lastDay.getDate();
    const targetCalories = dailyTarget * daysInMonth;
    const percentage = targetCalories > 0 ? Math.min(100, Math.round((totalCalories / targetCalories) * 100)) : 0;

    const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    return {
      monthKey: this.getMonthKey(year, month),
      monthName,
      totalCalories,
      targetCalories,
      percentage,
      weeklyStats: weeks
    };
  }

  getCurrentWeekOffset(): number {
    return 0;
  }
}

