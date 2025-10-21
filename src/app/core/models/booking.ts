export interface Booking {
    idReserva?: number;
    idUsuario: number;
    idHabitacion: number;
    nombreTitular: string;
    email: string;
    telefono: string;
    fechaEntrada: Date;
    fechaSalida: Date;
    puntos: number;
}
