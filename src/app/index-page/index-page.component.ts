import { Component } from '@angular/core';
import { DarkModeService } from '../components/dark-mode-service';
import { CommonModule } from '@angular/common';
import { WorkoutPlanComponent } from './workout-plan/workout-plan.component';
import { ProgressComponent } from './progress/progress.component';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-index-page',
  imports: [CommonModule, WorkoutPlanComponent, ProgressComponent],
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.css'
})
export class IndexPageComponent {

  isLoggedIn = false;
  currentUser$!: any;
   constructor(public darkModeService: DarkModeService, private authService: AuthService, private router: Router) {}
  
   toggleDarkMode() {
    this.darkModeService.toggle();
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {

      this.currentUser$ = this.authService.currentUser$;
      this.isLoggedIn = !!user;
    });
  }
  
  goToLogIn() {
    this.router.navigate(['/login']);
  }
  }
