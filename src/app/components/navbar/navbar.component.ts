import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LucideAngularModule, User } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { DarkModeService } from '../dark-mode-service';
import { Router } from '@angular/router';
import {AuthService} from '../../auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl:'./navbar.component.html',
  styleUrl:'./navbar.component.css',
})
export class NavbarComponent {
  
  isMenuOpen = false;
  isLoggedIn = false;
  showProfileMenu = false;
  constructor(public darkModeService: DarkModeService, private router : Router, private authService: AuthService) {}

  currentUser$!: any;
  
  
  toggleDarkMode() {
    this.darkModeService.toggle();
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {

      this.currentUser$ = this.authService.currentUser$;
      this.isLoggedIn = !!user;
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToWorkouts() {
    this.isMenuOpen = false;
    this.router.navigate(['/workouts']);
  }

  goToNutrition() {
    this.isMenuOpen = false;
    this.router.navigate(['/nutrition']);
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  
readonly FileIcon = User;

logout() {
  this.authService.logout().subscribe(() => {
    this.router.navigate(['/login']);
  });
}

goToProfile() {
  this.router.navigate(['/profile']);
}
goToStats() {
  this.router.navigate(['/stats']);
}
toggleProfileMenu() {
  this.showProfileMenu = !this.showProfileMenu;
}
}
