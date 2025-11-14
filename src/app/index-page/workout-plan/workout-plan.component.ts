

import { CommonModule } from '@angular/common';

import { Component } from '@angular/core';

import { DarkModeService } from '../../components/dark-mode-service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-workout-plan',
  imports: [CommonModule],
  templateUrl: './workout-plan.component.html',
  styleUrl: './workout-plan.component.css'
})

export class WorkoutPlanComponent {

   constructor(
     public darkModeService: DarkModeService,
     private router: Router
   ) {}

   goToWorkouts() {

     this.router.navigate(['/workouts']);
   }
}
