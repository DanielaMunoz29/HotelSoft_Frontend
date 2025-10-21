import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'https://hotelsoft-backend.onrender.com/users';

  constructor(
    private http: HttpClient
  ) { }

  getUserByCedula(cedula: string) {
    return this.http.get(`${this.apiUrl}/cedula/${cedula}`);
  }

  getUserByEmail(email: string) {
    return this.http.get(`${this.apiUrl}/email/${email}`);
  }
}
