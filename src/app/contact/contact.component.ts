import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { ContactService } from '../core/services/contact.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {

  contact = {
    nombre: '',
    correo: '',
    asunto: '',
    mensaje: ''
  };

  submitted = false;

  constructor(
    private contactService: ContactService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Autocompletar datos si el usuario está autenticado
    const user = this.authService.getCurrentUser();
    if (user) {
      this.contact.nombre = user.nombreCompleto;
      this.contact.correo = user.email;
    }
  }

  resetContactForm() {
    this.submitted = false;
    const currentUser = this.authService.getCurrentUser();
    this.contact = {
      nombre: currentUser ? currentUser.nombreCompleto : '',
      correo: currentUser ? currentUser.email : '',
      asunto: '',
      mensaje: ''
    };
  }

  submitContactForm(form: NgForm) {

    this.submitted = true;

    if (form.invalid) {
      return;
    }

    // Aquí puedes manejar el envío del formulario de contacto
    this.contactService.sendEmail(this.contact).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Tu mensaje ha sido enviado. Nos pondremos en contacto contigo pronto.', 'success');
        this.resetContactForm();
      },
      error: (error) => {
        const errorMessage = error.error?.error || 'Hubo un error al enviar tu mensaje. Por favor, intenta de nuevo más tarde.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }
}
