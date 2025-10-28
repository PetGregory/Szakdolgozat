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

  auth = inject(Auth);

  constructor(
    private authService: AuthService,
    private router: Router,
    public darkModeService: DarkModeService
  ) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        console.log('Login successful:', user);
        alert('Login successful!');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        alert('Login failed: ' + err.message);
      }
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
      alert('Google login successful!');
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Google login failed:', error);
      alert('Google login failed: ' + error.message);
    }
  }

  toggleDarkMode() {
    this.darkModeService.toggle();
  }

  goToSignUp() {
    this.router.navigate(['/register']);
  }
}
