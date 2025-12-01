import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { IndexPageComponent } from './index-page/index-page.component';
import { WorkoutsComponent } from './components/workouts/workouts.component';
import { ForgotpasswordComponent } from './components/forgotpassword/forgotpassword.component';


export const routes: Routes = [
    { path: 'home', component: IndexPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotpasswordComponent },
    { path: 'workouts', component: WorkoutsComponent },
    { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },
    { path: 'nutrition', loadComponent: () => import('./components/nutrition/nutrition.component').then(m => m.NutritionComponent) },
    { path: 'workout-tracker', loadComponent: () => import('./components/workout-tracker/workout-tracker.component').then(m => m.WorkoutTrackerComponent) },
    { path: 'statistics', loadComponent: () => import('./components/statistics/statistics.component').then(m => m.StatisticsComponent) },
    { path: 'stats', loadComponent: () => import('./components/statistics/statistics.component').then(m => m.StatisticsComponent) },
    { path: 'forum', loadComponent: () => import('./components/forum/forum.component').then(m => m.ForumComponent) },
    { path: 'admin', loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent) },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
];
