import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, UserDTO } from '../models/user.model';
import { Observable } from 'rxjs';
import { LimpiezaDto } from '../models/LimpiezaDto';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  //private apiUrl = 'https://hotelsoft-backend.onrender.com/api/users';
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(
    private http: HttpClient
  ) { }


    //  Registrar nueva limpieza
  registrarLimpieza(limpieza: LimpiezaDto): Observable<LimpiezaDto> {
    return this.http.post<LimpiezaDto>(`${this.apiUrl}/registrarLimpieza`, limpieza);
  }

    // Obtener limpiezas por usuario
  getLimpiezasByUser(userId: number): Observable<LimpiezaDto[]> {
    return this.http.get<LimpiezaDto[]>(`${this.apiUrl}/listarLimpiezaByusuario/${userId}`);
  }
  // 🔹 Editar limpieza (PUT)
  updateLimpieza(id: number, limpieza: Partial<LimpiezaDto>): Observable<LimpiezaDto> {
    return this.http.put<LimpiezaDto>(`${this.apiUrl}/editarLimpieza/${id}`, limpieza);
  }

  getUserByDocument(cedula: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/cedula/${cedula}`);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/email/${email}`);
  }

  updateUserProfile(user: User) {
    return this.http.put(`${this.apiUrl}/cedula/${user.cedula}`, user);
  }

  getUserByEmailDto(email: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/email/${email}`);
  }
}
