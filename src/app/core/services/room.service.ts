import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private apiUrl = 'https://hotelsoft-backend.onrender.com/api/habitaciones';
  //private apiUrl = 'https://hotelsoftback-1495464507.northamerica-northeast1.run.app/api/habitaciones';

  constructor(private http: HttpClient) { }

  getRooms(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  getRoomsByType(type: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/tipo/${type}`);
  }

  getRoomsByStatus(status: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estado/${status}`);
  }

  getRoomsFiltered(roomSearchParams: any): Observable<any> {

    let params = new HttpParams().set('tipo', roomSearchParams.type || '').set('estado', roomSearchParams.status || '');

    if (roomSearchParams.checkInDate) {
      params = params.set('fechaEntrada', new Date(roomSearchParams.checkInDate).toISOString().slice(0, 19));
    }

    if (roomSearchParams.checkOutDate) {
      params = params.set('fechaSalida', new Date(roomSearchParams.checkOutDate).toISOString().slice(0, 19));
    }

    return this.http.get<any>(`${this.apiUrl}/filter`, { params });
  }

  createRoom(room: Room, imagenes: File[]): Observable<Room> {
    const formData = new FormData();

    // Convertir el objeto room a JSON y agregarlo como Blob
    formData.append(
      'habitacion',
      new Blob([JSON.stringify(room)], { type: 'application/json' })
    );

    // Agregar las imágenes (si hay)
    if (imagenes && imagenes.length > 0) {
      imagenes.forEach(img => formData.append('imagenes', img));
    }

    return this.http.post<Room>(this.apiUrl, formData);
  }

  updateRoom(room: Room, imagenes: File[]): Observable<Room> {

    const formData = new FormData();

    // Convertir el objeto room a JSON y agregarlo como Blob
    formData.append(
      'habitacion',
      new Blob([JSON.stringify(room)], { type: 'application/json' })
    );

    // Agregar las imágenes (si hay)
    if (imagenes && imagenes.length > 0) {
      imagenes.forEach(img => formData.append('imagenes', img));
    }

    return this.http.put<Room>(`${this.apiUrl}/${room.numeroHabitacion}`, formData);
  }

  updateRoomStatus(numeroHabitacion: string, newStatus: string): Observable<Room> {
    const params = new HttpParams().set('nuevoEstado', newStatus);
    return this.http.patch<Room>(`${this.apiUrl}/${numeroHabitacion}/estado`, params);
  }

  deleteRoom(numeroHabitacion: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${numeroHabitacion}`);
  }
}
