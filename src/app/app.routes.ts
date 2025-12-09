import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { IndexPageComponent } from './index-page/index-page.component';
import { WorkoutsComponent } from './components/workouts/workouts.component';
import { ForgotpasswordComponent } from './components/forgotpassword/forgotpassword.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';


export const routes: Routes = [
    { path: 'home', component: IndexPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotpasswordComponent },
    { path: 'workouts', component: WorkoutsComponent, canActivate: [authGuard] },
    { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
    { path: 'nutrition', loadComponent: () => import('./components/nutrition/nutrition.component').then(m => m.NutritionComponent), canActivate: [authGuard] },
    { path: 'workout-tracker', loadComponent: () => import('./components/workout-tracker/workout-tracker.component').then(m => m.WorkoutTrackerComponent), canActivate: [authGuard] },
    { path: 'statistics', loadComponent: () => import('./components/statistics/statistics.component').then(m => m.StatisticsComponent), canActivate: [authGuard] },
    { path: 'stats', loadComponent: () => import('./components/statistics/statistics.component').then(m => m.StatisticsComponent), canActivate: [authGuard] },
    { path: 'forum', loadComponent: () => import('./components/forum/forum.component').then(m => m.ForumComponent), canActivate: [authGuard] },
    { path: 'admin', loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent), canActivate: [adminGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
];
