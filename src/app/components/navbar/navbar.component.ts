// navbar.component.ts
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
  constructor(public darkModeService: DarkModeService, private router : Router, private authService: AuthService) {}

  isMenuOpen = false;
  isLoggedIn = false;
  toggleDarkMode() {
    this.darkModeService.toggle();
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  
readonly FileIcon = User;

logout() {
  this.authService.logout().subscribe(() => {
    this.router.navigate(['/']);
  });
}

}
