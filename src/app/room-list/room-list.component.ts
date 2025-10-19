import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RoomService } from '../core/services/room.service';
import { Room } from '../core/models/room.model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css'
})
export class RoomListComponent {
  rooms: Room[] = [];
  roomDetail: Room | null = null;

  constructor(
    private roomService: RoomService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.roomService.getRooms().subscribe({
      next: (data) => this.rooms = data.content
    });
  }

  searchRooms() {
    
  }

  openRoomDetail(room: Room) {
    this.roomDetail = room;
  }

  clearRoomDetail() {
    this.roomDetail = null;
  }

  editRoom(id: number) {
    this.router.navigate(['/room-form', id]);
  }

  deleteRoom(roomNumber: string) {
    this.roomService.deleteRoom(Number(roomNumber)).subscribe({
      next: () => {
        this.loadRooms();
      }
    });
  }
}
