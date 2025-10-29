import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { IndexPageComponent } from './index-page/index-page.component';
import { WorkoutsComponent } from './components/workouts/workouts.component';


export const routes: Routes = [
    
    { path: 'home', component: IndexPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'workouts', component: WorkoutsComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
];
