import { Injectable, inject } from "@angular/core";
import { Auth } from '@angular/fire/auth';
import { Observable, from, throwError, BehaviorSubject } from "rxjs";
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  User, 
  UserCredential, signInWithEmailAndPassword,onAuthStateChanged,
} from 'firebase/auth';
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);

  currentUser$ = new BehaviorSubject<User | null>(null);
  constructor() {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      this.currentUser$.next(user);
    });
  }

  register(email: string, username: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (userCredential: UserCredential) => {
        const user = userCredential.user;
        if (!user) throw new Error('User not found after registration');
        await updateProfile(user, { displayName: username });
      })
      .catch((error) => {
        console.error('Registration error:', error);
        throw error;
      });
    return from(promise);
  }

  login(email: string, password: string): Observable<User> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((userCredential: UserCredential) => userCredential.user)
      .catch((error) => {
        console.error('Login error:', error);
        throw error;
      });
    return from(promise);
  }
  logout(): Observable<void> {
    const promise = this.firebaseAuth.signOut();
    return from(promise);
  }
  isLoggedIn(): boolean {
    return !!this.firebaseAuth.currentUser;
  }
}
