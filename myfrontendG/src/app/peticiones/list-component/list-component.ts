import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-list-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-component.html',
  styleUrl: './list-component.css'
})
export class ListComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  peticiones: any[] = [];
  cargando = true;

  // 🌟 ESTA ES LA LÍNEA QUE BUSCABA EL HTML
  public currentUser = this.authService.currentUser;

  ngOnInit() {
    this.cargarPeticiones();
    // 🗑️ Hemos borrado la captura manual del ID, ¡la Signal ya hace el trabajo!
  }

  // Función para sacar la foto real de cada petición
  getImagenUrl(peticion: any): string {
    if (peticion && peticion.files && peticion.files.length > 0) {
      return `http://127.0.0.1:8000/storage/${peticion.files[0].file_path}`;
    }
    return '';
  }

  cargarPeticiones() {
    this.http.get<any>('http://localhost:8000/api/petitions').subscribe({
      next: (res) => {
        this.peticiones = res.data || res;
        this.cargando = false;
        console.log('Peticiones recibidas:', this.peticiones);
      },
      error: (err) => {
        console.error('Error al cargar:', err);
        this.cargando = false;
      }
    });
  }

  borrarPeticion(id: number) {
    if (confirm('¿Estás seguro de que quieres borrar esta petición? No hay vuelta atrás.')) {
      console.log('Borrando la petición ID:', id);
      // Aquí pondremos la llamada a la API de borrar más adelante
    }
  }
}
