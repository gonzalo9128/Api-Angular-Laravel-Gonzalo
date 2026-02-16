import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Petition} from './models/petition'; // [cite: 336]
import {tap, map} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PetitionService {
  private http = inject(HttpClient); // [cite: 340]
  private readonly API_URL = 'http://localhost:8000/api/petitions'; // [cite: 341]

  // --- STATE (SIGNALS) ---
  // Store privado de Petitions [cite: 343-344]
  // @ts-ignore
  #petitions = signal<Petition[]>([]);

  // Signal para gestionar el estado de carga [cite: 345, 347]
  public loading = signal<boolean>(false);

  // --- SELECTORS ---
  // Exponemos las Petitions como solo lectura para los componentes [cite: 349-350]
  public allPetitions = this.#petitions.asReadonly();

  // Obtener todas las Petitions desde Laravel
  fetchPetitions() {
    this.loading.set(true); // [cite: 352]
    return this.http.get<{ data: Petition[] }>(this.API_URL).pipe(
      map(res => res.data || res), // [cite: 354]
      tap(data => {
        this.loading.set(false); // [cite: 356]
        this.#petitions.set(data as Petition[]); // [cite: 357]
      })
    );
  }

  // Obtener una petición por ID [cite: 361]
  getById(id: number) {
    return this.http.get<{ data: Petition }>(`${this.API_URL}/${id}`).pipe(
      map(res => res.data || res) // [cite: 363]
    );
  }

  // Crear una nueva petición usando FormData (archivos binarios) [cite: 366]
  create(formData: FormData) {
    return this.http.post<{ data: Petition }>(this.API_URL, formData).pipe(
      tap(res => {
        const nuevaPetition = res.data || res;
        // Añadimos la nueva al principio de la lista local [cite: 368-369]
        this.#petitions.update(list => [nuevaPetition as Petition, ...list]);
      })
    );
  }

  // Actualizar petición con el truco de '_method: PUT' para Laravel [cite: 373-376]
  update(id: number, formData: FormData) {
    formData.append('_method', 'PUT'); // [cite: 376]
    return this.http.post<{ data: Petition }>(`${this.API_URL}/${id}`, formData).pipe(
      tap(res => {
        const actualizada = res.data || res;
        // Actualizamos solo la modificada en la lista local [cite: 378, 380]
        this.#petitions.update(list =>
          list.map(p => p.id === id ? (actualizada as Petition) : p)
        );
      })
    );
  }

  // Eliminar una petición [cite: 384]
  delete(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        // Filtramos para eliminarla de la señal local [cite: 387-388]
        this.#petitions.update(list => list.filter(p => p.id !== id));
      })
    );
  }

  // Método para firmar una petición [cite: 392]
  firmar(id: number) {
    return this.http.post<{ success: boolean, message: string }>(
      `${this.API_URL}/firmar/${id}`,
      {} // [cite: 396-397]
    );
  }
}
