import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../core/models/user.model';
import { AuthService } from '../core/services/auth.service';
import { UserService } from '../core/services/user.service';
import Swal from 'sweetalert2';

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
    contrasena: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const currentUserDocument = this.authService.getCurrentUser()?.cedula;
    this.userService.getUserByDocument(currentUserDocument).subscribe({
      next: (data: any) => {
        this.user = data;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  updateProfile() {
    this.userService.updateUserProfile(this.user).subscribe({
      next: (data) => {
        Swal.fire('Perfil actualizado', 'Tu perfil ha sido actualizado correctamente.', 'success');
        this.loadUserProfile();
      },
      error: (error) => {
        const errorMessage = error.error?.error || 'Hubo un error al actualizar tu perfil.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }
}
