
export interface User {
  id?: number;
  cedula: string;
  nombreCompleto: string;
  email: string;
  role?: string;
  telefono?: string;
  contraseña?: string;
  enabled?: boolean;
}
