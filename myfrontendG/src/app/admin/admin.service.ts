import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8000/api/admin';

  // ==========================================
  // USUARIOS
  // ==========================================

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.api}/users`);
  }

  changeUserRole(id: number, role: string): Observable<any> {
    return this.http.put<any>(`${this.api}/users/${id}/role`, { role });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/users/${id}`);
  }

  // ==========================================
  // CATEGORÍAS
  // ==========================================

  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.api}/categories`);
  }

  createCategory(name: string): Observable<any> {
    return this.http.post<any>(`${this.api}/categories`, { name });
  }

  updateCategory(id: number, name: string): Observable<any> {
    return this.http.put<any>(`${this.api}/categories/${id}`, { name });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/categories/${id}`);
  }

  // ==========================================
  // PETICIONES
  // ==========================================

  getPetitions(): Observable<any> {
    return this.http.get<any>(`${this.api}/petitions`);
  }
}
