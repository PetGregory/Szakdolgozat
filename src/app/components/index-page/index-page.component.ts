import { Component } from '@angular/core';
import { DarkModeService } from '../dark-mode-service';
import { CommonModule } from '@angular/common';
import { WorkoutPlanComponent } from '../../index-page/workout-plan/workout-plan.component';
import { ProgressComponent } from '../../index-page/progress/progress.component';


@Component({
  selector: 'app-index-page',
  imports: [CommonModule, WorkoutPlanComponent, ProgressComponent],
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.css'
})
export class IndexPageComponent {

   constructor(public darkModeService: DarkModeService) {}
  toggleDarkMode() {
    this.darkModeService.toggle();
  }

  }
