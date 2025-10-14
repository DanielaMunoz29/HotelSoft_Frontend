import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group(
      {
        cedula: ['', [Validators.required, Validators.minLength(6), Validators.pattern('^[0-9]+$')]],
        nombres: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        terminos: [false, [Validators.requiredTrue]]
      },
      { validators: RegisterComponent.passwordsMatch }
    );
  }

  private static passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!pass || !confirm) return null;
    return pass === confirm ? null : { passwordsMismatch: true };
  }

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload = {
      cedula: this.cedula.value,
      nombreCompleto: this.nombres.value,  
      email: this.email.value,
      telefono: this.telefono.value,
      password: this.password.value,
    };

    this.auth.register(payload).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: res?.mensaje || 'Ahora puedes iniciar sesión',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.registerForm.reset();
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.mensaje || err.error?.message || 'Hubo un problema con el registro'
        });
      }
    });
  }

  get cedula() { return this.registerForm.get('cedula')!; }
  get nombres() { return this.registerForm.get('nombres')!; }
  get email() { return this.registerForm.get('email')!; }
  get telefono() { return this.registerForm.get('telefono')!; }
  get password() { return this.registerForm.get('password')!; }
  get confirmPassword() { return this.registerForm.get('confirmPassword')!; }
  get terminos() { return this.registerForm.get('terminos')!; }
}