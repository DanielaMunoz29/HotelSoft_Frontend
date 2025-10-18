import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Room } from '../core/models/room.model';
import { RoomService } from '../core/services/room.service';

@Component({
  selector: 'app-room-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './room-form.component.html',
  styleUrls: ['./room-form.component.css']
})
export class RoomFormComponent {
  room: Room = {
    id: '',
    name: '',
    number: '',
    type: '',
    price: 0,
    amenities: [],
    availability: true,
    images: []
  };

  amenitiesList: { label: string; value: string; icon: string; }[] = [
    { label: 'Cama Sencilla', value: 'CAMA_SENCILLA', icon: '' },
    { label: 'Cama Doble', value: 'CAMA_DOBLE', icon: '' },
    { label: 'Cama Queen', value: 'CAMA_QUEEN', icon: '' },
    { label: 'Cama King', value: 'CAMA_KING', icon: '' },
    { label: 'TV', value: 'TV', icon: 'bi bi-tv' },
    { label: 'WiFi', value: 'WIFI', icon: 'bi bi-wifi' },
    { label: 'Escritorio', value: 'ESCRITORIO', icon: '' },
    { label: 'Armario', value: 'ARMARIO', icon: '' },
    { label: 'Teléfono', value: 'TELEFONO', icon: 'bi bi-telephone' },
    { label: 'Lampara de Lectura', value: 'LAMPARAS_LECTURA', icon: 'bi bi-lamp' },
    { label: 'Blackout', value: 'BLACKOUT', icon: '' },
    { label: 'Minibar', value: 'MINIBAR', icon: 'bi bi-cup-straw' },
    { label: 'Caja Fuerte', value: 'CAJA_FUERTE', icon: 'bi bi-safe' },
    { label: 'Secador de Cabello', value: 'SECADOR_CABELLO', icon: '' },
    { label: 'Plancha', value: 'PLANCHA', icon: '' },
    { label: 'Cafetera', value: 'CAFETERA', icon: 'bi bi-cup-hot' },
    { label: 'Lavandería', value: 'LAVANDERIA', icon: '' },
    { label: 'Balcón', value: 'BALCON', icon: '' },
    { label: 'Jacuzzi', value: 'JACUZZI', icon: '' },
    { label: 'Sala de Estar', value: 'SALA_ESTAR', icon: '' },
    { label: 'Bata/Pantuflas', value: 'BATA_PANTUFLAS', icon: '' }
  ];

  selectedImages: { file: File, url: string }[] = [];
  isDragging = false;
  dragIndex: number | null = null;

  isEditMode = false;
  submitted = false;

  constructor(
    private roomService: RoomService
  ) {

  }

  ngOnInit() {
    // Si es modo edición, cargar datos de la habitación existente

  }

  // Agregar o quitar una comodidad
  toggleAmenity(amenity: string) {
    const index = this.room.amenities.indexOf(amenity);
    if (index === -1) {
      this.room.amenities.push(amenity);
    } else {
      this.room.amenities.splice(index, 1);
    }
    console.log(this.room.amenities);
  }

  // Verificar si una comodidad está seleccionada
  isAmenitySelected(amenity: string): boolean {
    return this.room.amenities.includes(amenity);
  }

  // Cuando el usuario hace clic o selecciona archivos
  onFileSelect(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) this.addFiles(files);
  }

  // Cuando arrastra archivos sobre el área
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  // Cuando sale del área de arrastre
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  // Cuando suelta los archivos en el área
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) this.addFiles(event.dataTransfer.files);
  }

  // Añadir los archivos seleccionados o arrastrados
  addFiles(files: FileList) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.selectedImages.push({ file, url: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Eliminar una imagen seleccionada
  removeImage(index: number, event?: Event) {
    event?.stopPropagation(); // 🔹 evita que el click se propague al contenedor
    this.selectedImages.splice(index, 1);
  }

  // ---- Reordenar imágenes ----
  onDragStart(event: DragEvent, index: number) {
    this.dragIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOverImage(event: DragEvent, index: number) {
    event.preventDefault();
  }

  onDropImage(event: DragEvent, index: number) {
    event.preventDefault();
    const fromIndex = this.dragIndex;
    if (fromIndex === null || fromIndex === index) return;

    const draggedItem = this.selectedImages[fromIndex];
    this.selectedImages.splice(fromIndex, 1);
    this.selectedImages.splice(index, 0, draggedItem);
    this.dragIndex = null;
  }

  onDragEnd() {
    this.dragIndex = null;
  }

  filterNumbers(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, ''); // elimina todo lo que no sea dígito
  }

  onSubmit(form: NgForm) {
    this.submitted = true;

    // Formulario válido: enviar datos
    console.log('Datos:', this.room);
    console.log('Imágenes:', this.selectedImages);
  }
}
