import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Booking } from '../models/booking';
import { BookingResponse } from '../models/booking-response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private apiUrl = 'http://localhost:8080/api/reservas';

  //private apiUrl = 'https://hotelsoft-backend.onrender.com/api/reservas';

  constructor(private http: HttpClient) { }

  getBookings(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}`);
  }

  getBookingById(id: number) {
    return this.http.get<BookingResponse>(`${this.apiUrl}/${id}`);
  }

  getBookingsByUserId(idUsuario: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${idUsuario}`);
  }

  createBooking(bookingData: Booking, usePoints: boolean) {
    const params = new HttpParams().set('puntos', usePoints);
    return this.http.post(`${this.apiUrl}/crear`, bookingData, { params });
  }

  updateBooking(id: number, bookingData: Booking) {
    return this.http.put(`${this.apiUrl}/${id}`, bookingData);
  }

  deleteBooking(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
