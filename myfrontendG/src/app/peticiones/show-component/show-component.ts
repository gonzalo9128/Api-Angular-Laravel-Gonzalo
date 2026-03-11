import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// ¡OJO AQUÍ! Si te sigue dando error esta línea, mira en tu carpeta a la izquierda
// y asegúrate de cómo se llama EXACTAMENTE el archivo (si lleva mayúscula o minúscula)
import { PetitionService } from '../../petition.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-show',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './show-component.html'
})
export class ShowComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // FÍJATE BIEN: variable en minúscula, clase en mayúscula
  private petitionService = inject(PetitionService);
  private authService = inject(AuthService);

  // ¡ESTAS LÍNEAS SON VITALES para que el HTML funcione!
  public petition = signal<any>(null);
  public loading = signal<boolean>(true);

  // 1. Mantenemos la conexión viva con el servicio
  public currentUser = this.authService.currentUser;

  ngOnInit() {
    // 🗑️ ¡Hemos borrado las dos líneas problemáticas!

    // 2. Solo dejamos la parte que carga la petición de la URL
    this.route.paramMap.subscribe((params: any) => {
      const id = Number(params.get('id'));
      if (id) {
        this.cargarPetition(id);
      }
    });
  }

  cargarPetition(id: number) {
    this.loading.set(true);
    // Usamos la variable con minúscula
    this.petitionService.getById(id).subscribe({
      next: (data: any) => { // <-- TypeScript estricto solucionado con ": any"
        this.petition.set(data);
        this.loading.set(false);
      },
      error: (err: any) => { // <-- TypeScript estricto solucionado con ": any"
        console.error('Error al cargar la petición', err);
        this.petition.set(null);
        this.loading.set(false);
      }
    });
  }

  getImagenUrl(): string {
    const pet = this.petition();
    // Comprobamos si existe "files" y si tiene al menos una foto dentro
    if (pet && pet.files && pet.files.length > 0) {
      // Sacamos el file_path de la primera foto [0]
      return `http://127.0.0.1:8000/storage/${pet.files[0].file_path}`;
    }
    return 'https://via.placeholder.com/800x400?text=Sin+Imagen';
  }

  firmar(): void {
    const id = this.petition()?.id;
    if (!id) return;

    this.petitionService.firmar(id).subscribe({
      next: (res: any) => {
        alert('¡Gracias por firmar y unirte a la causa!');
        this.cargarPetition(id);
      },
      error: (err: any) => {
        alert('Ya has firmado esta petición o necesitas iniciar sesión primero.');
      }
    });
  }

  delete(): void {
    const id = this.petition()?.id;
    if (!id) return;

    const confirmar = confirm('¿Estás seguro de que quieres borrar esta petición? Esta acción es irreversible.');

    if (confirmar) {
      this.petitionService.delete(id).subscribe({
        next: (res: any) => {
          alert('Petición borrada correctamente.');
          this.router.navigate(['/peticiones']);
        },
        error: (err: any) => {
          console.error(err);
          alert('Hubo un error al intentar borrar la petición.');
        }
      });
    }
  }
}
