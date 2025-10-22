import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RoomService } from '../core/services/room.service';
import { Room } from '../core/models/room.model';
import { Router, RouterLink } from '@angular/router';
import { AMENITIES_LIST } from '../core/constants/amenities';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css'
})
export class RoomListComponent {
  rooms: Room[] = [];
  roomDetail: Room | null = null;

  roomSearchParams: {
    type: string,
    status: string
  } = {
      type: '',
      status: ''
    };

  // Lista de comodidades 
  amenitiesList = AMENITIES_LIST;

  constructor(
    private roomService: RoomService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadRooms();
  }

  // Obtener datos de la comodidad
  getAmenityData(value: string): any {
    const amenity = this.amenitiesList.find(a => a.value === value);
    return amenity ? amenity : { label: value, icon: '' };
  }

  // Cargar habitaciones
  loadRooms() {
    this.roomService.getRooms().subscribe({
      next: (data) => this.rooms = data.content
    });
  }

  // Buscar habitaciones por número o tipo
  searchRooms() {
    this.roomService.getRoomsFiltered(this.roomSearchParams).subscribe({
      next: (data) => this.rooms = data.content
    });
  }

  // Mostrar detalles de la habitación Modal
  openRoomDetail(room: Room) {
    this.roomDetail = room;
  }

  clearRoomDetail() {
    this.roomDetail = null;
  }

  // Navegar al formulario de edición
  editRoom(id: number) {
    this.router.navigate(['/room-form', id]);
  }

  updateRoomStatus(roomNumber: string, newStatus: string) {
    this.roomService.updateRoomStatus(roomNumber, newStatus).subscribe({
      next: () => {
        this.loadRooms();
        Swal.fire('Éxito', 'El estado de la habitación ha sido actualizado.', 'success');
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Hubo un error al actualizar la habitación.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  // Eliminar habitación
  deleteRoom(roomNumber: string) {
    this.roomService.deleteRoom(roomNumber).subscribe({
      next: () => {
        this.loadRooms();
        Swal.fire('Éxito', 'La habitación ha sido eliminada.', 'success');
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Hubo un error al eliminar la habitación.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }
}
