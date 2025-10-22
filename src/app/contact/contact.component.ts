import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { ContactService } from '../core/services/contact.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {

  contact = {
    name: '',
    email: '',
    message: ''
  };

  constructor(
    private contactService: ContactService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Autocompletar datos si el usuario está autenticado
    const user = this.authService.getCurrentUser();
    if (user) {
      this.contact.name = user.nombreCompleto;
      this.contact.email = user.email;
    }
  }

  submitContactForm(form: NgForm) {
    if (form.valid) {
      // Aquí puedes manejar el envío del formulario de contacto
      this.contactService.sendEmail(this.contact).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Tu mensaje ha sido enviado. Nos pondremos en contacto contigo pronto.', 'success');
        },
        error: (error) => {
          const errorMessage = error.error?.error || 'Hubo un error al enviar tu mensaje. Por favor, intenta de nuevo más tarde.';
          Swal.fire('Error', errorMessage, 'error');
        }
      });
      form.resetForm();
    }
  }
}
