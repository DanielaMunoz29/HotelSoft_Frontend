import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../core/services/booking.service';
import { BookingResponse } from '../core/models/booking-response';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-booking-list',
  imports: [CommonModule],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css'
})
export class BookingListComponent {
  bookings: BookingResponse[] = [];

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    const idUsuario = this.authService.getStoredUserData()?.idUsuario || 0;

    this.bookingService.getBookingsByUserId(idUsuario).subscribe({
      next: (data) => this.bookings = data.content
    });
  }
}
