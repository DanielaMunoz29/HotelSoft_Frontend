import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../core/models/room.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule]
})
export class HomeComponent {
  rooms: Room[] = [];

  constructor() { }
}
