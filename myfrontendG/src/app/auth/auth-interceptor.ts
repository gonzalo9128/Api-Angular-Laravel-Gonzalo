import {HttpInterceptorFn, HttpErrorResponse} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth.service'; // Ajusta la ruta si es necesario
import {catchError, switchMap, throwError, of} from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = localStorage.getItem('access_token'); // O auth.getAccessToken()
// 1. Clona la petición y añade el token si existe
  let request = req;
  if (token) {
    request = req.clone({
      setHeaders: {Authorization: `Bearer ${token}`}
    });
  }
  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
// ‐‐‐ CASO CRÍTICO: FALLO EN LOGIN ‐‐‐
// Si estamos intentando entrar y falla, NO hacemos nada raro.
// Simplemente devolvemos el error para que el componente Login lo muestre.
      if (req.url.includes('/login') && err.status === 401) {
        return throwError(() => err);
      }
// ‐‐‐ CASO CRÍTICO: FALLO EN REFRESH ‐‐‐
// Si el intento de refrescar el token falla, es game over.
// Hacemos logout forzoso (limpiar localStorage y redirigir).
      if (req.url.includes('/refresh')) {
        auth.logout(); // Asumo que esto limpia y redirige
        return throwError(() => err);
      }
// ‐‐‐ CASO ESTÁNDAR: ERROR 401 (Token Caducado) ‐‐‐
      if (err.status === 401) {
        return auth.refreshToken().pipe(
          switchMap((res: any) => {
// Guardamos el nuevo token
            localStorage.setItem('access_token', res.access_token);
// Reintentamos la petición original con el nuevo token
            const newReq = req.clone({
              setHeaders: {Authorization: `Bearer ${res.access_token}`}
            });
            return next(newReq);
          }),
          catchError((refreshErr) => {
// Si el refresh falla, cerramos sesión
            auth.logout();

            return throwError(() => refreshErr);
          })
        );
      }
// Cualquier otro error (500, 404, etc), lo dejamos pasar
      return throwError(() => err);
    })
  );
};
