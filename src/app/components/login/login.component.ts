import { Component, inject } from '@angular/core';
import { DarkModeService } from '../dark-mode-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  
  emailError: string | null = null;
  passwordError: string | null = null;
  generalError: string | null = null;

  auth = inject(Auth);

  constructor(
    private authService: AuthService,
    private router: Router,
    public darkModeService: DarkModeService
  ) {}

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
      next: (user) => {
        console.log('Login successful:', user);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login failed:', err);
        
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
      await signInWithPopup(this.auth, provider);
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
