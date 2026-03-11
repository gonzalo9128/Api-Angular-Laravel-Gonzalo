import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './home.html'
})
export class HomeComponent {
  terminoBusqueda: string = '';
  private router = inject(Router);

  buscar() {
    if (this.terminoBusqueda.trim()) {
      this.router.navigate(['/peticiones'], { queryParams: { q: this.terminoBusqueda } });
    }
  }
}
