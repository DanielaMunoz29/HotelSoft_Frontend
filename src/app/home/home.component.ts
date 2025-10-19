import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Room } from '../core/models/room.model';
import { AMENITIES_LIST } from '../core/constants/amenities';
import { RoomService } from '../core/services/room.service';
import { BookingService } from '../core/services/booking.service';
import { Booking } from '../core/models/booking';
import Swal from 'sweetalert2';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, FormsModule]
})
export class HomeComponent {
  rooms: Room[] = [];
  carouselRooms: Room[] = [];
  booking: Booking = {
    idReserva: 0,
    idUsuario: 0,
    idHabitacion: 0,
    nombreTitular: '',
    email: '',
    telefono: '',
    fechaEntrada: new Date(),
    fechaSalida: new Date()
  };

 // Lista de comodidades 
  amenitiesList = AMENITIES_LIST;

  bookingFormSubmitted = false;

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRooms();
  }

  // Cargar habitaciones
  loadRooms() {
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.rooms = data.content;
        // Seleccionar 3 habitaciones aleatorias para el carrusel (sin repetir)
        const shuffled = this.rooms.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        this.carouselRooms = shuffled.slice(0, Math.min(3, shuffled.length));
      }
    });
  }

  // Obtener datos de la comodidad
  getAmenityData(value: string): any {
    const amenity = this.amenitiesList.find(a => a.value === value);
    return amenity ? amenity : { label: value, icon: '' };
  }

  searchRooms() {
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.rooms = data.content;
      }
    });
  }

  // Abrir modal de reserva
  openBookingModal(room: Room) {

    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.booking.idUsuario = this.authService.getStoredUserData()?.idUsuario || 0;
    this.booking.idHabitacion = room.id;
  }

  // Crear reserva
  createBooking(form: NgForm) {
    this.bookingFormSubmitted = true;

    if (form.invalid) {
      return;
    }

    this.bookingService.createBooking(this.booking).subscribe({
      next: (data) => {
        Swal.fire('Reserva creada', 'La reserva se ha creado correctamente.', 'success');
      }
    });
  }
}
