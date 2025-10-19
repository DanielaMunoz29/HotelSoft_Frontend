export interface Room {
    id: number;
    nombreHabitacion: string;
    numeroHabitacion: string;
    descripcion?: string;
    estadoHabitacion?: string;
    tipoHabitacion: string;
    precio: number;
    comodidades: string[];
    imagenes: string[];
}
