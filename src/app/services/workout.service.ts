import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserWorkoutData {
  userId: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  fitnessLevel: string;
  availableDays: number;
}

export interface Exercise {
  name: string;
  muscle: string;
  equipment: string;
  sets: number;
  reps: string;
  rest: number;
}

export interface WorkoutDay {
  day: number;
  name: string;
  type: string;
  isRestDay?: boolean;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  weeks: number;
  goal: string;
  fitnessLevel: string;
  availableDays: number;
  originalAvailableDays?: number;
  restDays?: number;
  totalDays?: number;
  days: WorkoutDay[];
}

export interface WorkoutResponse {
  success: boolean;
  workoutId: string;
  workoutPlan: WorkoutPlan;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  generateWorkoutPlan(userData: UserWorkoutData): Observable<WorkoutResponse> {
    return this.http.post<WorkoutResponse>(`${this.apiUrl}/workouts/generate`, userData);
  }

  getUserWorkouts(userId: string): Observable<{ workouts: any[] }> {
    return this.http.get<{ workouts: any[] }>(`${this.apiUrl}/workouts/${userId}`);
  }
}
