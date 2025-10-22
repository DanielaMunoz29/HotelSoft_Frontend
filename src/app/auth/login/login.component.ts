// src/app/auth/login/login.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

/**
 * Componente para el inicio de sesión de usuarios
 * Maneja autenticación tradicional y con Google
 * Incluye detección de sesiones expiradas por inactividad
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  /**
   * Mensaje de error para mostrar al usuario
   */
  errorMsg: string = '';

  /**
   * Formulario reactivo para login tradicional
   */
  loginForm: FormGroup;

  /**
   * Indica si está en proceso de autenticación
   */
  isLoading: boolean = false;

  /**
   * Indica si la autenticación con Google está disponible
   */
  googleAuthAvailable: boolean = true;

  /**
   * Origen actual de la aplicación
   */
  currentOrigin: string = '';

  /**
   * Suscripción para manejar tokens de Google
   */
  private googleTokenSubscription: Subscription | null = null;

  /**
   * Client ID de Google Cloud Console para autenticación
   */
  private readonly GOOGLE_CLIENT_ID = '1495464507-0l5r37b8kus8atnv4ameqisb0j84be4e.apps.googleusercontent.com';

  /**
   * Constructor del componente de login
   * @param formBuilder Servicio para crear formularios reactivos
   * @param authService Servicio de autenticación
   * @param router Servicio de navegación
   * @param route Servicio para acceder a parámetros de ruta
   * @param googleAuthService Servicio de autenticación con Google
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private googleAuthService: GoogleAuthService
  ) {
    this.loginForm = this.createLoginForm();
    this.currentOrigin = window.location.origin;
  }

  /**
   * Inicializa el componente
   * Verifica parámetros de sesión expirada e inicializa autenticación Google
   */
  ngOnInit(): void {
    this.checkSessionExpiredParam();
    this.initializeGoogleAuth();
  }

  /**
   * Limpia recursos al destruir el componente
   */
  ngOnDestroy(): void {
    this.cleanupGoogleSubscription();
  }

  /**
   * Crea y configura el formulario de login
   * @returns FormGroup configurado con validaciones
   */
  private createLoginForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Verifica si la sesión anterior expiró por inactividad
   * Lee parámetros de la URL y muestra alerta correspondiente
   */
  private checkSessionExpiredParam(): void {
    this.route.queryParams.subscribe({
      next: (params) => {
        if (params['sessionExpired'] === 'true') {
          this.handleSessionExpired();
        }
      },
      error: (error) => {
        console.error('Error leyendo parámetros de ruta:', error);
      }
    });
  }

  /**
   * Maneja la lógica cuando se detecta una sesión expirada
   */
  private handleSessionExpired(): void {
    this.showSessionExpiredAlert();
    this.cleanUrlParams();
  }

  /**
   * Muestra alerta de sesión expirada al usuario
   */
  private showSessionExpiredAlert(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Sesión expirada',
      text: 'Su sesión se cerró automáticamente después de 2 minutos de inactividad.',
      confirmButtonText: 'Entendido',
      background: '#fff3cd',
      iconColor: '#856404'
    });
  }

  /**
   * Limpia los parámetros de la URL después de leerlos
   */
  private cleanUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  /**
   * Obtiene el control del campo email
   * @returns FormControl del campo email
   */
  get email() { 
    return this.loginForm.get('email')!; 
  }

  /**
   * Obtiene el control del campo password
   * @returns FormControl del campo password
   */
  get password() { 
    return this.loginForm.get('password')!; 
  }

  /**
   * Inicializa la autenticación con Google
   * Configura el cliente y renderiza el botón
   */
  private initializeGoogleAuth(): void {
    try {
      this.googleAuthService.initializeGoogleSignIn(this.GOOGLE_CLIENT_ID);
      this.setupGoogleTokenSubscription();
      this.scheduleGoogleButtonRender();
    } catch (error) {
      this.handleGoogleAuthError(error);
    }
  }

  /**
   * Configura la suscripción para recibir tokens de Google
   */
  private setupGoogleTokenSubscription(): void {
    this.googleTokenSubscription = this.googleAuthService.googleToken$.subscribe({
      next: (token: string | null) => {
        if (token) {
          this.handleGoogleToken(token);
        }
      },
      error: (error) => {
        console.error('Error en suscripción Google:', error);
        this.googleAuthAvailable = false;
      }
    });
  }

  /**
   * Programa la renderización del botón de Google
   */
  private scheduleGoogleButtonRender(): void {
    setTimeout(() => {
      this.renderGoogleButton();
    }, 1000);
  }

  /**
   * Renderiza el botón de autenticación con Google
   */
  private renderGoogleButton(): void {
    try {
      this.googleAuthService.renderButton('googleSignInButton');
    } catch (error) {
      this.handleGoogleRenderError(error);
    }
  }

  /**
   * Maneja errores de autenticación con Google
   * @param error Error ocurrido durante la inicialización
   */
  private handleGoogleAuthError(error: any): void {
    console.error('Error inicializando Google Auth:', error);
    this.googleAuthAvailable = false;
  }

  /**
   * Maneja errores de renderizado del botón de Google
   * @param error Error ocurrido durante el renderizado
   */
  private handleGoogleRenderError(error: any): void {
    console.error('Error renderizando botón Google:', error);
    this.googleAuthAvailable = false;
  }

  /**
   * Ejecuta el proceso de login tradicional
   * Valida el formulario y realiza la autenticación
   */
  login(): void {
    if (this.loginForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.prepareLogin();
    this.executeTraditionalLogin();
  }

  /**
   * Prepara el estado para un nuevo intento de login
   */
  private prepareLogin(): void {
    this.isLoading = true;
    this.errorMsg = '';
  }

  /**
   * Ejecuta el login tradicional con email y password
   */
  private executeTraditionalLogin(): void {
    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        this.handleLoginResponse(response);
      },
      error: (error: any) => {
        this.handleLoginError(error);
      }
    });
  }

  /**
   * Marca todos los campos del formulario como touched
   * Para mostrar errores de validación
   */
  private markFormAsTouched(): void {
    this.loginForm.markAllAsTouched();
  }

  /**
   * Procesa la respuesta del servidor después del login
   * @param response Respuesta del servidor de autenticación
   */
  private handleLoginResponse(response: any): void {
    this.isLoading = false;

    if (response?.requires2FA || response?.twoFactorRequired) {
      this.handleTwoFactorAuth();
    } else {
      this.handleSuccessfulLogin(response);
    }
  }

  /**
   * Maneja el flujo de autenticación en dos factores
   */
  private handleTwoFactorAuth(): void {
    sessionStorage.setItem('temp_email', this.loginForm.value.email);
    
    Swal.fire({
      icon: 'info',
      title: 'Verificación en dos pasos',
      text: 'Se ha enviado un código de verificación a tu correo electrónico.',
      confirmButtonText: 'Continuar'
    }).then(() => {
      this.router.navigate(['/two-factor']);
    });
  }

  /**
   * Maneja el login exitoso
   * @param response Respuesta del servidor con datos de usuario
   */
  private handleSuccessfulLogin(response: any): void {
    const successMessage = response?.mensaje || response?.message || 'Inicio de sesión exitoso';
    
    Swal.fire({
      icon: 'success',
      title: successMessage,
      timer: 1200,
      showConfirmButton: false
    }).then(() => {
      window.location.href = this.currentOrigin + '/home';
    });
  }

  /**
   * Maneja errores durante el login tradicional
   * @param error Error devuelto por el servidor
   */
  private handleLoginError(error: any): void {
    this.isLoading = false;
    this.errorMsg = error.error?.mensaje || error.error?.message || 'Credenciales incorrectas';
    
    Swal.fire({
      icon: 'error',
      title: 'Error de autenticación',
      text: this.errorMsg,
      confirmButtonText: 'Entendido'
    });
  }

  /**
   * Inicia el proceso de autenticación con Google
   */
  iniciarSesionConGoogle(): void {
    if (!this.googleAuthAvailable) {
      this.showErrorMessage('La autenticación con Google no está disponible en este momento');
      return;
    }

    this.prepareGoogleLogin();
    this.executeGoogleLogin();
  }

  /**
   * Prepara el estado para login con Google
   */
  private prepareGoogleLogin(): void {
    this.isLoading = true;
    this.errorMsg = '';
  }

  /**
   * Ejecuta el proceso de login con Google
   */
  private executeGoogleLogin(): void {
    try {
      this.googleAuthService.loginWithGoogle();
    } catch (error) {
      this.handleGoogleLoginInitError(error);
    }
  }

  /**
   * Maneja el token recibido de Google
   * @param token Token de autenticación de Google
   */
  private handleGoogleToken(token: string): void {
    this.authService.loginWithGoogle({ idToken: token }).subscribe({
      next: (response: any) => {
        this.handleGoogleLoginSuccess(response);
      },
      error: (error: any) => {
        this.handleGoogleLoginError(error);
      }
    });
  }

  /**
   * Maneja el login exitoso con Google
   * @param response Respuesta del servidor
   */
  private handleGoogleLoginSuccess(response: any): void {
    this.isLoading = false;
    
    Swal.fire({
      icon: 'success',
      title: 'Inicio de sesión con Google exitoso',
      timer: 1200,
      showConfirmButton: false
    }).then(() => {
      window.location.href = this.currentOrigin + '/home';
    });
  }

  /**
   * Maneja errores durante el login con Google
   * @param error Error devuelto por el servidor
   */
  private handleGoogleLoginError(error: any): void {
    this.isLoading = false;
    this.errorMsg = error.error?.mensaje || error.error?.message || 'Error al iniciar sesión con Google';
    
    Swal.fire({
      icon: 'error',
      title: 'Error de autenticación',
      text: this.errorMsg,
      confirmButtonText: 'Entendido'
    });
  }

  /**
   * Maneja errores al iniciar el proceso de Google
   * @param error Error ocurrido durante la inicialización
   */
  private handleGoogleLoginInitError(error: any): void {
    this.isLoading = false;
    console.error('Error iniciando sesión con Google:', error);
    this.showErrorMessage('Error al iniciar el proceso de autenticación con Google');
  }

  /**
   * Muestra un mensaje de error al usuario
   * @param message Mensaje de error a mostrar
   */
  private showErrorMessage(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'Entendido'
    });
  }

  /**
   * Limpia la suscripción a tokens de Google
   */
  private cleanupGoogleSubscription(): void {
    if (this.googleTokenSubscription) {
      this.googleTokenSubscription.unsubscribe();
    }
  }
}