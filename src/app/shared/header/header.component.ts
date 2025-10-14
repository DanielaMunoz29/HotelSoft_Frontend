
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  isLoggedIn: boolean = false;
  
  private authSubscription!: Subscription;
  private userSubscription!: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Sincronizar estado inicial inmediatamente
    this.updateAuthState();

    // Suscribirse a cambios de autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
        console.log('Estado de autenticación cambiado:', isAuthenticated);
      }
    );

    // Suscribirse a cambios de datos de usuario
    this.userSubscription = this.authService.userData$.subscribe(
      (userData) => {
        this.currentUser = userData;
        console.log('Datos de usuario actualizados:', userData);
      }
    );
  }

  private updateAuthState(): void {
    this.authService.updateAuthState();
    this.isLoggedIn = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
  }

  getUserDisplayName(): string {
    if (!this.currentUser) {
      return 'Usuario';
    }

    // Priorizar nombre completo, luego nombre, luego email
    if (this.currentUser.nombreCompleto) {
      const nombres = this.currentUser.nombreCompleto.split(' ');
      return nombres[0]; // Retorna solo el primer nombre
    }
    
    if (this.currentUser.nombre) {
      const nombres = this.currentUser.nombre.split(' ');
      return nombres[0];
    }
    
    if (this.currentUser.email) {
      return this.currentUser.email.split('@')[0];
    }
    
    return 'Usuario';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}