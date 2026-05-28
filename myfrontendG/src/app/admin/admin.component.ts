import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from './admin.service';
import { PetitionService } from '../petition.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private petitionService = inject(PetitionService);
  private router = inject(Router);

  seccion = signal<'petitions' | 'categories' | 'users'>('petitions');
  loading = signal<boolean>(true);

  petitions = signal<any[]>([]);
  categories = signal<any[]>([]);
  users = signal<any[]>([]);

  // Form helpers
  newCategoryName = signal<string>('');
  editingCategoryId = signal<number | null>(null);
  editingCategoryName = signal<string>('');

  ngOnInit() {
    this.cargarDatos();
  }

  cambiarSeccion(nueva: 'petitions' | 'categories' | 'users') {
    this.seccion.set(nueva);
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    const sec = this.seccion();

    if (sec === 'petitions') {
      this.adminService.getPetitions().subscribe({
        next: (res) => {
          this.petitions.set(res.data || res);
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        }
      });
    } else if (sec === 'categories') {
      this.adminService.getCategories().subscribe({
        next: (res) => {
          this.categories.set(res.data || res);
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        }
      });
    } else if (sec === 'users') {
      this.adminService.getUsers().subscribe({
        next: (res) => {
          this.users.set(res.data || res);
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        }
      });
    }
  }

  // ==========================================
  // MÉTODOS DE PETICIONES
  // ==========================================

  editarPeticion(id: number) {
    this.router.navigate(['/peticiones/edit', id]);
  }

  borrarPeticion(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta petición de forma permanente como administrador?')) {
      this.petitionService.delete(id).subscribe({
        next: () => {
          alert('Petición eliminada con éxito.');
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          alert('Error al intentar eliminar la petición.');
        }
      });
    }
  }

  // ==========================================
  // MÉTODOS DE CATEGORÍAS
  // ==========================================

  crearCategoria() {
    const name = this.newCategoryName().trim();
    if (!name) return;

    this.adminService.createCategory(name).subscribe({
      next: () => {
        this.newCategoryName.set('');
        alert('Categoría creada con éxito.');
        this.cargarDatos();
      },
      error: (err) => {
        console.error(err);
        alert('Error al crear la categoría (puede que ya exista).');
      }
    });
  }

  iniciarEdicionCategoria(cat: any) {
    this.editingCategoryId.set(cat.id);
    this.editingCategoryName.set(cat.name);
  }

  cancelarEdicionCategoria() {
    this.editingCategoryId.set(null);
    this.editingCategoryName.set('');
  }

  guardarCategoria(id: number) {
    const name = this.editingCategoryName().trim();
    if (!name) return;

    this.adminService.updateCategory(id, name).subscribe({
      next: () => {
        this.cancelarEdicionCategoria();
        alert('Categoría actualizada con éxito.');
        this.cargarDatos();
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar la categoría.');
      }
    });
  }

  borrarCategoria(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría? Peticiones asociadas podrían verse afectadas.')) {
      this.adminService.deleteCategory(id).subscribe({
        next: () => {
          alert('Categoría eliminada con éxito.');
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          alert('Error al intentar eliminar la categoría.');
        }
      });
    }
  }

  // ==========================================
  // MÉTODOS DE USUARIOS
  // ==========================================

  cambiarRol(user: any) {
    const nuevoRol = user.role === 'admin' ? 'user' : 'admin';
    if (confirm(`¿Estás seguro de que deseas cambiar el rol de ${user.name} a ${nuevoRol.toUpperCase()}?`)) {
      this.adminService.changeUserRole(user.id, nuevoRol).subscribe({
        next: () => {
          alert('Rol cambiado con éxito.');
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Error al intentar cambiar el rol.');
        }
      });
    }
  }

  borrarUsuario(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar permanentemente a este usuario? Esto no se puede deshacer.')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          alert('Usuario eliminado con éxito.');
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Error al intentar eliminar el usuario.');
        }
      });
    }
  }
}
