import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password.component/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomFormComponent } from './room-form/room-form.component';
import { BookingListComponent } from './booking-list/booking-list.component';
import { roleGuard } from './core/guards/role.guard';
import { ContactComponent } from './contact/contact.component';
import { ProfileComponent } from './profile/profile.component';
import { ConditionsComponent } from './conditions/conditions.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'booking-list', component: BookingListComponent, canActivate: [roleGuard(['ADMIN', 'USER'])] },
  { path: 'room-list', component: RoomListComponent, canActivate: [roleGuard(['ADMIN'])] },
  { path: 'room-form', component: RoomFormComponent, canActivate: [roleGuard(['ADMIN'])] },
  { path: 'room-form/:id', component: RoomFormComponent, canActivate: [roleGuard(['ADMIN'])] },
  { path: 'contact', component: ContactComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [roleGuard(['ADMIN', 'USER'])] },
  { path: 'conditions', component: ConditionsComponent },
  { path: '**', redirectTo: 'home' }
];