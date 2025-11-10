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
import { UserService } from '../core/services/user.service';
import { UserDTO } from '../core/models/user.model';

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

  bookingRoom: Room | null = null;

  usePoints: boolean = false;

  totalDiscount: number = 0;

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
  ///
  email!:string;
  userInfo!:UserDTO;

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
    private router: Router,
    private userService:UserService
  ) { }

  ngOnInit(): void {
    this.loadRooms();
    var emailUser = this.authService.getEmailFromToken();
    this.email = emailUser ?? '';
     // Llamar al servicio y suscribirse al resultado
      this.userService.getUserByEmailDto(this.email).subscribe({
        next: (data: UserDTO) => {
          this.userInfo = data;
          //console.log(data);
        },
        error: (err) => {
          console.error('Error obteniendo usuario:', err);
        }
      });
     

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

  calculateObtainablePoints(): number {
    // Calcular la diferencia en días entre las fechas de entrada y salida
    if (!this.booking.fechaEntrada || !this.booking.fechaSalida) {
      return 0;
    }

    const checkIn = new Date(this.booking.fechaEntrada);
    const checkOut = new Date(this.booking.fechaSalida);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (isNaN(daysDiff) || daysDiff <= 0) {
      return 0;
    }

    // Obtener el tipo de habitación (preferir bookingRoom si está disponible)
    const room = this.bookingRoom ?? this.rooms.find(r => r.idHabitacion === this.booking.idHabitacion);
    const type = room?.tipoHabitacion?.toString().toLowerCase() ?? '';

    // Multiplicador según tipo: sencilla=1, doble=2, suite=3, familiar=4
    let multiplier = 1;
    switch (type) {
      case 'sencilla':
        multiplier = 1;
        break;
      case 'doble':
        multiplier = 2;
        break;
      case 'familiar':
        multiplier = 3;
        break;
      case 'suite':
        multiplier = 4;
        break;
      default:
        multiplier = 1;
    }

    return daysDiff * multiplier;
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

    this.bookingRoom = room;

    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
     // Copiar la información del usuario autenticado al objeto de reserva
    if (this.userInfo) {
      this.booking.idUsuario = this.userInfo.id;
      this.booking.nombreTitular = this.userInfo.nombreCompleto;
      this.booking.email = this.userInfo.email;
      this.booking.telefono = this.userInfo.telefono;
      this.booking.puntos = this.userInfo.puntos || 0;
    }

    // console.log('Prueba: '+this.userInfo.telefono)


    this.booking.idUsuario = this.authService.getStoredUserData()?.idUsuario || 0;
    this.booking.idHabitacion = room.idHabitacion;
    //(this.booking as any).precioHabitacion = room.precio; //  agrega este campo temporalmente

    // Abrir el modal manualmente
    const modalElement = document.getElementById('bookingModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onDatesChange() {
    if (!this.booking.fechaEntrada || !this.booking.fechaSalida) {
      return;
    }
    // esto dispara el cálculo
    const total = this.calculateBookingTotal();
    const userPoints = this.booking.puntos || 0;
    this.totalDiscount = total - (userPoints * 1000);
  }

  onPointsChange() {
    // esto dispara el cálculo
    const total = this.calculateBookingTotal();
    const userPoints = this.booking.puntos || 0;
    this.totalDiscount = total - (userPoints * 1000);
  }

  calculatePointsDiscount() {

  }

  calculateBookingTotal(): number {

    // Calcular la diferencia en días entre las fechas de entrada y salida
    if (!this.booking.fechaEntrada || !this.booking.fechaSalida) {
      return 0;
    }

    const checkIn = new Date(this.booking.fechaEntrada);
    const checkOut = new Date(this.booking.fechaSalida);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (isNaN(daysDiff) || daysDiff <= 0) {
      return 0;
    }

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

  this.usePoints = this.paymentMethod === 'pointsCash';

  this.bookingService.createBooking(payload, this.usePoints).subscribe({
    next: (data) => {
      Swal.fire({
        title: 'Reserva creada correctamente',
        text: '¿Deseas proceder al pago ahora?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Sí, pagar ahora',
        cancelButtonText: 'No, después'
      }).then((result) => {
        if (result.isConfirmed) {
          // 🔹 Llamar al nuevo método para procesar el pago
        var idReserva = data.idReserva ;
        //console.log(idReserva);
        this.realizarPagoReserva(String(idReserva));

        }
      });

      this.bookingFormSubmitted = false;
      form.resetForm();

      // Cerrar el modal manualmente
      const modalElement = document.getElementById('bookingModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
      }
    },
    error: (error) => {
      const errorMessage = error.error?.message || 'Hubo un error al crear la reserva.';
      Swal.fire('Error', errorMessage, 'error');
    }
  });
}

/* 🔹 NUEVO MÉTODO para abrir la pasarela de pago */
realizarPagoReserva(idReserva: string) {
  this.bookingService.realizarPago(idReserva).subscribe({
    next: (preference) => {
      //if (preference && preference.init_point) {
      //console.log(preference)
        //window.location.href = preference.init_point; // Redirigir a MercadoPago
        console.log('Respuesta del backend:', preference);

         window.open(preference.initPoint, '_self'); // o '_self' si quieres en la misma pestaña
     // } else {
       // Swal.fire('Error', 'No se pudo iniciar el proceso de pago.', 'error');
     // }
    },
    error: (err) => {
      console.error('Error al generar pago:', err);
      Swal.fire('Error', 'Ocurrió un problema al conectar con la pasarela de pago.', 'error');
    }
  });
}

}
