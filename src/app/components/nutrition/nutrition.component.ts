import { Component, OnInit }  from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService }  from '../../auth.service';
import { NutritionService, NutritionItem, FoodEntry } from '../../services/nutrition.service';
import { UserService } from '../../services/user.service';
import { DarkModeService } from '../dark-mode-service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [ CommonModule , FormsModule, LucideAngularModule ],
  templateUrl: './nutrition.component.html',
  styleUrl: './nutrition.component.css'
})
export class NutritionComponent implements OnInit {

  searchQuery = ''
  searchResults: NutritionItem[] = []
  isLoading = false;
  selectedFood: NutritionItem | null = null
  amountInGrams = 100;
  currentUser: any = null
  user: any = null;
  today = ''
  selectedDate = ''

  getTodayDateString(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  todayEntries: FoodEntry[] = []
  totalCaloriesToday = 0;
  calendarVisible = false;
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  showMonthYearPicker = false;

  CalendarIcon = Calendar;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;


  constructor(
    private authService: AuthService,
    public nutritionService: NutritionService,
    private userService: UserService,
    public darkModeService: DarkModeService,
    private router: Router
  ) {}

  async loadUserData() {
    if(!this.currentUser) return
    this.user = await this.userService.getUser(this.currentUser.uid)
    if(this.user){
      this.loadEntriesForDate(this.selectedDate)
    }
  }

  loadEntriesForDate(date: string) {
    if(!this.user?.dailyCalorieIntake?.[date]) {
      this.todayEntries = []
      this.totalCaloriesToday = 0
      return
    }
    this.todayEntries = this.user.dailyCalorieIntake[date]
    this.totalCaloriesToday = this.userService.getDailyCalorieIntake(this.user, date)
  }

  selectDate(date: string) {
    if (date > this.today) {
      alert('You can only add calories for today or past dates.')
      return
    }
    this.selectedDate = date
    this.loadEntriesForDate(date)
    this.calendarVisible = false
  }

  isFutureDate(date: string): boolean {
    return date > this.today
  }

  isToday(date: string): boolean {
    return date === this.today
  }

  isSelected(date: string): boolean {
    return date === this.selectedDate
  }

  hasEntries(date: string): boolean {
    if(!this.user?.dailyCalorieIntake?.[date]) return false
    return this.user.dailyCalorieIntake[date].length > 0
  }

  getCalendarDays(): { date: string; day: number; isCurrentMonth: boolean }[] {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1)
    const startDate = new Date(firstDay)

    const dayOfWeek = startDate.getDay()

    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    const days: { date: string; day: number; isCurrentMonth: boolean }[] = []
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      

      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`
      
      const isCurrentMonth = currentDate.getMonth() === this.currentMonth
      
      days.push({
        date: dateString,
        day: currentDate.getDate(),
        isCurrentMonth
      })
    }
    
    return days
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11
      this.currentYear--
    } else {
      this.currentMonth--
    }
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0
      this.currentYear++
    } else {
      this.currentMonth++
    }
  }

  getMonthName(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December']
    return months[this.currentMonth]
  }

  getMonthNames(): string[] {
    return ['January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December']
  }

  getAvailableYears(): number[] {
    const currentYear = new Date().getFullYear()
    const years: number[] = []
    for (let i = currentYear - 10; i <= currentYear; i++) {
      years.push(i)
    }
    return years
  }

  selectMonth(monthIndex: number) {
    this.currentMonth = monthIndex
    this.showMonthYearPicker = false
  }

  selectYear(year: number) {
    this.currentYear = year
    this.showMonthYearPicker = false
  }

  toggleMonthYearPicker() {
    this.showMonthYearPicker = !this.showMonthYearPicker
  }

  goToToday() {
    this.today = this.getTodayDateString()
    const today = new Date()
    this.currentMonth = today.getMonth()
    this.currentYear = today.getFullYear()
    this.selectDate(this.today)
  }

  closeCalendarOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.calendar-container')) {
      this.calendarVisible = false
    }
  }

  async searchFood() {
    if(!this.searchQuery.trim()) return

    this.isLoading = true
    this.searchResults = []
    this.selectedFood = null

    try {
      const results = await firstValueFrom(this.nutritionService.searchFood(this.searchQuery))
      this.searchResults = results
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed to search'))
    } finally {
      this.isLoading = false
    }
  }

  selectFood(food: NutritionItem) {
    this.selectedFood = food
    this.amountInGrams = food.serving_size_g || 100
  }

  async addFood() {
    if(!this.selectedFood || !this.currentUser) return
    if(this.amountInGrams <= 0){
      alert('Enter valid amount')
      return
    }

    if(this.selectedDate > this.today) {
      alert('You can only add calories for today or past dates.')
      return
    }

    const cal = this.nutritionService.calculateCaloriesForAmount(this.selectedFood, this.amountInGrams)
    const protein = this.nutritionService.calculateProteinForAmount(this.selectedFood, this.amountInGrams)

    const entry: FoodEntry = {
      id: Date.now().toString(),
      name: this.selectedFood.name,
      amount: this.amountInGrams,
      calories: cal,
      protein: protein,
      date: this.selectedDate
    }

    try {
      await this.userService.addFoodEntry(this.currentUser.uid, entry)
      await this.loadUserData()
      this.selectedFood = null
      this.searchQuery = ''
      this.searchResults = []
      this.amountInGrams = 100
    } catch (error: any){
      alert('Error: ' + (error?.message || 'Failed'))
    }
  }

  async removeFoodEntry(entryId: string){
    if(!this.currentUser) return
    try{
      await this.userService.removeFoodEntry(this.currentUser.uid, this.selectedDate, entryId)
      await this.loadUserData()
    }catch(error:any){
      alert('Error: ' + (error?.message || 'Failed'))
    }
  }

  getRemainingCalories(): number {
    if(!this.user?.calorieTarget) return 0
    return this.user.calorieTarget - this.totalCaloriesToday
  }

  getProgressPercentage(): number {
    if(!this.user?.calorieTarget) return 0
    return Math.min(100, Math.round((this.totalCaloriesToday / this.user.calorieTarget) * 100))
  }

  Math = Math

  getCalculatedCalories(): number {
    if(!this.selectedFood) return 0
    return this.nutritionService.calculateCaloriesForAmount(this.selectedFood, this.amountInGrams)
  }

  async ngOnInit() {
    this.today = this.getTodayDateString()
    this.selectedDate = this.getTodayDateString()

    this.authService.currentUser$.subscribe(async user=>{
      this.currentUser = user
      if(!user){
        this.router.navigate(['/login'])
      } else {
        await this.loadUserData()
      }
    })
  }
}