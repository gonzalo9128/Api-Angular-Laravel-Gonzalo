// 1. Añade OnInit a los imports de arriba
import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-component.html',
  styleUrl: './create-component.css'
})
// 2. Añade "implements OnInit" a la clase
export class CreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  loading = signal(false);
  fileToUpload: File | null = null;

  // 3. Creamos una variable para guardar las categorías que lleguen
  categorias: any[] = [];

  itemForm: FormGroup = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    destinatario: ['', Validators.required],
    categoria_id: ['', Validators.required]
  });

  // 4. Esta función se ejecuta sola al abrir la página
  ngOnInit() {
    this.cargarCategorias();
  }

  // 5. La función que va a Laravel a por los datos
  cargarCategorias() {
    this.http.get<any>('http://localhost:8000/api/categories').subscribe({
      next: (res) => {
        // Laravel suele devolver los datos directos o dentro de res.data
        this.categorias = res.data || res;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (err) => {
        console.error('Error al cargar las categorías:', err);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileToUpload = file;
    }
  }

  onSubmit() {
    if (this.itemForm.invalid || !this.fileToUpload) {
      console.warn('Faltan campos por rellenar o falta la foto');
      return;
    }

    this.loading.set(true);

    const formData = new FormData();
    formData.append('title', this.itemForm.get('titulo')?.value);
    formData.append('description', this.itemForm.get('descripcion')?.value);
    formData.append('category_id', this.itemForm.get('categoria_id')?.value);
    formData.append('destinatary', this.itemForm.get('destinatario')?.value);
    formData.append('file', this.fileToUpload);

    this.http.post('http://localhost:8000/api/petitions', formData).subscribe({
      next: (response) => {
        console.log('¡Petición subida con éxito!', response);
        this.loading.set(false);
        this.router.navigate(['/peticiones']);
      },
      error: (err) => {
        console.error('El backend sigue quejándose:', err);
        this.loading.set(false);
      }
    });
  }
}
