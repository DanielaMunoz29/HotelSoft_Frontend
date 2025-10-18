import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-list',
  imports: [CommonModule],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css'
})
export class BookingListComponent {
  bookings = [
    { id: 1, room: 'Room 101', checkInDate: '2023-10-01T12:00:00', checkOutDate: '2023-10-05T12:00:00', status: 'confirmed' },
    { id: 2, room: 'Room 102', checkInDate: '2023-10-05T12:00:00', checkOutDate: '2023-10-10T12:00:00', status: 'pending' },
    { id: 3, room: 'Room 103', checkInDate: '2023-10-10T12:00:00', checkOutDate: '2023-10-15T12:00:00', status: 'cancelled' }
  ];
}
