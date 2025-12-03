import { Component } from '@angular/core';
import { DarkModeService } from '../../components/dark-mode-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-caunt-calories',
  imports: [CommonModule],
  templateUrl: './caunt-calories.component.html',
  styleUrl: './caunt-calories.component.css'
})
export class CauntCaloriesComponent {
  constructor(
    public darkModeService: DarkModeService,
    private router: Router
  ) {}

  goToNutrition() {
    this.router.navigate(['/nutrition']);
  }
}
