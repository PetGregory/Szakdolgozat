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

  getWeekDates(): { start: string; end: string; dates: string[] } {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
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

  getCategoryName(category: string): string {
    return this.dayTemplates[category]?.name || category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  }

  calculateWeeklyStats(userData: UserData, workoutPlan: WorkoutPlan | null): CategoryStat[] {
    if (!workoutPlan || !workoutPlan.days) {
      return [];
    }

    const weekDates = this.getWeekDates();
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
}

