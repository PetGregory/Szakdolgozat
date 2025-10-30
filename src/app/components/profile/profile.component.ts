import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { UserService, UserData } from '../../services/user.service';
import { Router } from '@angular/router';
import { DarkModeService } from '../dark-mode-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  user: UserData | null = null;
  loading = true;
  errorMsg: string | null = null;
  profileImageUrl: string | null = null;

  editingUsername = false;
  newUsername = '';
  usernameError: string | null = null;
  savingUsername = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    public darkModeService: DarkModeService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.authService.currentUser$.subscribe({
      next: async (firebaseUser) => {
        if (!firebaseUser) {
          this.router.navigate(['/login']);
          return;
        }
        const uid = firebaseUser.uid;
        try {
          this.user = await this.userService.getUser(uid);
          this.profileImageUrl = (this.user && (this.user as any).profileImageUrl) ? (this.user as any).profileImageUrl : null;
        } catch (error: any) {
          this.errorMsg = error?.message || 'Unexpected error';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.message || 'Auth error';
        this.loading = false;
      }
    });
  }

  startEditUsername() {
    if (!this.user) return;
    this.editingUsername = true;
    this.newUsername = this.user.username || '';
    this.usernameError = null;
  }

  cancelEditUsername() {
    this.editingUsername = false;
    this.usernameError = null;
  }

  private isValidUsername(value: string): boolean {
    const trimmed = (value || '').trim();
    if (trimmed.length < 3 || trimmed.length > 20) return false;
    if (/[^a-zA-Z0-9_ .-]/.test(trimmed)) return false;
    return true;
  }

  async saveUsername() {
    if (!this.user) return;
    const trimmed = (this.newUsername || '').trim();
    if (!this.isValidUsername(trimmed)) {
      this.usernameError = 'Username must be 3-20 chars, allowed: letters, numbers, space, dot, dash, underscore.';
      return;
    }
    this.usernameError = null;
    this.savingUsername = true;
    try {
      await this.userService.updateUser(this.user.id!, { username: trimmed });
      this.user.username = trimmed;
      this.editingUsername = false;
    } catch (e: any) {
      this.usernameError = e?.message || 'Save failed';
    } finally {
      this.savingUsername = false;
    }
  }

  get vanEdzesterv(): boolean {
    return !!(this.user && this.user.workout);
  }
  goToWorkoutGen() {
    this.router.navigate(['/workouts']);
  }
  goToWorkoutDetail() {
    this.router.navigate(['/workout-detail']);
  }

  mapGoal(goal: string): string {
    switch(goal) {
      case 'endurance': return 'Endurance';
      case 'muscle_gain': return 'Muscle Gain';
      case 'weight_loss': return 'Weight Loss';
      case 'general_fitness': return 'General Fitness';
      default: return goal ? goal.charAt(0).toUpperCase() + goal.slice(1) : '';
    }
  }
  mapLevel(level: string): string {
    switch(level) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return level ? level.charAt(0).toUpperCase() + level.slice(1) : '';
    }
  }
}
