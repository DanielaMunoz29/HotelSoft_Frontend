// src/app/pages/auth/two-factor/two-factor.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TwoFactorService } from '../../core/services/two-factor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './two-factor.component.html',
  styleUrls: ['./two-factor.component.css']
})
export class TwoFactorComponent implements OnInit {
  twoFactorForm: FormGroup;
  errorMsg: string = '';
  email: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private twoFactorService: TwoFactorService,
    private router: Router
  ) {
    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ngOnInit(): void {
    // Recuperar el email del login anterior
    this.email = sessionStorage.getItem('temp_email') || '';
    
    if (!this.email) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión inválida',
        text: 'Por favor inicia sesión nuevamente.',
        confirmButtonText: 'Ir a Login'
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  get code() { 
    return this.twoFactorForm.get('code')!; 
  }

  /**
   * Verifica el código de dos factores
   */
  verifyCode(): void {
    if (this.twoFactorForm.invalid) {
      this.twoFactorForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const code = this.code.value;
    
    // Llamar al servicio para verificar el código
    this.twoFactorService.verifyTwoFactorCode(this.email, code).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        // Limpiar el email temporal
        sessionStorage.removeItem('temp_email');
        
        Swal.fire({
          icon: 'success',
          title: 'Código verificado',
          text: 'Acceso concedido',
          timer: 1200,
          showConfirmButton: false
        });
        
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.mensaje || err.error?.message || 'Código de verificación incorrecto';
        
        Swal.fire({
          icon: 'error',
          title: 'Error de verificación',
          text: this.errorMsg
        });
        
        // Limpiar el código después de un intento fallido
        this.twoFactorForm.patchValue({ code: '' });
      }
    });
  }

  /**
   * Reenviar código de verificación (opcional)
   * Implementa este método en el backend si lo necesitas
   */
  resendCode(): void {
    Swal.fire({
      icon: 'info',
      title: 'Reenviando código',
      text: 'Se ha enviado un nuevo código a tu correo.',
      timer: 2000,
      showConfirmButton: false
    });
    
    // Aquí podrías llamar a un endpoint del backend para reenviar el código
    // Ejemplo (si implementas este endpoint):
    // this.twoFactorService.resendCode(this.email).subscribe({
    //   next: () => {
    //     Swal.fire({
    //       icon: 'success',
    //       title: 'Código reenviado',
    //       timer: 1500,
    //       showConfirmButton: false
    //     });
    //   },
    //   error: (err) => {
    //     Swal.fire({
    //       icon: 'error',
    //       title: 'Error al reenviar',
    //       text: 'No se pudo reenviar el código'
    //     });
    //   }
    // });
  }

  /**
   * Cancelar y volver al login
   */
  cancelAndGoBack(): void {
    sessionStorage.removeItem('temp_email');
    this.router.navigate(['/login']);
  }

  /**
   * Helper para mostrar errores en el template
   */
  hasError(field: string, error: string): boolean {
    const control = this.twoFactorForm.get(field);
    return !!(control && control.hasError(error) && (control.dirty || control.touched));
  }

  /**
   * Formatea el código mientras se escribe (opcional)
   * Puedes usarlo en el template con (input)="formatCode($event)"
   */
  formatCode(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); // Solo números
    input.value = value.substring(0, 6); // Máximo 6 dígitos
  }
}