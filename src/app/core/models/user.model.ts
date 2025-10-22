
export interface User {
  id?: number;
  cedula: string;
  nombreCompleto: string;
  email: string;
  role?: string;
  telefono?: string;
  contrasena?: string;
  enabled?: boolean;
  puntos?: number;
}
