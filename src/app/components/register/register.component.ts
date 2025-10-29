import { Component } from '@angular/core';
import { DarkModeService } from '../dark-mode-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { UserService } from '../../services/user.service';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RegisterComponent {
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  
  constructor(
    public darkModeService: DarkModeService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private auth: Auth
  ) {}

  toggleDarkMode() {
    this.darkModeService.toggle();
  }

  goToLogIn() {
    this.router.navigate(['/login']);
  }



  async onRegister(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {

      console.log('Current auth state:', this.authService.isLoggedIn());
      console.log('Current user:', this.authService.firebaseAuth.currentUser?.email);


      if (this.authService.isLoggedIn()) {
        console.log('Logging out previous user before registration...');
        await firstValueFrom(this.authService.logout());

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('Starting registration for:', this.email);
      console.log('Email:', this.email);
      console.log('Username:', this.username);
      console.log('Password length:', this.password.length);
      
      const userCredential = await firstValueFrom(
        this.authService.register(this.email, this.username, this.password)
      );
      
      console.log('Registration completed, userCredential:', userCredential);

      if (userCredential?.user) {
        console.log('User created successfully:', userCredential.user.email);
        
        // User dokumentum létrehozása Firestore-ban a UserService segítségével
        await this.userService.createUser(
          userCredential.user.uid,
          this.email,
          this.username
        );

        console.log('Registration successful!');
        alert('Registration successful!');
        console.log('Navigating to /home...');
        
        window.location.href = '/home';
      } else {
        throw new Error('User creation failed');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert('Registration failed: ' + error.message);
    }
  }
  
  async loginOrRegisterWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {

      if (this.authService.isLoggedIn()) {
        console.log('Logging out previous user before Google auth...');
        await firstValueFrom(this.authService.logout());
      }

      const result = await signInWithPopup(this.auth, provider);
      console.log('Google user:', result.user);

      this.authService.currentUser$.next(result.user);

      if (result.user) {
        // Google user dokumentum létrehozása/frissítése Firestore-ban a UserService segítségével
        await this.userService.createOrUpdateGoogleUser(
          result.user.uid,
          result.user.email || '',
          result.user.displayName || ''
        );

        console.log('Google login/registration successful!');
        window.location.href = '/home';
      } else {
        throw new Error('Google authentication failed');
      }
    } catch (error: any) {
      console.error('Google auth failed:', error)
      alert('Google auth failed: ' + error.message);
    }
  }
}
