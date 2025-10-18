import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../core/services/room.service';
import { Room } from '../core/models/room.model';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css'
})
export class RoomListComponent {
  rooms: Room[] = [];
  roomDetail: Room | null = null;

  constructor(
    private roomService: RoomService
  ) { }

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.roomService.getRooms().subscribe({
      next: (data) => this.rooms = data.content
    });
  }

  openRoomDetail(room: Room) {
    this.roomDetail = room;
  }
}
