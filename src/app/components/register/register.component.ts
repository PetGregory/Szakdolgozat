

import { Component, OnInit, OnDestroy } from '@angular/core';

import { DarkModeService } from '../dark-mode-service';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { AuthService } from '../../auth.service';

import { UserService } from '../../services/user.service';

import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule]
})

export class RegisterComponent implements OnInit, OnDestroy {

  email = '';

  username = '';

  password = '';

  confirmPassword = '';

  emailError: string | null = null;

  usernameError: string | null = null;

  passwordError: string | null = null;

  confirmPasswordError: string | null = null;

  generalError: string | null = null;

  private authSubscription?: Subscription;

  constructor(
    public darkModeService: DarkModeService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private auth: Auth
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

  toggleDarkMode() {

    this.darkModeService.toggle();
  }

  goToLogIn() {

    this.router.navigate(['/login']);
  }

  private isValidEmail(email: string): boolean {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  }

  private isValidUsername(username: string): boolean {

    const trimmed = (username || '').trim();

    if (trimmed.length < 3 || trimmed.length > 20) return false;

    if (/[^a-zA-Z0-9_ .-]/.test(trimmed)) return false;

    return true;
  }

  private validateForm(): boolean {

    let isValid = true;

    this.emailError = null;
    this.usernameError = null;
    this.passwordError = null;
    this.confirmPasswordError = null;
    this.generalError = null;

    if (!this.email || this.email.trim() === '') {

      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.email)) {

      this.emailError = 'Please enter a valid email address';
      isValid = false;
    }

    if (!this.username || this.username.trim() === '') {

      this.usernameError = 'Username is required';
      isValid = false;
    } else if (!this.isValidUsername(this.username)) {

      this.usernameError = 'Username must be 3-20 characters and contain only letters, numbers, spaces, dots, dashes, or underscores';
      isValid = false;
    }

    if (!this.password || this.password === '') {

      this.passwordError = 'Password is required';
      isValid = false;
    } else if (this.password.length < 6) {

      this.passwordError = 'Password must be at least 6 characters long';
      isValid = false;
    }

    if (!this.confirmPassword || this.confirmPassword === '') {

      this.confirmPasswordError = 'Please confirm your password';
      isValid = false;
    } else if (this.password !== this.confirmPassword) {

      this.confirmPasswordError = 'Passwords do not match';
      isValid = false;
    }

    return isValid;
  }

  clearEmailError() {

    this.emailError = null;
  }

  clearUsernameError() {

    this.usernameError = null;
  }

  clearPasswordError() {

    this.passwordError = null;

    this.confirmPasswordError = null;
  }

  clearConfirmPasswordError() {

    this.confirmPasswordError = null;
  }

  async onRegister(event?: Event) {

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!this.validateForm()) {
      return;
    }

    this.generalError = null;

    try {

      if (this.authService.isLoggedIn()) {

        await firstValueFrom(this.authService.logout());

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const userCredential = await firstValueFrom(
        this.authService.register(this.email.trim(), this.username.trim(), this.password)
      );

      if (userCredential?.user) {

        await this.userService.createUser(
          userCredential.user.uid,
          this.email.trim(),
          this.username.trim()
        );

        await new Promise(resolve => setTimeout(resolve, 500));

        window.location.href = '/home';
      } else {

        throw new Error('User creation failed');
      }
    } catch (error: any) {

      console.error('Registration failed:', error);

      this.emailError = null;
      this.usernameError = null;
      this.passwordError = null;
      this.confirmPasswordError = null;

      this.generalError = 'Invalid registration';
    }
  }

  async loginOrRegisterWithGoogle() {

    const provider = new GoogleAuthProvider();
    try {

      if (this.authService.isLoggedIn()) {

        await firstValueFrom(this.authService.logout());
      }

      const result = await signInWithPopup(this.auth, provider);

      this.authService.currentUser$.next(result.user);

      if (result.user) {
        await this.userService.createOrUpdateGoogleUser(
          result.user.uid,
          result.user.email || '',
          result.user.displayName || ''
        );

        window.location.href = '/home';
      } else {

        throw new Error('Google authentication failed');
      }
    } catch (error: any) {

      console.error('Google auth failed:', error);

      this.emailError = null;
      this.usernameError = null;
      this.passwordError = null;
      this.confirmPasswordError = null;

      this.generalError = 'Invalid registration';
    }
  }
}
