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
    { path: '', redirectTo: '/home', pathMatch: 'full' },
];
