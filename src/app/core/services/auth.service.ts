import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Interfaz para el payload de registro de usuario
 */
export interface RegisterPayload {
  cedula: string;
  nombreCompleto: string;
  email: string;
  password: string;
  telefono: string;
}

/**
 * Interfaz para el payload de login tradicional
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Interfaz para la respuesta del login
 */
export interface LoginResponse {
  token?: string;
  requires2FA?: boolean;
  twoFactorRequired?: boolean;
  message?: string;
  mensaje?: string;
  user?: any;
}

/**
 * Interfaz para el payload de recuperación de contraseña
 */
export interface RecoverPasswordPayload {
  email: string;
}

/**
 * Interfaz para el payload de cambio de contraseña
 */
export interface ChangePasswordPayload {
  token: string;
  nuevaPassword: string;
}

/**
 * Interfaz genérica para respuestas de la API
 */
export interface ApiResponse {
  message?: string;
  mensaje?: string;
  success?: boolean;
  token?: string;
  valid?: boolean;
}

/**
 * Interfaz para el payload de login con Google
 */
export interface GoogleLoginPayload {
  idToken: string;
}

/**
 * Servicio de autenticación que maneja login tradicional y con Google
 * Incluye funcionalidad de cierre automático por inactividad
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = 'http://localhost:8080';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private userDataSubject = new BehaviorSubject<any>(this.getStoredUserData());

  // Variables para control de inactividad
  private inactivityTimer: any;
  private lastActivity: number = Date.now();
  private isMonitoringActive: boolean = false;

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public userData$ = this.userDataSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Iniciar monitoreo solo si está autenticado
    if (this.isAuthenticated()) {
      this.startInactivityMonitoring();
    }
  }

  /**
   * Inicia el monitoreo de inactividad del usuario
   */
  private startInactivityMonitoring(): void {
    if (this.isMonitoringActive) return;
    
    this.isMonitoringActive = true;
    
    // Escuchar eventos de actividad
    const events = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer(), { passive: true });
    });

    // Verificar inactividad cada 30 segundos
    this.inactivityTimer = setInterval(() => {
      this.checkInactivity();
    }, 30000);
    
    this.resetInactivityTimer();
  }

  /**
   * Detiene el monitoreo de inactividad
   */
  private stopInactivityMonitoring(): void {
    this.isMonitoringActive = false;
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Reinicia el timer de inactividad
   */
  private resetInactivityTimer(): void {
    if (this.isAuthenticated()) {
      this.lastActivity = Date.now();
    }
  }

  /**
   * Verifica si el usuario ha estado inactivo por más de 2 minutos
   */
  private checkInactivity(): void {
    if (!this.isAuthenticated()) {
      this.stopInactivityMonitoring();
      return;
    }

    const inactiveTime = Date.now() - this.lastActivity;
    const inactiveMinutes = inactiveTime / (1000 * 60);

    if (inactiveMinutes >= 2) {
      this.logoutDueToInactivity();
    }
  }

  /**
   * Maneja el cierre de sesión por inactividad
   */
  private logoutDueToInactivity(): void {
    this.stopInactivityMonitoring();
    this.logout();
    this.router.navigate(['/login'], {
      queryParams: { 
        sessionExpired: 'true',
        reason: 'inactividad' 
      }
    });
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param payload Datos del usuario a registrar
   * @returns Observable con la respuesta de la API
   */
  register(payload: RegisterPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.API_BASE_URL}/api/auth/register`,
      payload
    ).pipe(
      catchError(this.handleError('registro'))
    );
  }

  /**
   * Inicia sesión con email y contraseña (login tradicional)
   * @param payload Credenciales de acceso
   * @returns Observable con la respuesta del login
   */
  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.API_BASE_URL}/api/auth/login`,
      payload
    ).pipe(
      tap((response: LoginResponse) => {
        if (response && response.token) {
          this.handleLoginSuccess(response.token, response.user);
        }
      }),
      catchError(this.handleError('inicio de sesión'))
    );
  }

  /**
   * Inicia sesión usando un token de Google
   * @param payload Token de identificación de Google
   * @returns Observable con la respuesta del login
   */
  loginWithGoogle(payload: GoogleLoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.API_BASE_URL}/api/auth/google-login`,
      payload
    ).pipe(
      tap((response: LoginResponse) => {
        if (response && response.token) {
          this.handleLoginSuccess(response.token, response.user);
        }
      }),
      catchError(this.handleError('inicio de sesión con Google'))
    );
  }

  /**
   * Maneja el éxito del proceso de login
   * @param token Token de autenticación
   * @param userData Datos del usuario
   */
  private handleLoginSuccess(token: string, userData: any): void {
    localStorage.setItem(this.TOKEN_KEY, token);

    let processedUserData = userData;
    if (!processedUserData) {
      processedUserData = this.extractUserFromToken(token);
    }

    if (processedUserData) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(processedUserData));
      this.userDataSubject.next(processedUserData);
    }

    this.isAuthenticatedSubject.next(true);
    this.startInactivityMonitoring(); // Iniciar monitoreo después del login exitoso
  }

  /**
   * Solicita el restablecimiento de contraseña
   * @param email Email del usuario
   * @returns Observable con la respuesta de la API
   */
  forgotPassword(email: string): Observable<ApiResponse> {
    const payload: RecoverPasswordPayload = { email };
    return this.http.post<ApiResponse>(
      `${this.API_BASE_URL}/api/auth/forgot-password`,
      payload
    ).pipe(
      catchError(this.handleError('recuperación de contraseña'))
    );
  }

  /**
   * Valida un token de restablecimiento de contraseña
   * @param token Token a validar
   * @returns Observable con el resultado de la validación
   */
  validateResetToken(token: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      `${this.API_BASE_URL}/api/auth/validate-reset-token`,
      { params: { token } }
    ).pipe(
      catchError(this.handleError('validación de token'))
    );
  }

  /**
   * Restablece la contraseña usando un token válido
   * @param token Token de restablecimiento
   * @param nuevaPassword Nueva contraseña
   * @returns Observable con la respuesta de la API
   */
  resetPassword(token: string, nuevaPassword: string): Observable<ApiResponse> {
    const payload: ChangePasswordPayload = { token, nuevaPassword };
    return this.http.post<ApiResponse>(
      `${this.API_BASE_URL}/api/auth/reset-password`,
      payload
    ).pipe(
      catchError(this.handleError('restablecimiento de contraseña'))
    );
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * @param payload Datos para el cambio de contraseña
   * @returns Observable con la respuesta de la API
   */
  changePassword(payload: ChangePasswordPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.API_BASE_URL}/api/auth/change-password`,
      payload
    ).pipe(
      catchError(this.handleError('cambio de contraseña'))
    );
  }

  /**
   * Obtiene el token de autenticación almacenado
   * @returns Token de autenticación o null si no existe
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene los datos del usuario almacenados
   * @returns Datos del usuario o null si no existen
   */
  getStoredUserData(): any {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Verifica si existe un token válido
   * @returns true si el token es válido, false en caso contrario
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }

  /**
   * Extrae información del usuario desde el token JWT
   * @param token Token JWT
   * @returns Objeto con datos del usuario
   */
  private extractUserFromToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        nombre: payload.nombre || payload.name || payload.nombreCompleto || payload.userName || payload.sub,
        email: payload.email || payload.sub,
        nombreCompleto: payload.nombreCompleto || payload.nombre || payload.name,
        ...payload
      };
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si el usuario está autenticado, false en caso contrario
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtiene los datos del usuario actual
   * @returns Datos del usuario actual
   */
  getCurrentUser(): any {
    return this.userDataSubject.value;
  }

  /**
   * Actualiza el estado de autenticación
   */
  updateAuthState(): void {
    const isAuth = this.hasValidToken();
    this.isAuthenticatedSubject.next(isAuth);
    if (isAuth) {
      const userData = this.getStoredUserData();
      this.userDataSubject.next(userData);
      this.startInactivityMonitoring();
    } else {
      this.userDataSubject.next(null);
      this.stopInactivityMonitoring();
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.stopInactivityMonitoring();
    
    // Limpiar almacenamiento local
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Actualizar estados
    this.isAuthenticatedSubject.next(false);
    this.userDataSubject.next(null);
  }

  /**
   * Maneja errores de las solicitudes HTTP
   * @param operation Nombre de la operación que falló
   * @returns Función que maneja el error
   */
  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      console.error(`Error en ${operation}:`, error);

      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error del cliente: ${error.error.message}`;
      } else {
        if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Datos inválidos';
        } else if (error.status === 401) {
          errorMessage = 'No autorizado';
        } else if (error.status === 404) {
          errorMessage = 'Recurso no encontrado';
        } else if (error.status >= 500) {
          errorMessage = 'Error interno del servidor';
        } else {
          errorMessage = error.error?.message || error.message || `Error ${error.status}`;
        }
      }

      return throwError(() => new Error(errorMessage));
    };
  }

  /**
   * Almacena el token y los datos del usuario
   * @param token Token de autenticación
   * @param userData Datos del usuario (opcional)
   */
  saveToken(token: string, userData?: any): void {
    localStorage.setItem(this.TOKEN_KEY, token);

    if (userData) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      this.userDataSubject.next(userData);
    } else {
      const userFromToken = this.extractUserFromToken(token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(userFromToken));
      this.userDataSubject.next(userFromToken);
    }

    this.isAuthenticatedSubject.next(true);
    this.startInactivityMonitoring();
  }
}