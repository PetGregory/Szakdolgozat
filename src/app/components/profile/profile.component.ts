

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule, UpperCasePipe } from '@angular/common';

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
  imports: [CommonModule, FormsModule, UpperCasePipe]
})

export class ProfileComponent implements OnInit {

  user: UserData | null = null;

  loading = true;

  profileImageUrl: string | null = null;

  public COLORS: string[] = [
    '#facc15','#fde047','#fb7185','#f87171','#84cc16',
    '#34d399','#10b981','#60a5fa','#3b82f6','#818cf8',
    '#a78bfa','#c084fc','#38bdf8','#0ea5e9','#f472b6',
    '#fb7185','#ef4444','#06b6d4','#f97316','#dc2626',
    '#22c55e','#f59e0b','#eab308','#14b8a6','#8b5cf8'
  ];

  showAvatarPicker = false;

  editingUsername = false;

  newUsername = '';

  usernameError: string | null = null;

  savingUsername = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    public darkModeService: DarkModeService,
    private cdr: ChangeDetectorRef
  ) {}

  currentUser: any = null;

  isAdmin = false;

  ngOnInit() {

    this.loading = true;

    this.authService.currentUser$.subscribe(async (firebaseUser) => {

      this.currentUser = firebaseUser;

      if (!firebaseUser) {
        this.router.navigate(['/login']);
        return;
      }

      await this.loadUserData();
    });
  }

  async loadUserData() {

    if (!this.currentUser) return;

    this.user = await this.userService.getUser(this.currentUser.uid);

    if (!this.user) {

      const email = this.currentUser.email || '';

      const displayName = this.currentUser.displayName || '';

      const username = displayName || (email ? email.split('@')[0] : '');

      await this.userService.createOrUpdateGoogleUser(this.currentUser.uid, email, username);

      this.user = await this.userService.getUser(this.currentUser.uid);
    }

    if (this.user && (!this.user.profileImageUrl || this.user.profileImageUrl === null)) {
      await this.userService.setAvatarColor(this.currentUser.uid, 0);

      this.user = await this.userService.getUser(this.currentUser.uid);
    }

    this.profileImageUrl = this.user?.profileImageUrl || null;

    this.isAdmin = this.user?.role === 'admin';

    this.loading = false;

    this.cdr.detectChanges();
  }

  toInt(value: string | null | undefined): number {

    return parseInt(value ?? '0', 10);
  }

  getAvatarLetter(): string {

    return this.user?.username?.charAt(0)?.toUpperCase() || '?';
  }

  getCurrentColor(): string {

    const idx = this.toInt(this.profileImageUrl);

    return this.COLORS[idx % this.COLORS.length] || '#64748b';
  }

  public selectAvatarColor(idx: number): void {

    if (!this.user) return;

    this.userService.setAvatarColor(this.user.id!, idx).then(() => {

      if (this.user) this.user.profileImageUrl = idx.toString();

      this.profileImageUrl = idx.toString();

      this.showAvatarPicker = false;

      this.cdr.detectChanges();
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

}
