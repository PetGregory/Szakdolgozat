import { Component } from '@angular/core';
import { DarkModeService } from '../dark-mode-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
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
    private auth: Auth,
    private firestore: Firestore
  ) {}

  toggleDarkMode() {
    this.darkModeService.toggle();
  }

  goToLogIn() {
    this.router.navigate(['/login']);
  }


  private async saveUserToFirestore(userId: string) {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      console.log('Saving user data to Firestore...');
      
      await setDoc(userRef, {
        email: this.email,
        username: this.username,
        age: null,
        weight: null,
        height: null,
        goal: null,
        fitnessLevel: 'beginner',
        availableDays: 0,
        calorieTarget: null,
        createdAt: new Date().toISOString()
      });
      
      console.log('User data saved to Firestore successfully');
    } catch (firestoreError) {
      console.error('Firestore save error:', firestoreError);

    }
  }


  private async saveGoogleUserToFirestore(user: any) {
    try {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      console.log('Saving Google user data to Firestore...');
      
      await setDoc(userRef, {
        email: user.email,
        username: user.displayName || '',
        age: null,
        weight: null,
        height: null,
        goal: null,
        fitnessLevel: 'beginner',
        availableDays: 0,
        calorieTarget: null,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      console.log('Google user data saved to Firestore successfully');
    } catch (firestoreError) {
      console.error('Google Firestore save error:', firestoreError);
      // Ez nem blokkolja a navigációt
    }
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
        

        this.saveUserToFirestore(userCredential.user.uid);

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
        // Firestore mentés külön metódusban
        this.saveGoogleUserToFirestore(result.user);

        console.log('Google login/registration successful!');
        window.location.href = '/home';
      } else {
        throw new Error('Google authentication failed');
      }
    } catch (error: any) {
      console.error('Google auth failed:', error);
      alert('Google auth failed: ' + error.message);
    }
  }
}
