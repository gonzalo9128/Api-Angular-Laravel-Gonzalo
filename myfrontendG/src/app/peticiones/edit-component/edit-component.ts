import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PetitionService } from '../../petition.service';
@Component({
  selector: 'app-edit-component',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './edit-component.html',
  styleUrls: ['./edit-component.css']
})
export class EditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private petitionService = inject(PetitionService); // <-- Todo en inglés
  private http = inject(HttpClient);

  readonly API_URL = 'http://localhost:8000/storage/';

  id = signal<number | null>(null);
  loading = signal(false);
  fileToUpload: File | null = null;
  petition: any | null = null; // <-- Variable en inglés
  categorias: any[] = [];

  itemForm: FormGroup = this.fb.group({
    titulo: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    destinatario: ['', [Validators.required]],
    categoria_id: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarCategorias();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(Number(idParam));
      this.cargarDatos(this.id()!);
    }
  }

  cargarCategorias() {
    this.http.get<any>('http://localhost:8000/api/categories').subscribe({
      next: (res) => this.categorias = res.data || res,
      error: (err) => console.error('Error cargando categorías', err)
    });
  }

  cargarDatos(id: number) {
    this.petitionService.getById(id).subscribe({
      next: (res: any) => {
        const data = res.data ? res.data : res;
        this.petition = data; // <-- Asignamos a la variable en inglés

        this.itemForm.patchValue({
          titulo: data.title || data.titulo,
          descripcion: data.description || data.descripcion,
          destinatario: data.destinatary || data.destinatario,
          categoria_id: data.category_id || data.categoria_id
        });
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.fileToUpload = file;
  }

  onSubmit() {
    if (this.itemForm.invalid || !this.id()) return;
    this.loading.set(true);

    const formData = new FormData();
    formData.append('title', this.itemForm.get('titulo')?.value || '');
    formData.append('description', this.itemForm.get('descripcion')?.value || '');
    formData.append('destinatary', this.itemForm.get('destinatario')?.value || '');
    formData.append('category_id', this.itemForm.get('categoria_id')?.value || '');

    if (this.fileToUpload) {
      formData.append('file', this.fileToUpload);
    }

    // El truco que pedía tu PDF para que Laravel acepte archivos al actualizar [cite: 256]
    formData.append('_method', 'PUT');

    this.petitionService.update(this.id()!, formData).subscribe({
      next: () => this.router.navigate(['/peticiones']),
      error: () => this.loading.set(false)
    });
  }

  getImagenUrl(): string {
    if (this.petition && this.petition.files && this.petition.files.length > 0) {
      const cleanPath = this.petition.files[0].file_path.replace('storage/', '');
      return `${this.API_URL}${cleanPath}`;
    }
    return 'assets/no-image.png';
  }
}
