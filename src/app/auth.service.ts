

import { Injectable, inject } from "@angular/core";

import { Auth } from '@angular/fire/auth';

import { Observable, from, BehaviorSubject } from "rxjs";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  User,
  UserCredential,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';

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

  register(email: string, username: string, password: string): Observable<UserCredential> {

    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (userCredential) => {
        try {

          await updateProfile(userCredential.user, { displayName: username });
        } catch (err) {

          console.warn('updateProfile failed:', err);
        }

        return userCredential;
      });

    return from(promise);
  }

  login(email: string, password: string): Observable<User> {

    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((userCredential) => userCredential.user);

    return from(promise);
  }

  logout(): Observable<void> {

    const promise = this.firebaseAuth.signOut()
      .then(async () => {

        await new Promise(resolve => setTimeout(resolve, 1000));
      })
      .catch((err) => {

        console.error("Logout error:", err);
      });

    return from(promise);
  }

  isLoggedIn(): boolean {

    return !!this.firebaseAuth.currentUser;
  }
}
