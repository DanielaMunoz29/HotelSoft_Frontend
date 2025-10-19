import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { Room } from '../core/models/room.model';
import { RoomService } from '../core/services/room.service';
import Swal from 'sweetalert2';
import { AMENITIES_LIST } from '../core/constants/amenities';

@Component({
  selector: 'app-room-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './room-form.component.html',
  styleUrls: ['./room-form.component.css']
})
export class RoomFormComponent {
  room: Room = {
    idHabitacion: 0,
    nombreHabitacion: '',
    numeroHabitacion: '',
    tipoHabitacion: '',
    precio: 0,
    estadoHabitacion: '',
    comodidades: [],
    imagenes: []
  };

  amenitiesList = AMENITIES_LIST;

  selectedImages: { file: File, url: string }[] = [];
  isDragging = false;
  dragIndex: number | null = null;

  private routeSub!: Subscription;

  isEditMode = false;
  submitted = false;

  constructor(
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  ngOnInit() {
    //Validar si se recibe id
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.loadRoom(id);
      } else {
        this.isEditMode = false;
        this.room = {
          idHabitacion: 0,
          nombreHabitacion: '',
          numeroHabitacion: '',
          tipoHabitacion: '',
          precio: 0,
          estadoHabitacion: '',
          comodidades: [],
          imagenes: []
        }; // resetea el formulario si no hay id
      }
    });
  }

  loadRoom(id: string) {
    this.roomService.getRoomById(Number(id)).subscribe({
      next: (data) => {
        this.room = data;
      }
    });

    this.loadSelectedImages();
  }

  loadSelectedImages() {
    this.selectedImages = this.room.imagenes.map(url => ({
      file: new File([], ''), // Archivo vacío, solo para mantener la estructura
      url
    }));
  }

  // Agregar o quitar una comodidad
  toggleAmenity(amenity: string) {
    const index = this.room.comodidades.indexOf(amenity);
    if (index === -1) {
      this.room.comodidades.push(amenity);
    } else {
      this.room.comodidades.splice(index, 1);
    }
    console.log(this.room.comodidades);
  }

  // Verificar si una comodidad está seleccionada
  isAmenitySelected(amenity: string): boolean {
    return this.room.comodidades.includes(amenity);
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

    if (!this.selectedImages.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay imágenes',
        text: 'Por favor, seleccione imágenes para subir.',
      });
      return;
    }

    if (!this.room.comodidades.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin comodidades',
        text: 'Por favor, seleccione al menos una comodidad para la habitación.',
      });
      return;
    }

    if (form.invalid) {
      return;
    }

    this.roomService.createRoom(this.room, this.selectedImages.map(img => img.file)).subscribe({
      next: (data) => {
        Swal.fire({
          icon: 'success',
          title: 'Habitación creada',
          text: `La habitación ${data.nombreHabitacion} ha sido creada exitosamente.`,
        });
        this.router.navigate(['/room-list']);
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Hubo un error al crear la habitación: ${error.message}`,
        });
      }
    });
  }
}
