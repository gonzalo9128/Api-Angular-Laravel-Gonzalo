import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // 👈 IMPORTANTE
import { routes } from './app.routes';
import { AuthInterceptor } from './auth/auth-interceptor'; // 👈 Tu interceptor corregido

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Registramos HttpClient y le decimos que use tu interceptor
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    )
  ]
};
