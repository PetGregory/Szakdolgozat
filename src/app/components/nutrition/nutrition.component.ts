import { Component, OnInit }  from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService }  from '../../auth.service';
import { NutritionService, NutritionItem, FoodEntry } from '../../services/nutrition.service';
import { UserService } from '../../services/user.service';
import { DarkModeService } from '../dark-mode-service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [ CommonModule , FormsModule ],
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
  today = new Date().toISOString().split('T')[0]
  todayEntries: FoodEntry[] = []
  totalCaloriesToday = 0;

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
      this.loadTodayEntries()
    }
  }

  loadTodayEntries() {
    if(!this.user?.dailyCalorieIntake?.[this.today]) {
      this.todayEntries = []
      this.totalCaloriesToday = 0
      return
    }
    this.todayEntries = this.user.dailyCalorieIntake[this.today]
    this.totalCaloriesToday = this.userService.getDailyCalorieIntake(this.user, this.today)
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

    const cal = this.nutritionService.calculateCaloriesForAmount(this.selectedFood, this.amountInGrams)
    const protein = this.nutritionService.calculateProteinForAmount(this.selectedFood, this.amountInGrams)

    const entry: FoodEntry = {
      id: Date.now().toString(),
      name: this.selectedFood.name,
      amount: this.amountInGrams,
      calories: cal,
      protein: protein,
      date: this.today
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
      await this.userService.removeFoodEntry(this.currentUser.uid, this.today, entryId)
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