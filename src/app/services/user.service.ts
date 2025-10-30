import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

export interface UserData {
  id?: string;
  email: string;
  username: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  goal: string | null;
  fitnessLevel: string;
  availableDays: number;
  calorieTarget: number | null;
  workout?: any;
  workoutUpdatedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore = inject(Firestore);

  async createUser(userId: string, email: string, username: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      console.log('Creating user document in Firestore...');
      
      const userData: UserData = {
        email,
        username,
        age: null,
        weight: null,
        height: null,
        goal: null,
        fitnessLevel: 'beginner',
        availableDays: 0,
        calorieTarget: null,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(userRef, userData);
      console.log('User document created successfully in Firestore');
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  async createOrUpdateGoogleUser(userId: string, email: string, username: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      console.log('Creating/updating Google user document in Firestore...');
      
      const userData: Partial<UserData> = {
        email,
        username: username || '',
        age: null,
        weight: null,
        height: null,
        goal: null,
        fitnessLevel: 'beginner',
        availableDays: 0,
        calorieTarget: null,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(userRef, userData, { merge: true });
      console.log('Google user document created/updated successfully in Firestore');
    } catch (error) {
      console.error('Error creating/updating Google user document:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<UserData | null> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, data: Partial<UserData>): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(userRef, updateData);
      console.log('User document updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async saveWorkoutPlan(
    userId: string, 
    workoutPlan: any, 
    userData?: Partial<UserData>
  ): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      
      const updateData: any = {
        workout: workoutPlan,
        workoutUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (userData) {
        Object.assign(updateData, userData);
      }
      
      await updateDoc(userRef, updateData);
      console.log('Workout plan saved to user document successfully');
    } catch (error) {
      console.error('Error saving workout plan:', error);
      throw error;
    }
  }

  async modifyUsername(userId: string, newUsername: string): Promise<UserData | null> {
    await this.updateUser(userId, { username: newUsername });
    return await this.getUser(userId);
  }
  getUser$(userId: string): Observable<UserData | null> {
    return from(this.getUser(userId));
  }
}
