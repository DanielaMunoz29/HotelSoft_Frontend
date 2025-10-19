import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private apiUrl = 'http://localhost:8080/api/habitaciones';

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

  getRoomsFiltered(type: string, checkInDate: number, checkOutDate: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/filter`, {
      params: {
        tipo: type,
        fechaEntrada: checkInDate,
        fechaSalida: checkOutDate
      }
    });
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

  updateRoom(id: number, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  deleteRoom(numeroHabitacion: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${numeroHabitacion}`);
  }
}
