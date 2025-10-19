import { Room } from "./room.model";

export interface BookingResponse {
    idReserva: number;
    nombreTitular: string;
    email: string;
    telefono: string;
    fechaEntrada: Date;
    fechaSalida: Date;
    precioTotal: number;
    estadoReserva?: string;
    habitacion: Room;
}
