import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { FoodEntry } from './nutrition.service';

export interface UserData {
  id?: string;
  email: string;
  username: string;
  gender?: string | null;
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
  profileImageUrl?: string | null;
  dailyCalorieIntake?: { [date: string]: FoodEntry[] };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore = inject(Firestore);

  async createUser(userId: string, email: string, username: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
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
        profileImageUrl: '0',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(userRef, userData);
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  async createOrUpdateGoogleUser(userId: string, email: string, username: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const existingUser = await this.getUser(userId);
      
      let finalUsername = username || '';
      if (!finalUsername && email) {
        finalUsername = email.split('@')[0];
      }
      
      const userData: Partial<UserData> = {
        email,
        username: finalUsername
      };

      if (!existingUser) {
        userData.age = null;
        userData.weight = null;
        userData.height = null;
        userData.goal = null;
        userData.fitnessLevel = 'beginner';
        userData.availableDays = 0;
        userData.calorieTarget = null;
        userData.profileImageUrl = '0';
        userData.createdAt = new Date().toISOString();
      } else {
        userData.updatedAt = new Date().toISOString();
      }
      
      await setDoc(userRef, userData, { merge: true });
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
    } catch (error) {
      console.error('Error saving workout plan:', error);
      throw error;
    }
  }

  async modifyUsername(userId: string, newUsername: string): Promise<UserData | null> {
    await this.updateUser(userId, { username: newUsername });
    return await this.getUser(userId);
  }

  async setAvatarColor(userId: string, colorIndex: number): Promise<void> {
    await this.updateUser(userId, { profileImageUrl: colorIndex.toString() } as Partial<UserData>);
  }
  
  getUser$(userId: string): Observable<UserData | null> {
    return from(this.getUser(userId));
  }

  async addFoodEntry(userId: string, foodEntry: FoodEntry): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const user = await this.getUser(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date().toISOString().split('T')[0];
      const dailyIntake = user.dailyCalorieIntake || {};
      
      if (!dailyIntake[today]) {
        dailyIntake[today] = [];
      }
      
      dailyIntake[today].push(foodEntry);

      await updateDoc(userRef, {
        dailyCalorieIntake: dailyIntake,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding food entry:', error);
      throw error;
    }
  }

  async removeFoodEntry(userId: string, date: string, entryId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const user = await this.getUser(userId);
      
      if (!user?.dailyCalorieIntake?.[date]) {
        return;
      }

      const dailyIntake = { ...user.dailyCalorieIntake };
      dailyIntake[date] = dailyIntake[date].filter(entry => entry.id !== entryId);

      await updateDoc(userRef, {
        dailyCalorieIntake: dailyIntake,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removing food entry:', error);
      throw error;
    }
  }

  getDailyCalorieIntake(user: UserData, date: string): number {
    if (!user.dailyCalorieIntake || !user.dailyCalorieIntake[date]) {
      return 0;
    }
    return user.dailyCalorieIntake[date].reduce((total, entry) => total + entry.calories, 0);
  }
}
