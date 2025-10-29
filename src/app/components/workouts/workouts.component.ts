import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { WorkoutService, UserWorkoutData, WorkoutPlan } from '../../services/workout.service';
import { DarkModeService } from '../dark-mode-service';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.css'
})
export class WorkoutsComponent implements OnInit {
  currentStep = 1;
  totalSteps = 4;
  isLoading = false;
  generatedPlan: WorkoutPlan | null = null;
  currentUser: any = null;

  userData = {
    age: null as number | null,
    weight: null as number | null,
    height: null as number | null,
    goal: '',
    fitnessLevel: '',
    availableDays: 0
  };

  goals = [
    { value: 'weight_loss', label: 'Weight Loss', icon: '🔥' },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
    { value: 'endurance', label: 'Endurance', icon: '🏃' },
    { value: 'general_fitness', label: 'General Fitness', icon: '⚡' }
  ];

  fitnessLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to working out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced athlete' }
  ];

  constructor(
    private authService: AuthService,
    private workoutService: WorkoutService,
    private router: Router,
    public darkModeService: DarkModeService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.userData.age !== null && this.userData.weight !== null && this.userData.height !== null;
      case 2:
        return this.userData.goal !== '';
      case 3:
        return this.userData.fitnessLevel !== '';
      case 4:
        return this.userData.availableDays > 0;
      default:
        return false;
    }
  }

  async generateWorkout() {
    if (!this.currentUser || !this.canProceed()) {
      return;
    }

    this.isLoading = true;

    const workoutData: UserWorkoutData = {
      userId: this.currentUser.uid,
      age: this.userData.age || 25,
      weight: this.userData.weight || 70,
      height: this.userData.height || 170,
      goal: this.userData.goal,
      fitnessLevel: this.userData.fitnessLevel,
      availableDays: this.userData.availableDays
    };

    try {
      const response = await this.workoutService.generateWorkoutPlan(workoutData).toPromise();
      this.generatedPlan = response?.workoutPlan || null;
      console.log('Workout generated successfully:', response);
    } catch (error) {
      console.error('Error generating workout:', error);
      alert('Failed to generate workout plan. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  resetForm() {
    this.currentStep = 1;
    this.userData = {
      age: null,
      weight: null,
      height: null,
      goal: '',
      fitnessLevel: '',
      availableDays: 0
    };
    this.generatedPlan = null;
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}