import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router'; // RouterLink ya está importado aquí
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string | null = null;
  resetSuccess = false;
  isLoading = false;
  isTokenValid = false; // NUEVO: para controlar si el token es válido
  tokenChecked = false; // NUEVO: para saber si ya se verificó el token

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    console.log('🔍 ResetPasswordComponent inicializado');
    
    // Obtener el token de la URL
    this.token = this.route.snapshot.queryParamMap.get('token');
    console.log('📧 Token obtenido de la URL:', this.token);

    if (!this.token) {
      console.error('❌ No se encontró token en la URL');
      this.showTokenError();
      return;
    }

    // Validar el token automáticamente
    this.validateToken();
  }

  // NUEVO MÉTODO: Validar el token
  validateToken(): void {
    this.isLoading = true;
    console.log('🔄 Validando token...', this.token);

    this.auth.validateResetToken(this.token!).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.tokenChecked = true;
        console.log('✅ Respuesta de validación:', response);
        
        if (response.valid) {
          this.isTokenValid = true;
          console.log('✅ Token válido, mostrando formulario');
        } else {
          this.isTokenValid = false;
          console.error('❌ Token inválido o expirado');
          this.showTokenError();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.tokenChecked = true;
        this.isTokenValid = false;
        console.error('❌ Error validando token:', error);
        this.showTokenError();
      }
    });
  }

  // NUEVO MÉTODO: Mostrar error de token
  showTokenError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Enlace inválido',
      text: 'El enlace de recuperación es inválido o ha expirado.',
      confirmButtonText: 'Solicitar nuevo enlace'
    }).then(() => {
      this.router.navigate(['/forgot-password']);
    });
  }

  get password() { return this.resetForm.get('password')!; }
  get confirmPassword() { return this.resetForm.get('confirmPassword')!; }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  reset() {
    if (this.resetForm.invalid || !this.token || !this.isTokenValid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    console.log('🔄 Iniciando proceso de reset...');
    console.log('   Token:', this.token);
    console.log('   Nueva contraseña:', this.password.value);

    this.isLoading = true;

    this.auth.resetPassword(this.token!, this.password.value).subscribe({
      next: (response) => {
        console.log('✅ Reset exitoso:', response);
        this.isLoading = false;
        this.resetSuccess = true;
        
        Swal.fire({
          icon: 'success',
          title: 'Contraseña Actualizada',
          text: 'Tu contraseña ha sido restablecida con éxito. Redirigiendo a Login...',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Error en reset:', err);
        const errorMsg = err.error?.message || err.error?.mensaje || 'Error al actualizar la contraseña. El enlace puede haber expirado.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg
        });
      }
    });
  }
}