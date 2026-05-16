import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-list-component',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list-component.html',
  styleUrl: './list-component.css'
})
export class ListComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  peticiones = signal<any[]>([]);
  cargando = signal(true);

  categorias = signal<any[]>([]);
  
  // Filtros
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('');
  selectedState = signal<string>('');

  // Paginación
  paginaActual = signal<number>(1);
  itemsPorPagina = signal<number>(6);

  // 🌟 ESTA ES LA LÍNEA QUE BUSCABA EL HTML
  public currentUser = this.authService.currentUser;

  // Señales Computadas Reactivas
  peticionesFiltradas = computed(() => {
    let result = this.peticiones();
    const search = this.searchTerm().toLowerCase();
    const cat = this.selectedCategory();
    const state = this.selectedState();
    const user = this.currentUser();

    if (search) {
      result = result.filter(p => p.title?.toLowerCase().includes(search) || p.description?.toLowerCase().includes(search));
    }

    if (cat) {
      result = result.filter(p => p.category_id === Number(cat));
    }

    if (state === 'firmadas' && user) {
      result = result.filter(p => p.firmas && p.firmas.some((f: any) => f.id === user.id));
    } else if (state === 'nofirmadas' && user) {
      result = result.filter(p => !(p.firmas && p.firmas.some((f: any) => f.id === user.id)));
    } else if (state === 'mias' && user) {
      result = result.filter(p => p.user_id === user.id);
    }

    return result;
  });

  totalPaginas = computed(() => {
    return Math.max(1, Math.ceil(this.peticionesFiltradas().length / this.itemsPorPagina()));
  });

  peticionesPaginadas = computed(() => {
    const start = (this.paginaActual() - 1) * this.itemsPorPagina();
    return this.peticionesFiltradas().slice(start, start + this.itemsPorPagina());
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['filter']) {
        this.selectedState.set(params['filter']);
      }
    });
    this.cargarPeticiones();
  }

  getFileUrl(file: any): string {
    if (file && file.file_path) {
      return `http://127.0.0.1:8000/storage/${file.file_path}`;
    }
    return '';
  }

  getImagenUrl(peticion: any): string {
    if (peticion.files && peticion.files.length > 0) {
      const lastFile = peticion.files[peticion.files.length - 1];
      return `http://127.0.0.1:8000/storage/${lastFile.file_path}`;
    }
    return 'https://picsum.photos/seed/' + peticion.id + '/400/250';
  }

  cargarPeticiones() {
    this.http.get<any>('http://localhost:8000/api/petitions').subscribe({
      next: (res) => {
        const data = res.data || res;
        this.peticiones.set(data);
        
        const uniqueCat = new Map();
        data.forEach((p: any) => {
          if (p.category) uniqueCat.set(p.category.id, p.category);
        });
        this.categorias.set(Array.from(uniqueCat.values()));

        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar:', err);
        this.cargando.set(false);
      }
    });
  }

  borrarPeticion(id: number) {
    if (confirm('¿Estás seguro de que quieres borrar esta petición? No hay vuelta atrás.')) {
      console.log('Borrando la petición ID:', id);
    }
  }

  actualizarFiltro(tipo: string, valor: string) {
    if (tipo === 'search') this.searchTerm.set(valor);
    if (tipo === 'category') this.selectedCategory.set(valor);
    if (tipo === 'state') this.selectedState.set(valor);
    
    // Al filtrar, volvemos a la página 1
    this.paginaActual.set(1);
  }

  cambiarPagina(page: number) {
    if (page >= 1 && page <= this.totalPaginas()) {
      this.paginaActual.set(page);
    }
  }
}
