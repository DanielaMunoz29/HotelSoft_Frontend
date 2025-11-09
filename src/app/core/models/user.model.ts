
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

export interface UserDTO {
  id: number;
  email: string;
  nombreCompleto: string;
  cedula: string;
  telefono: string;
  role: string;
  enabled: boolean;
  puntos:number;
}

