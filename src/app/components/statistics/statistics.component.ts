import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth.service';
import { UserService, UserData } from '../../services/user.service';
import { StatisticsService, CategoryStat } from '../../services/statistics.service';
import { WorkoutPlan } from '../../services/workout.service';
import { DarkModeService } from '../dark-mode-service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  userData: UserData | null = null;
  weeklyStats: CategoryStat[] = [];
  expandedCategory: string | null = null;
  weekStartDate: string = '';
  weekEndDate: string = '';
  isLoading = false;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private statisticsService: StatisticsService,
    private router: Router,
    public darkModeService: DarkModeService
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(async user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        await this.loadWeeklyStats();
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async loadWeeklyStats() {
    if (!this.currentUser) return;

    this.isLoading = true;
    try {
      this.userData = await this.userService.getUser(this.currentUser.uid);
      
      if (!this.userData) {
        return;
      }

      const workoutPlan = this.userData.workout as WorkoutPlan | null;
      const weekDates = this.statisticsService.getWeekDates();
      
      this.weekStartDate = this.formatDate(weekDates.start);
      this.weekEndDate = this.formatDate(weekDates.end);

      this.weeklyStats = this.statisticsService.calculateWeeklyStats(this.userData, workoutPlan);
    } catch (error) {
      console.error('Error loading weekly stats:', error);
    } finally {
      this.isLoading = false;
    }
  }

  toggleCategory(category: string) {
    if (this.expandedCategory === category) {
      this.expandedCategory = null;
    } else {
      this.expandedCategory = category;
    }
  }

  getCategoryExercises(category: string): string[] {
    return this.statisticsService.getCategoryExercises(category, this.weeklyStats);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }

  isCategoryExpanded(category: string): boolean {
    return this.expandedCategory === category;
  }

  navigateToWorkouts() {
    this.router.navigate(['/workouts']);
  }

  getCategoryBodyPartsText(category: string): string {
    const bodyParts = this.statisticsService.getCategoryBodyParts(category);
    return bodyParts.join(', ') || 'N/A';
  }
}

