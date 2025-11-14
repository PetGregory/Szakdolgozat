

import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { DarkModeService } from '../dark-mode-service';

import { Auth } from '@angular/fire/auth';
import { sendPasswordResetEmail } from 'firebase/auth';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css'],
  imports: [CommonModule, FormsModule]
})

export class ForgotpasswordComponent {

  email = '';

  emailError: string | null = null;

  successMessage: string | null = null;

  isLoading = false;

  constructor(
    public darkModeService: DarkModeService,
    private router: Router,
    private auth: Auth
  ) {}

  private isValidEmail(email: string): boolean {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  }

  clearEmailError() {

    this.emailError = null;

    this.successMessage = null;
  }

  async sendPasswordReset() {

    this.emailError = null;
    this.successMessage = null;

    if (!this.email || this.email.trim() === '') {
      this.emailError = 'Email is required';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.emailError = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;

    try {

      await sendPasswordResetEmail(this.auth, this.email.trim());

      this.successMessage = 'Password reset email has been sent! Please check your inbox.';

      this.email = '';
    } catch (error: any) {

      console.error('Password reset failed:', error);

      this.successMessage = 'If an account exists with this email, a password reset link has been sent.';

      this.emailError = null;
    } finally {

      this.isLoading = false;
    }
  }

  goToLogin() {

    this.router.navigate(['/login']);
  }
}
