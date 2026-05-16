import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);
  
  activeTab = signal<'peticiones' | 'usuarios' | 'categorias'>('peticiones');
  peticiones = signal<any[]>([]);
  usuarios = signal<any[]>([]);
  categorias = signal<any[]>([]);
  cargando = signal(true);
  
  ngOnInit() {
    this.cargarPeticiones();
    this.cargarUsuarios();
    this.cargarCategorias();
  }

  setTab(tab: 'peticiones' | 'usuarios' | 'categorias') {
    this.activeTab.set(tab);
  }
  
  cargarPeticiones() {
    this.cargando.set(true);
    this.http.get<any>('http://localhost:8000/api/admin/petitions').subscribe({
      next: (res) => {
        this.peticiones.set(res.data || []);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  cargarUsuarios() {
    this.http.get<any>('http://localhost:8000/api/admin/users').subscribe({
      next: (res) => this.usuarios.set(res.data || [])
    });
  }

  cargarCategorias() {
    this.http.get<any>('http://localhost:8000/api/admin/categories').subscribe({
      next: (res) => this.categorias.set(res.data || [])
    });
  }
  
  borrarPeticion(id: number) {
    if (confirm('¿Estás seguro de borrar esta petición?')) {
      this.http.delete(`http://localhost:8000/api/admin/petitions/${id}`).subscribe({
        next: () => this.cargarPeticiones(),
        error: (err) => console.error(err)
      });
    }
  }

  borrarUsuario(id: number) {
    if (confirm('¿Borrar este usuario?')) {
      this.http.delete(`http://localhost:8000/api/admin/users/${id}`).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => alert('Error: ' + (err.error?.message || 'No se pudo borrar'))
      });
    }
  }

  borrarCategoria(id: number) {
    if (confirm('¿Borrar esta categoría?')) {
      this.http.delete(`http://localhost:8000/api/admin/categories/${id}`).subscribe({
        next: () => this.cargarCategorias(),
        error: (err) => console.error(err)
      });
    }
  }

  crearCategoria() {
    const nombre = prompt('Nombre de la nueva categoría:');
    if (nombre) {
      this.http.post(`http://localhost:8000/api/admin/categories`, { name: nombre }).subscribe({
        next: () => this.cargarCategorias(),
        error: (err) => alert('Error al crear categoría')
      });
    }
  }

  editarCategoria(cat: any) {
    const nuevoNombre = prompt('Editar nombre de categoría:', cat.name);
    if (nuevoNombre && nuevoNombre !== cat.name) {
      this.http.put(`http://localhost:8000/api/admin/categories/${cat.id}`, { name: nuevoNombre }).subscribe({
        next: () => this.cargarCategorias(),
        error: (err) => alert('Error al editar categoría')
      });
    }
  }
}
