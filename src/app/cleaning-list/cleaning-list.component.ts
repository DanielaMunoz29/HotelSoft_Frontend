import { Component, OnInit } from '@angular/core';


import { UserService } from '../core/services/user.service';
import { LimpiezaDto } from '../core/models/LimpiezaDto';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cleaning-list',
    imports: [CommonModule], // 👈 IMPORTANTE
  templateUrl: './cleaning-list.component.html',
  styleUrls: ['./cleaning-list.component.css']
})
export class CleaningListComponent implements OnInit {

  limpiezas: LimpiezaDto[] = [];
  loading = true;
  userId!: number;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId =  Number(this.authService.getUserIdFromToken());

    if (this.userId) {
      this.userService.getLimpiezasByUser(this.userId).subscribe({
        next: (data) => {
          this.limpiezas = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando limpiezas:', err);
          this.loading = false;
        }
      });
    } else {
      console.warn('Usuario no autenticado');
      this.loading = false;
    }
  }
}
