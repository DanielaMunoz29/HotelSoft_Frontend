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

declare var bootstrap: any;

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
    fechaEntrada: null as any,
    fechaSalida: null as any,
    puntos: 0
  };

  // Lista de comodidades 
  amenitiesList = AMENITIES_LIST;

  paymentMethod: string = 'pointsCash';
  bookingFormSubmitted = false;

  currentUser: { puntos: number } = { puntos: 0 };

  roomSearchParams: {
    type: string,
    checkInDate: Date | null,
    checkOutDate: Date | null,
  } = {
      type: '',
      checkInDate: null,
      checkOutDate: null
    };

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
    this.roomService.getRoomsByStatus("DISPONIBLE").subscribe({
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

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Obtener datos de la comodidad
  getAmenityData(value: string): any {
    const amenity = this.amenitiesList.find(a => a.value === value);
    return amenity ? amenity : { label: value, icon: '' };
  }

  searchRooms() {
    this.roomService.getRoomsFiltered(this.roomSearchParams).subscribe({
      next: (data) => this.rooms = data.content
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
    this.booking.idHabitacion = room.idHabitacion;

    // Abrir el modal manualmente
    const modalElement = document.getElementById('bookingModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  calculateBookingTotal(): number {
    const checkIn = new Date(this.booking.fechaEntrada);
    const checkOut = new Date(this.booking.fechaSalida);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Suponiendo que el precio por noche está en la habitación seleccionada
    const room = this.rooms.find(r => r.idHabitacion === this.booking.idHabitacion);
    const pricePerNight = room ? room.precio : 0;

    return daysDiff * pricePerNight;
  }

  // Crear reserva
  createBooking(form: NgForm) {
    this.bookingFormSubmitted = true;

    if (form.invalid) {
      return;
    }

    // Prepare a payload with ISO strings for the backend while keeping this.booking as Date objects
    const payload: any = {
      ...this.booking,
      fechaEntrada: new Date(this.booking.fechaEntrada).toISOString().slice(0, 19),
      fechaSalida: new Date(this.booking.fechaSalida).toISOString().slice(0, 19)
    };

    this.bookingService.createBooking(payload).subscribe({
      next: (data) => {
        Swal.fire('Reserva creada', 'La reserva se ha creado correctamente.', 'success');
        this.bookingFormSubmitted = false;
        form.resetForm();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Hubo un error al crear la reserva.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }
}
