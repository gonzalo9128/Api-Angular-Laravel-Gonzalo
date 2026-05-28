import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Verificamos si está autenticado y si el rol del usuario actual es 'admin'
  const user = auth.currentUser();
  if (auth.isAuthenticated() && user && user.role === 'admin') {
    return true;
  }

  console.warn('Acceso denegado: El usuario no es administrador. Redirigiendo...');
  router.navigate(['/']);
  return false;
};
