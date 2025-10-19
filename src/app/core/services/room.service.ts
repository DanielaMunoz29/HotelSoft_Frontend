import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getRoomsByStatus(status: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estado/${status}`);
  }

  getRoomsFiltered(roomSearchParams: any): Observable<any> {
    console.log('Filtering rooms with params:', roomSearchParams);

    return this.http.get<any>(`${this.apiUrl}/filter`, {
      params: {
        tipo: roomSearchParams.type || '',
        estado: roomSearchParams.status || '',
        fechaEntrada: roomSearchParams.checkInDate ? new Date(roomSearchParams.checkInDate).toISOString().slice(0, 19) : new Date("1900-01-01").toISOString().slice(0, 19),
        fechaSalida: roomSearchParams.checkInDate ? new Date(roomSearchParams.checkOutDate).toISOString().slice(0, 19) : new Date("3000-01-01").toISOString().slice(0, 19)
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

  updateRoomStatus(numeroHabitacion: string, newStatus: string): Observable<Room> {
    const params = new HttpParams().set('nuevoEstado', newStatus);
    return this.http.patch<Room>(`${this.apiUrl}/${numeroHabitacion}/estado`, params);
  }

  deleteRoom(numeroHabitacion: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${numeroHabitacion}`);
  }
}
