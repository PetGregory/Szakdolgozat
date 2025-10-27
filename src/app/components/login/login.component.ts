import { Component } from '@angular/core';
import { DarkModeService } from '../dark-mode-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';

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
  constructor(private authService: AuthService,
    private router: Router,
    public darkModeService: DarkModeService) {}

    onLogin() {
      this.authService.login(this.email, this.password).subscribe({
        next: (user) => {
          console.log('Login successful:', user);
          alert('Login successful!');
          this.router.navigate(['/home']); // vagy más oldalra
        },
        error: (err) => {
          console.error(err);
          alert('Login failed: ' + err.message);
        }
      });
    }
  
  toggleDarkMode() {
    this.darkModeService.toggle();
  }

  goToSignUp() {
    this.router.navigate(['/register']);
  }
}
