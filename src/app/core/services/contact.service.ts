import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private apiUrl = 'https://hotelsoft-backend.onrender.com/contact';

  constructor(
    private http: HttpClient
  ) { }

  sendEmail(contactData: any) {
    return this.http.post(`${this.apiUrl}/send`, contactData);
  }
}
