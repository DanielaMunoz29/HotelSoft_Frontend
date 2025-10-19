import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.getStoredUserData()?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      router.navigate(['/home']); // o login
      return false;
    }

    return true;
  };
};