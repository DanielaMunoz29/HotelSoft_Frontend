import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password.component/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomFormComponent } from './room-form/room-form.component';
import { BookingListComponent } from './booking-list/booking-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'booking-list', component: BookingListComponent },
  { path: 'room-list', component: RoomListComponent },
  { path: 'room-form', component: RoomFormComponent },
  { path: '**', redirectTo: 'home' }
];