import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, finalize, tap} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export class AuthService {
  private api = 'http://localhost:8000/api';
  private userSubject = new BehaviorSubject<any>(null);
  private router = inject(Router);

  isLoggedIn = signal<boolean>(!!localStorage.getItem('access_token'));
  user$ = this.userSubject.asObservable();

  // Leemos lo que haya en la memoria al arrancar
  currentUser = signal<any>(JSON.parse(localStorage.getItem('user_data') || 'null'));

  constructor(private http: HttpClient) {
    // 🌟 TRUCO 1: Si recargas la página (F5) y tienes token, obligamos a buscar tus datos
    if (this.isAuthenticated()) {
      this.getProfile().subscribe({
        error: () => console.log('Error al recuperar usuario con F5')
      });
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.http
      .post<any>(`${this.api}/login`, credentials)
      .pipe(tap(res => {
        this.storeTokens(res);
        // 🌟 TRUCO 2: Nada más hacer login, OBLIGAMOS a pedir tus datos (Nombre, ID)
        this.getProfile().subscribe();
      }));
  }

  register(data: { name: string; email: string; password: string }) {
    return this.http.post(`${this.api}/register`, data);
  }

  logout() {
    return this.http.post(`${this.api}/logout`, {}).pipe(
      finalize(() => {
        this.limpiarSesionLocal();
        this.router.navigate(['/login']);
      })
    );
  }

  getProfile() {
    // Ojo: si en Laravel tu ruta no es /me sino /user, cámbialo aquí abajo.
    return this.http
      .get<any>(`${this.api}/me`)
      .pipe(tap(res => {
        // Laravel puede devolver los datos sueltos o envueltos en "data"
        const user = res.data || res;

        // ¡Por fin guardamos los datos reales!
        this.userSubject.next(user);
        this.currentUser.set(user);
        localStorage.setItem('user_data', JSON.stringify(user));
      }));
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  private storeTokens(res: any) {
    // Guardamos solo el token. De los datos ya se encarga getProfile()
    const token = res.access_token || res.token;
    if (token) {
      localStorage.setItem('access_token', token);
      this.isLoggedIn.set(true);
    }
  }

  private limpiarSesionLocal() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  refreshToken() {
    return this.http.post<any>(`${this.api}/refresh`, {}).pipe(
      tap(res => {
        const token = res.access_token || res.token;
        if (token) localStorage.setItem('access_token', token);
      })
    );
  }

  loadUserIfNeeded() {
    if (this.isAuthenticated() && !this.userSubject.value) {
      this.getProfile().subscribe({
        error: () => this.limpiarSesionLocal()
      });
    }
  }
}
