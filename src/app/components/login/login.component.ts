

import { Component, inject, OnInit, OnDestroy } from '@angular/core';

import { DarkModeService } from '../dark-mode-service';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { AuthService } from '../../auth.service';

import { UserService } from '../../services/user.service';

import { FormsModule } from '@angular/forms';

import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})

export class LoginComponent implements OnInit, OnDestroy {

  email: string = '';

  password: string = '';

  emailError: string | null = null;

  passwordError: string | null = null;

  generalError: string | null = null;

  auth = inject(Auth);

  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    public darkModeService: DarkModeService
  ) {}

  ngOnInit() {

    this.authSubscription = this.authService.currentUser$.subscribe(user => {

      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnDestroy() {

    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private isValidEmail(email: string): boolean {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  }

  private validateForm(): boolean {

    let isValid = true;

    this.emailError = null;
    this.passwordError = null;
    this.generalError = null;

    if (!this.email || this.email.trim() === '') {

      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.email)) {

      this.emailError = 'Please enter a valid email address';
      isValid = false;
    }

    if (!this.password || this.password === '') {

      this.passwordError = 'Password is required';
      isValid = false;
    }

    return isValid;
  }

  clearEmailError() {

    this.emailError = null;
  }

  clearPasswordError() {

    this.passwordError = null;
  }

  onLogin() {

    if (!this.validateForm()) {
      return;
    }

    this.generalError = null;

    this.authService.login(this.email.trim(), this.password).subscribe({

      next: () => {

        this.router.navigate(['/home']);
      },

      error: () => {

        this.emailError = null;
        this.passwordError = null;

        this.generalError = 'Wrong email or password';
      }
    });
  }

  async loginWithGoogle() {

    this.emailError = null;
    this.passwordError = null;
    this.generalError = null;

    const provider = new GoogleAuthProvider();
    try {

      const result = await signInWithPopup(this.auth, provider);

      this.authService.currentUser$.next(result.user);

      if (result.user) {
        await this.userService.createOrUpdateGoogleUser(
          result.user.uid,
          result.user.email || '',
          result.user.displayName || ''
        );
      }

      this.router.navigate(['/home']);
    } catch (error: any) {

      console.error('Google login failed:', error);

      this.generalError = 'Wrong email or password';
    }
  }

  toggleDarkMode() {

    this.darkModeService.toggle();
  }

  goToSignUp() {

    this.router.navigate(['/register']);
  }

  goToForgotPassword() {

    this.router.navigate(['/forgot-password']);
  }
}
