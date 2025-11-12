
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

declare const google: any;

/**
 * Servicio para manejar la autenticación con Google Identity Services
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private readonly API_BASE_URL = 'https://hotelsoftback-1495464507.northamerica-northeast1.run.app';
  //private readonly API_BASE_URL = 'https://hotelsoft-backend.onrender.com';
  private googleInitialized = false;
  
  private googleTokenSubject = new BehaviorSubject<string | null>(null);
  public googleToken$ = this.googleTokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Inicializa Google Identity Services con el Client ID proporcionado
   * @param clientId Client ID de Google Cloud Console
   */
  initializeGoogleSignIn(clientId: string): void {
    if (this.googleInitialized) {
      return;
    }

    if (typeof google !== 'undefined') {
      this.initializeGoogle(clientId);
      return;
    }

    this.loadGoogleScript().then(() => {
      this.initializeGoogle(clientId);
    }).catch(error => {
      console.error('Error cargando Google Sign-In:', error);
    });
  }

  /**
   * Carga el script de Google Identity Services
   * @returns Promise que se resuelve cuando el script se carga correctamente
   */
  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error cargando Google Script'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Configura la inicialización de Google Identity Services
   * @param clientId Client ID de Google Cloud Console
   */
  private initializeGoogle(clientId: string): void {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => this.handleCredentialResponse(response)
    });
    
    this.googleInitialized = true;
  }

  /**
   * Renderiza el botón de Google Sign-In en el elemento especificado
   * @param elementId ID del elemento HTML donde se renderizará el botón
   */
  renderButton(elementId: string): void {
    if (this.googleInitialized) {
      const buttonDiv = document.getElementById(elementId);
      if (buttonDiv) {
        google.accounts.id.renderButton(
          buttonDiv,
          { 
            theme: 'outline', 
            size: 'large',
            type: 'standard'
          }
        );
      }
    } else {
      console.warn('Google no está inicializado');
    }
  }

  /**
   * Inicia el flujo de login con Google
   */
  loginWithGoogle(): void {
    if (!this.googleInitialized) {
      console.error('Google no está inicializado');
      return;
    }

    google.accounts.id.prompt();
  }

  /**
   * Maneja la respuesta de credenciales de Google
   * @param response Respuesta de Google con el token de credencial
   */
  private handleCredentialResponse(response: any): void {
    if (response.credential) {
      const idToken = response.credential;
      this.googleTokenSubject.next(idToken);
    } else {
      console.error('No se recibió token de Google');
      this.googleTokenSubject.next(null);
    }
  }

  /**
   * Inicia sesión con Google usando el token de ID
   * @param idToken Token de identificación de Google
   * @returns Observable con la respuesta del servidor
   */
  loginWithGoogleToken(idToken: string): Observable<any> {
    const payload = { idToken };
    return this.http.post<any>(
      `${this.API_BASE_URL}/api/auth/google-login`, 
      payload
    );
  }
}