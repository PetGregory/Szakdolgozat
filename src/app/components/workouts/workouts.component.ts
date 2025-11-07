import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../auth.service';
import { WorkoutService, UserWorkoutData, WorkoutPlan } from '../../services/workout.service';
import { DarkModeService } from '../dark-mode-service';
import { UserService } from '../../services/user.service';
import { LucideAngularModule, Mars, Venus, VenusAndMars } from 'lucide-angular';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.css'
})
export class WorkoutsComponent implements OnInit {
  currentStep = 1;
  totalSteps = 5;
  isLoading = false;
  generatedPlan: WorkoutPlan | null = null;
  currentUser: any = null;
  
  Mars = Mars;
  Venus = Venus;
  VenusAndMars = VenusAndMars;

  userData = {
    gender: '',
    age: null as number | null,
    weight: null as number | null,
    height: null as number | null,
    goal: '',
    fitnessLevel: '',
    availableDays: 0
  };

  genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  readonly MIN_AGE = 13;
  readonly MAX_AGE = 100;
  readonly MIN_WEIGHT = 30;
  readonly MAX_WEIGHT = 200;
  readonly MIN_HEIGHT = 100;
  readonly MAX_HEIGHT = 250;

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
    public darkModeService: DarkModeService,
    private userService: UserService
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

  validateAge(age: number | null): boolean {
    if (age === null) return false;
    return age >= this.MIN_AGE && age <= this.MAX_AGE;
  }

  validateWeight(weight: number | null): boolean {
    if (weight === null) return false;
    return weight >= this.MIN_WEIGHT && weight <= this.MAX_WEIGHT;
  }

  validateHeight(height: number | null): boolean {
    if (height === null) return false;
    return height >= this.MIN_HEIGHT && height <= this.MAX_HEIGHT;
  }

  onAgeChange(value: number | null | string) {
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
      this.userData.age = null;
      return;
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    this.userData.age = numValue;
  }

  onWeightChange(value: number | null | string) {
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
      this.userData.weight = null;
      return;
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    this.userData.weight = numValue;
  }

  onHeightChange(value: number | null | string) {
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
      this.userData.height = null;
      return;
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    this.userData.height = numValue;
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.userData.gender !== '';
      case 2:
        return this.validateAge(this.userData.age) && 
               this.validateWeight(this.userData.weight) && 
               this.validateHeight(this.userData.height);
      case 3:
        return this.userData.goal !== '';
      case 4:
        return this.userData.fitnessLevel !== '';
      case 5:
        return this.userData.availableDays > 0;
      default:
        return false;
    }
  }

  async generateWorkout(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!this.currentUser) {
      alert('Please log in to generate a workout plan');
      return;
    }

    if (!this.canProceed()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    this.isLoading = true;

    const workoutData: UserWorkoutData = {
      userId: this.currentUser.uid,
      age: this.userData.age || 25,
      weight: this.userData.weight || 70,
      height: this.userData.height || 175,
      goal: this.userData.goal,
      fitnessLevel: this.userData.fitnessLevel,
      availableDays: this.userData.availableDays,
      gender: this.userData.gender
    };

    try {
      console.log('🚀 Starting workout generation with data:', workoutData);
      const response = await firstValueFrom(this.workoutService.generateWorkoutPlan(workoutData));
      console.log('📦 Response received:', response);
      
      if (response && response.workoutPlan) {
        this.generatedPlan = response.workoutPlan;
        console.log('✅ Generated plan assigned:', this.generatedPlan);
        console.log('📊 Plan details:', {
          daysCount: this.generatedPlan.days?.length,
          goal: this.generatedPlan.goal,
          fitnessLevel: this.generatedPlan.fitnessLevel,
          totalDays: this.generatedPlan.totalDays,
          restDays: this.generatedPlan.restDays
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error('❌ Invalid response structure:', response);
        alert('Failed to generate workout plan: Invalid response from server');
        this.generatedPlan = null;
      }
    } catch (error: any) {
      console.error('❌ Error generating workout:', error);
      const errorMessage = error?.error?.details || error?.error?.error || error?.message || 'Failed to generate workout plan. Please try again.';
      alert('Error: ' + errorMessage);
      this.generatedPlan = null;
    } finally {
      this.isLoading = false;
      console.log('🏁 Loading finished. Generated plan is:', this.generatedPlan ? 'SET' : 'NULL');
    }
  }

  resetForm() {
    this.currentStep = 1;
    this.userData = {
      gender: '',
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

  async saveWorkoutPlan() {
    if (!this.currentUser || !this.generatedPlan) {
      alert('Please generate a workout plan first');
      return;
    }

    try {
      await this.userService.saveWorkoutPlan(
        this.currentUser.uid,
        this.generatedPlan,
        {
          gender: this.userData.gender,
          age: this.userData.age,
          weight: this.userData.weight,
          height: this.userData.height,
          goal: this.userData.goal,
          fitnessLevel: this.userData.fitnessLevel,
          availableDays: this.userData.availableDays
        }
      );

      alert('Workout plan saved successfully!');
      console.log('Workout plan saved to user document in Firestore');
    } catch (error: any) {
      console.error('Error saving workout plan:', error);
      alert('Failed to save workout plan: ' + error.message);
    }
  }

  
}