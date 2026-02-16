import {Component, inject, OnInit} from '@angular/core';
import {PetitionService} from '../petition.service';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Petition} from '../models/petition';
import {AuthService} from '../auth/auth.service';

@Component({
  selector: 'app-list-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-component.html',
  styleUrl: './list-component.css',
})
export class ListComponent implements OnInit {
  // Usamos minúscula para la variable del servicio
  private petitionService = inject(PetitionService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  public petitions: Petition[] = [];
  public cargando: boolean = true;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const busqueda = params['q'];
      this.cargando = true;

      // Llama al método EXACTAMENTE como se llame en tu service
      this.petitionService.fetchPetitions().subscribe({
        next: (data: any) => {
          if (busqueda) {
            this.petitions = data.filter((p: any) =>
              p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
              p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
            );
          } else {
            this.petitions = data;
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar peticiones:', err);
          this.cargando = false;
        }
      });
    });
  }

  delete(id: number | undefined) {
    if (!id) return;

    if (confirm('¿Seguro?')) {
      // Aquí usábamos PetitionService con Mayúscula y era un error
      this.petitionService.delete(id).subscribe({
        next: () => {
          this.petitions = this.petitions.filter(p => p.id !== id);
        },
        error: (err) => {
          alert('No puedes borrar esto (quizás no eres el dueño)');
        }
      });
    }
  }
}
