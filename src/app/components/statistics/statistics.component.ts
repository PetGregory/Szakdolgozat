import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth.service';
import { UserService, UserData } from '../../services/user.service';
import { StatisticsService, CategoryStat, MonthlyExerciseStat, WeeklyCalorieStat, MonthlyCalorieStat } from '../../services/statistics.service';
import { WorkoutPlan } from '../../services/workout.service';
import { DarkModeService } from '../dark-mode-service';
import { LucideAngularModule, Calendar } from 'lucide-angular';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  userData: UserData | null = null;
  weeklyStats: CategoryStat[] = [];
  monthlyStats: MonthlyExerciseStat[] = [];
  weeklyCalorieStats: WeeklyCalorieStat | null = null;
  monthlyCalorieStats: MonthlyCalorieStat | null = null;
  expandedCategory: string | null = null;
  expandedWeeklyCalories: boolean = false;
  expandedMonthlyCalories: boolean = false;
  expandedWeekInMonth: string | null = null;
  weekStartDate: string = '';
  weekEndDate: string = '';
  monthName: string = '';
  currentWeekOffset: number = 0;
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1;
  selectedWeekKey: string = '';
  selectedMonthKey: string = '';
  datePickerVisible: boolean = false;
  datePickerStep: 'year' | 'month' | 'week' = 'year';
  selectedPickerYear: number = new Date().getFullYear();
  selectedPickerMonth: number = new Date().getMonth() + 1;
  selectedPickerWeek: { weekStart: string; weekOffset: number } | null = null;
  availableYears: number[] = [];
  availableWeeks: { label: string; weekStart: string; weekOffset: number }[] = [];
  CalendarIcon = Calendar;
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
        await this.loadMonthlyStats();
        await this.loadCalorieStats();
        this.initializeDatePicker();
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

      const weekDates = this.statisticsService.getWeekDates(this.currentWeekOffset);
      const weekKey = this.statisticsService.getWeekKey(weekDates.start);
      this.selectedWeekKey = weekKey;
      
      this.weekStartDate = this.formatDate(weekDates.start);
      this.weekEndDate = this.formatDate(weekDates.end);

      const savedStats = this.userData.weeklyStatistics?.[weekKey];
      const statsCalculatedAt = savedStats?.calculatedAt ? new Date(savedStats.calculatedAt) : null;
      const userUpdatedAt = this.userData.updatedAt ? new Date(this.userData.updatedAt) : null;
      
      const shouldUseCache = savedStats && savedStats.stats && 
        statsCalculatedAt && userUpdatedAt && statsCalculatedAt >= userUpdatedAt;
      
      if (shouldUseCache) {
        this.weeklyStats = savedStats.stats;
      } else {
        const workoutPlan = this.userData.workout as WorkoutPlan | null;
        this.weeklyStats = this.statisticsService.calculateWeeklyStatsForWeek(this.userData, workoutPlan, this.currentWeekOffset);
        
        if (this.weeklyStats.length > 0) {
          await this.userService.saveWeeklyStatistics(this.currentUser.uid, weekKey, this.weeklyStats);
        }
      }
    } catch (error) {
      console.error('Error loading weekly stats:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadMonthlyStats() {
    if (!this.currentUser) return;

    try {
      if (!this.userData) {
        this.userData = await this.userService.getUser(this.currentUser.uid);
      }
      
      if (!this.userData) {
        return;
      }

      const monthKey = this.statisticsService.getMonthKey(this.currentYear, this.currentMonth);
      this.selectedMonthKey = monthKey;
      this.monthName = new Date(this.currentYear, this.currentMonth - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

      const savedStats = this.userData.monthlyStatistics?.[monthKey];
      const statsCalculatedAt = savedStats?.calculatedAt ? new Date(savedStats.calculatedAt) : null;
      const userUpdatedAt = this.userData.updatedAt ? new Date(this.userData.updatedAt) : null;
      
      const shouldUseCache = savedStats && savedStats.stats && 
        statsCalculatedAt && userUpdatedAt && statsCalculatedAt >= userUpdatedAt;
      
      if (shouldUseCache) {
        this.monthlyStats = savedStats.stats;
      } else {
        this.monthlyStats = this.statisticsService.calculateMonthlyStats(this.userData, this.currentYear, this.currentMonth);
        
        if (this.monthlyStats.length > 0) {
          await this.userService.saveMonthlyStatistics(this.currentUser.uid, monthKey, this.monthlyStats);
        }
      }
    } catch (error) {
      console.error('Error loading monthly stats:', error);
    }
  }

  async loadCalorieStats() {
    if (!this.currentUser || !this.userData) return;

    try {
      const workoutPlan = this.userData.workout as WorkoutPlan | null;
      
      this.weeklyCalorieStats = this.statisticsService.calculateWeeklyCalorieStats(this.userData, workoutPlan, this.currentWeekOffset);
      this.monthlyCalorieStats = this.statisticsService.calculateMonthlyCalorieStats(this.userData, workoutPlan, this.currentYear, this.currentMonth);
    } catch (error) {
      console.error('Error loading calorie stats:', error);
    }
  }

  initializeDatePicker() {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    for (let i = currentYear; i >= currentYear - 2; i--) {
      this.availableYears.push(i);
    }
  }

  openDatePicker() {
    this.datePickerVisible = true;
    this.datePickerStep = 'year';
    this.selectedPickerYear = this.currentYear;
    this.selectedPickerMonth = this.currentMonth;
    this.selectedPickerWeek = null;
  }

  closeDatePicker() {
    this.datePickerVisible = false;
    this.datePickerStep = 'year';
    this.selectedPickerWeek = null;
  }

  selectYear(year: number) {
    this.selectedPickerYear = year;
    this.datePickerStep = 'month';
  }

  selectMonth(month: number) {
    this.selectedPickerMonth = month;
    this.datePickerStep = 'week';
    this.availableWeeks = this.statisticsService.getAvailableWeeksForMonth(this.selectedPickerYear, this.selectedPickerMonth);
  }

  selectWeek(weekStart: string, weekOffset: number) {
    this.selectedPickerWeek = { weekStart, weekOffset };
  }

  confirmDateSelection() {
    if (this.selectedPickerWeek) {
      this.currentYear = this.selectedPickerYear;
      this.currentMonth = this.selectedPickerMonth;
      this.currentWeekOffset = this.selectedPickerWeek.weekOffset;
      this.closeDatePicker();
      this.loadWeeklyStats();
      this.loadMonthlyStats();
      this.loadCalorieStats();
    }
  }

  goToCurrentWeek() {
    this.currentWeekOffset = 0;
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth() + 1;
    this.closeDatePicker();
    this.loadWeeklyStats();
    this.loadMonthlyStats();
    this.loadCalorieStats();
  }

  toggleWeeklyCalories() {
    this.expandedWeeklyCalories = !this.expandedWeeklyCalories;
  }

  toggleMonthlyCalories() {
    this.expandedMonthlyCalories = !this.expandedMonthlyCalories;
  }

  toggleWeekInMonth(weekStart: string) {
    if (this.expandedWeekInMonth === weekStart) {
      this.expandedWeekInMonth = null;
    } else {
      this.expandedWeekInMonth = weekStart;
    }
  }

  getDayName(dateString: string): string {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  formatDateFull(dateString: string): string {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }

  canConfirmSelection(): boolean {
    return this.datePickerStep === 'week' && this.selectedPickerWeek !== null;
  }

  getMonthNames(): string[] {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  }

  getSelectedWeekLabel(): string {
    if (!this.selectedPickerWeek) return '';
    const weekDates = this.statisticsService.getWeekDates(this.selectedPickerWeek.weekOffset);
    return `${this.formatDate(weekDates.start)} - ${this.formatDate(weekDates.end)}`;
  }

  closeDatePickerOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.date-picker-container')) {
      this.closeDatePicker();
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

