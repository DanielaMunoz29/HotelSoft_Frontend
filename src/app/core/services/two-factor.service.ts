// src/app/core/services/two-factor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface TwoFactorVerifyPayload {
  email: string;
  code: string;
}

export interface TwoFactorResponse {
  token: string;
  message?: string;
}

export interface TwoFactorEnablePayload {
  enable: boolean;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  qrCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TwoFactorService {
  private readonly API_BASE_URL = 'https://hotelsoftback-1495464507.northamerica-northeast1.run.app';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Verifica el código de autenticación de dos factores.
   * @param email Email del usuario.
   * @param code Código de 6 dígitos generado por la app de autenticación.
   */
  verifyTwoFactorCode(email: string, code: string): Observable<TwoFactorResponse> {
    const payload: TwoFactorVerifyPayload = { email, code };
    return this.http.post<TwoFactorResponse>(
      `${this.API_BASE_URL}/api/auth/verify-2fa`, 
      payload
    ).pipe(
      tap((res: TwoFactorResponse) => {
        if (res && res.token) {
          this.authService.saveToken(res.token);
        }
      })
    );
  }

  /**
   * Habilita o deshabilita el 2FA para el usuario actual.
   * @param enable true para habilitar, false para deshabilitar.
   */
  toggleTwoFactor(enable: boolean): Observable<TwoFactorStatusResponse> {
    const payload: TwoFactorEnablePayload = { enable };
    const token = this.authService.getToken();
    
    return this.http.post<TwoFactorStatusResponse>(
      `${this.API_BASE_URL}/api/auth/toggle-2fa`, 
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }

  /**
   * Obtiene el estado actual del 2FA del usuario.
   */
  getTwoFactorStatus(): Observable<TwoFactorStatusResponse> {
    const token = this.authService.getToken();
    
    return this.http.get<TwoFactorStatusResponse>(
      `${this.API_BASE_URL}/api/auth/2fa-status`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }
}