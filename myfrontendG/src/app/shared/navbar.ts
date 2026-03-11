import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service'; // Revisa la ruta si te da error

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html' // Asegúrate de que el nombre coincida con tu archivo
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Conectamos las variables del HTML con las "Signals" del AuthService
  public currentUser = this.authService.currentUser;
  public isLoggedIn = this.authService.isLoggedIn;

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Por si acaso falla el backend, limpiamos y echamos al usuario igual
        this.router.navigate(['/login']);
      }
    });
  }
}
