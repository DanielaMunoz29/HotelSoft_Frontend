import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'https://hotelsoft-backend.onrender.com/api/users';

  constructor(
    private http: HttpClient
  ) { }

  getUserByDocument(cedula: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/cedula/${cedula}`);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/email/${email}`);
  }

  updateUserProfile(user: User) {
    return this.http.put(`${this.apiUrl}/cedula/${user.cedula}`, user);
  }
}
