import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  // Desactivamos toda la seguridad temporalmente
  // const auth = inject(AuthService);
  // const router = inject(Router);
  // if (!auth.isAuthenticated()) { ... }

  console.log('MODO DIOS: El portero deja pasar a todos');
  return true;
};
