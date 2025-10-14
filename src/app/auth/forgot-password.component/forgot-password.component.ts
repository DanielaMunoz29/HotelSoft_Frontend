// src/app/pages/auth/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service'; // Importar el servicio
import Swal from 'sweetalert2'; // Para notificaciones

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  submitted = false; // Estado para mostrar el mensaje de éxito

  constructor(private fb: FormBuilder, private auth: AuthService) {
    // Inicialización del formulario con validadores
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.form.get('email')!;
  }

  /**
   * Maneja el envío del formulario para solicitar la recuperación de contraseña.
   */
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const emailToRecover = this.form.value.email;

    // Llamada al servicio para solicitar el enlace de recuperación
    this.auth.forgotPassword(emailToRecover).subscribe({
      next: () => {
        // En caso de éxito (el correo fue enviado)
        this.submitted = true;
        Swal.fire({
          icon: 'success',
          title: 'Enlace Enviado',
          text: 'Se ha enviado un enlace de recuperación a tu correo.'
        });
      },
      error: (err) => {
        // En caso de error (ej: usuario no existe)
        const errorMsg = err.error?.message || err.error?.mensaje || 'Error al solicitar la recuperación.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg
        });
        this.submitted = false; // Asegura que el formulario sigue visible en caso de error
      }
    });
  }
}