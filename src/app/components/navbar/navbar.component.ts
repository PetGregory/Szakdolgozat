import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { LucideAngularModule, User } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { DarkModeService } from '../dark-mode-service';
import { Router } from '@angular/router';
import {AuthService} from '../../auth.service';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl:'./navbar.component.html',
  styleUrl:'./navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  
  isMenuOpen = false;
  isLoggedIn = false;
  showProfileMenu = false;
  isAdmin = false;
  private authSubscription?: Subscription;
  
  constructor(
    public darkModeService: DarkModeService, 
    private router : Router, 
    private authService: AuthService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  currentUser$!: any;
  
  
  toggleDarkMode() {
    this.darkModeService.toggle();
  }

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(async (user) => {
      this.currentUser$ = this.authService.currentUser$;
      this.isLoggedIn = !!user;
      
      if (user) {
        try {
          const userData = await this.userService.getUser(user.uid);
          this.isAdmin = userData?.role === 'admin';
          console.log('User data:', userData, 'Is admin:', this.isAdmin);
        } catch (error) {
          console.error('Error loading user data:', error);
          this.isAdmin = false;
        }
      } else {
        this.isAdmin = false;
      }
      
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
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

  goToForum() {
    this.isMenuOpen = false;
    this.router.navigate(['/forum']);
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
goToAdmin() {
  this.isMenuOpen = false;
  this.router.navigate(['/admin']);
}
toggleProfileMenu() {
  this.showProfileMenu = !this.showProfileMenu;
}
}
