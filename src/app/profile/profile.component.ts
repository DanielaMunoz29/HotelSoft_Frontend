import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../core/models/user.model';
import { AuthService } from '../core/services/auth.service';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  user: User = {
    id: 0,
    cedula: '',
    nombreCompleto: '',
    email: '',
    telefono: '',
    contraseña: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const currentUserEmail = this.authService.getCurrentUser()?.email;
    const currentUser = this.userService.getUserByEmail(currentUserEmail).subscribe({
      next: (data: any) => {
        this.user = data;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }
}
