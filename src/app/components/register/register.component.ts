import { Component } from '@angular/core';
import { DarkModeService } from '../dark-mode-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RegisterComponent {
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    public darkModeService: DarkModeService,
    private router: Router,
    private authService: AuthService
  ) {}

  toggleDarkMode() {
    this.darkModeService.toggle();
  }

  goToLogIn() {
    this.router.navigate(['/login']);
  }

  async onRegister() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      await this.authService.register(this.email, this.username, this.password).toPromise();
      alert('Registration successful!');
      this.router.navigate(['/login']);
    } catch (error: any) {
      alert('Registration failed: ' + error.message);
    }
  }
}
