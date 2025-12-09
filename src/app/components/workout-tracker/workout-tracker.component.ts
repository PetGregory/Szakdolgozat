import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import { UserService, WorkoutEntry, WorkoutSet } from '../../services/user.service';
import { DarkModeService } from '../dark-mode-service';
import { firstValueFrom, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-workout-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './workout-tracker.component.html',
})
export class WorkoutTrackerComponent implements OnInit, OnDestroy {
  searchQuery = ''
  searchResults: Exercise[] = []
  isLoading = false;
  selectedExercise: Exercise | null = null
  searchError = ''
  currentUser: any = null
  user: any = null;
  today = ''
  selectedDate = ''
  selectedBodyPart = ''
  editingWorkout: WorkoutEntry | null = null
  hasSearched = false

  bodyParts = [
    'neck', 'lower arms', 'shoulders', 'cardio', 'upper arms',
    'chest', 'lower legs', 'back', 'upper legs', 'waist'
  ]

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  getTodayDateString(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  todayWorkouts: WorkoutEntry[] = []
  calendarVisible = false;
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  showMonthYearPicker = false;
  sortBy: 'bodyPart' | 'name' | 'none' = 'none';

  CalendarIcon = Calendar;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;

  numberOfSets = 1;
  selectedSets: WorkoutSet[] = []

  constructor(
    private authService: AuthService,
    public exerciseService: ExerciseService,
    private userService: UserService,
    public darkModeService: DarkModeService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.today = this.getTodayDateString()
    this.selectedDate = this.getTodayDateString()
    this.initializeSets(1)

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          this.searchResults = []
          this.hasSearched = false
          return new Observable<Exercise[]>(observer => {
            observer.next([])
            observer.complete()
          })
        }
        this.isLoading = true
        this.hasSearched = false
        return this.exerciseService.searchExercises(query, this.selectedBodyPart)
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results) => {
        this.searchResults = results
        this.isLoading = false
        this.hasSearched = true
      },
      error: (err) => {
        console.error('Search error:', err)
        this.isLoading = false
        this.searchResults = []
        this.hasSearched = true
      }
    })

    this.authService.currentUser$.subscribe(async user=>{
      this.currentUser = user
      if(!user){
        this.router.navigate(['/login'])
      } else {
        await this.loadUserData()
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  async loadUserData() {
    if(!this.currentUser) return
    this.user = await this.userService.getUser(this.currentUser.uid)
    if(this.user){
      this.loadWorkoutsForDate(this.selectedDate)
    }
  }

  loadWorkoutsForDate(date: string) {
    if(!this.user?.dailyWorkouts?.[date]) {
      this.todayWorkouts = []
      return
    }
    this.todayWorkouts = this.user.dailyWorkouts[date]
    this.sortWorkouts()
  }

  sortWorkouts() {
    if (this.sortBy === 'none') {
      return
    }
    
    this.todayWorkouts.sort((a, b) => {
      if (this.sortBy === 'bodyPart') {
        const aBodyPart = a.bodyPart || ''
        const bBodyPart = b.bodyPart || ''
        return aBodyPart.localeCompare(bBodyPart)
      } else if (this.sortBy === 'name') {
        return a.exerciseName.localeCompare(b.exerciseName)
      }
      return 0
    })
  }

  onSortChange() {
    this.sortWorkouts()
  }

  selectDate(date: string) {
    if (date > this.today) {
      alert('You can only add workouts for today or past dates.')
      return
    }
    this.selectedDate = date
    this.loadWorkoutsForDate(date)
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

  hasWorkouts(date: string): boolean {
    if(!this.user?.dailyWorkouts?.[date]) return false
    return this.user.dailyWorkouts[date].length > 0
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

  onSearchInput() {
    this.validateSearchInput()
    if (this.searchQuery.trim().length >= 2) {
      this.searchSubject.next(this.searchQuery)
    } else {
      this.searchResults = []
    }
  }

  onBodyPartChange() {
    if (this.searchQuery.trim().length >= 2) {
      this.searchSubject.next(this.searchQuery)
    }
  }

  formatBodyPart(bodyPart: string): string {
    return bodyPart.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  validateSearchInput() {
    if (this.searchQuery.trim().length === 0) {
      this.searchError = ''
    } else if (this.searchQuery.trim().length < 2) {
      this.searchError = 'Minimum 2 characters required'
    } else if (this.searchQuery.trim().length > 10) {
      this.searchError = 'Maximum 10 characters allowed'
    } else {
      this.searchError = ''
    }
  }

  async searchExercises() {
    if (this.searchQuery.trim().length >= 2) {
      this.hasSearched = false
      this.searchSubject.next(this.searchQuery)
    }
  }

  selectExercise(exercise: Exercise) {
    this.selectedExercise = exercise
    this.numberOfSets = 1
    this.initializeSets(1)
    this.searchResults = []
    this.searchQuery = ''
    this.hasSearched = false
    this.editingWorkout = null
  }

  editWorkout(workout: WorkoutEntry) {
    this.editingWorkout = workout
    this.selectedExercise = {
      id: workout.exerciseId,
      name: workout.exerciseName,
      bodyPart: workout.bodyPart || '',
      equipment: '',
      target: '',
      gifUrl: workout.imageUrl
    }
    this.numberOfSets = workout.sets.length
    this.selectedSets = workout.sets.map(set => ({
      ...set,
      id: set.id || `set-${Date.now()}-${set.setNumber}`
    }))
  }

  cancelEdit() {
    this.editingWorkout = null
    this.selectedExercise = null
    this.searchResults = []
    this.searchQuery = ''
    this.selectedSets = []
    this.numberOfSets = 1
  }

  setNumberOfSets(count: number) {
    if (count < 1) count = 1
    if (count > 10) count = 10
    this.numberOfSets = count
    this.initializeSets(count)
  }

  initializeSets(count: number) {
    this.selectedSets = []
    for (let i = 0; i < count; i++) {
      this.selectedSets.push({
        id: `set-${Date.now()}-${i}`,
        weight: 0,
        reps: 0,
        setNumber: i + 1
      })
    }
  }


  removeSet(index: number) {
    if (this.selectedSets.length > 1) {
      this.selectedSets.splice(index, 1)
      this.selectedSets.forEach((set, i) => {
        set.setNumber = i + 1
      })
      this.numberOfSets = this.selectedSets.length
    }
  }

  async saveWorkout() {
    if(!this.selectedExercise || !this.currentUser) {
      alert('Please select an exercise')
      return
    }

    if(this.selectedDate > this.today) {
      alert('You can only add workouts for today or past dates.')
      return
    }

    const validSets = this.selectedSets.filter(set => set.weight > 0 && set.reps > 0)
    if(validSets.length === 0) {
      alert('Please enter at least one set with weight and reps')
      return
    }

    if (this.editingWorkout) {
      const updatedEntry: WorkoutEntry = {
        ...this.editingWorkout,
        exerciseName: this.selectedExercise.name,
        exerciseId: this.selectedExercise.id,
        imageUrl: this.selectedExercise.gifUrl,
        sets: validSets,
        bodyPart: this.selectedExercise.bodyPart
      }

      try {
        await this.userService.updateWorkoutEntry(
          this.currentUser.uid, 
          this.selectedDate, 
          this.editingWorkout.id, 
          updatedEntry
        )
        await this.loadUserData()
        this.cancelEdit()
      } catch (error: any) {
        alert('Error: ' + (error?.message || 'Failed'))
      }
    } else {
      const entry: WorkoutEntry = {
        id: Date.now().toString(),
        exerciseName: this.selectedExercise.name,
        exerciseId: this.selectedExercise.id,
        imageUrl: this.selectedExercise.gifUrl,
        date: this.selectedDate,
        sets: validSets,
        bodyPart: this.selectedExercise.bodyPart
      }

      try {
        await this.userService.addWorkoutEntry(this.currentUser.uid, entry)
        await this.loadUserData()
        this.selectedExercise = null
        this.searchQuery = ''
        this.searchResults = []
        this.numberOfSets = 1
        this.initializeSets(1)
      } catch (error: any){
        alert('Error: ' + (error?.message || 'Failed'))
      }
    }
  }

  async removeWorkoutEntry(entryId: string){
    if(!this.currentUser) return
    try{
      await this.userService.removeWorkoutEntry(this.currentUser.uid, this.selectedDate, entryId)
      await this.loadUserData()
    }catch(error:any){
      alert('Error: ' + (error?.message || 'Failed'))
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/400?text=Image+Not+Available';
  }

  onImageErrorSmall(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/200?text=No+Image';
  }

}

