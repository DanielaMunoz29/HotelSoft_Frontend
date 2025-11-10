import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../core/services/user.service';
import { LimpiezaDto } from '../core/models/LimpiezaDto';
import { AuthService } from '../core/services/auth.service';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-cleaning-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './cleaning-list.component.html',
  styleUrls: ['./cleaning-list.component.css']
})
export class CleaningListComponent implements OnInit {

  limpiezas: LimpiezaDto[] = [];
  loading = true;
  userId!: number;

  limpiezaSeleccionada: LimpiezaDto = {
    id: 0,
    idRecepcionista: 0,
    recepcionistaNombre: '',
    idHabitacion: 0,
    nombreHabitacion: '',
    tipoAseo: '',
    observaciones: '',
    estado: '',
    fechaRegistro: ''
  };

  nuevaLimpieza: LimpiezaDto = {
    id: 0,
    idRecepcionista: 0,
    recepcionistaNombre: '',
    idHabitacion: 0,
    nombreHabitacion: '',
    tipoAseo: '',
    observaciones: '',
    estado: 'NO_COMPLETADO',
    fechaRegistro: ''
  };

  modalRef: any;
  modalRegistroRef: any;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.authService.getUserIdFromToken());
    if (this.userId) {
      this.cargarLimpiezas();
      
    } else {
      console.warn('Usuario no autenticado');
      this.loading = false;
    }
    
  }

  cargarLimpiezas(): void {
    this.userService.getLimpiezasByUser(this.userId).subscribe({
      next: (data) => {
        this.limpiezas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando limpiezas:', err);
        this.loading = false;
      }
    });
  }

  abrirModalEdicion(limpieza: LimpiezaDto): void {
    this.limpiezaSeleccionada = { ...limpieza };
    const modalElement = document.getElementById('editarLimpiezaModal');
    if (modalElement) {
      this.modalRef = new bootstrap.Modal(modalElement);
      this.modalRef.show();
    }
  }

  guardarCambios(): void {
    if (!this.limpiezaSeleccionada.id) return;

    this.userService.updateLimpieza(this.limpiezaSeleccionada.id, this.limpiezaSeleccionada).subscribe({
      next: (data) => {
        console.log('Limpieza actualizada:', data);
        this.modalRef.hide();
        this.cargarLimpiezas();
      },
      error: (err) => {
        console.error('Error al actualizar limpieza:', err);
      }
    });
  }

  abrirModalRegistro(): void {
    console.log(this.limpiezas)
    this.nuevaLimpieza = {
      id: 0,
      idRecepcionista: 0,
      recepcionistaNombre: '',
      idHabitacion: 0,
      nombreHabitacion: '',
      tipoAseo: '',
      observaciones: '',
      estado: 'NO_COMPLETADO',
      fechaRegistro: ''
    };

    const modalElement = document.getElementById('registrarLimpiezaModal');
    if (modalElement) {
      this.modalRegistroRef = new bootstrap.Modal(modalElement);
      this.modalRegistroRef.show();
    }
  }

  registrarLimpieza(): void {
    
    console.log(this.nuevaLimpieza);
    this.userService.registrarLimpieza(this.nuevaLimpieza).subscribe({
      next: (data) => {
        console.log('Limpieza registrada:', data);
        this.modalRegistroRef.hide();
        this.cargarLimpiezas();
      },
      error: (err) => {
        console.error('Error registrando limpieza:', err);
      }
    });
  }
}
