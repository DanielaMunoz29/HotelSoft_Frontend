import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../core/services/booking.service';
import { BookingResponse } from '../core/models/booking-response';
import { AuthService } from '../core/services/auth.service';
import { Room } from '../core/models/room.model';
import { AMENITIES_LIST } from '../core/constants/amenities';

@Component({
  selector: 'app-booking-list',
  imports: [CommonModule],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css'
})
export class BookingListComponent {
  bookings: BookingResponse[] = [];

  roomDetail: Room | null = null;

  // Lista de comodidades 
  amenitiesList = AMENITIES_LIST;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadBookings();
  }

  // Obtener datos de la comodidad
  getAmenityData(value: string): any {
    const amenity = this.amenitiesList.find(a => a.value === value);
    return amenity ? amenity : { label: value, icon: '' };
  }

  loadBookings() {
    const idUsuario = this.authService.getStoredUserData()?.idUsuario || 0;

    this.bookingService.getBookingsByUserId(idUsuario).subscribe({
      next: (data) => this.bookings = data.content
    });
  }

  // Mostrar detalles de la habitación Modal
  openRoomDetail(room: Room) {
    this.roomDetail = room;
  }

  clearRoomDetail() {
    this.roomDetail = null;
  }

  cancelBooking(bookingId: number) {
    this.bookingService.deleteBooking(bookingId).subscribe({
      next: () => {
        this.loadBookings();
      }
    });
  }
}
