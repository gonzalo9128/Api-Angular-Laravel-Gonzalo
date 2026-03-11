import { Routes } from '@angular/router';
import { HomeComponent } from './home/home-component/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProfileComponent } from './pages/profile/profile';
import { ListComponent } from './peticiones/list-component/list-component';
import { ShowComponent } from './peticiones/show-component/show-component';
import { CreateComponent } from './peticiones/create-component/create-component';
import { EditComponent } from './peticiones/edit-component/edit-component';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'peticiones', component: ListComponent },

  // 1️⃣ PRIMERO LA RUTA ESPECÍFICA DE CREAR
  { path: 'peticiones/create', component: CreateComponent, canActivate: [authGuard] },

  // 2️⃣ SEGUNDO LA RUTA DE EDITAR (también es específica)
  { path: 'peticiones/edit/:id', component: EditComponent, canActivate: [authGuard] },

  // 3️⃣ AL FINAL LAS RUTAS DINÁMICAS (el comodín :id)
  { path: 'peticiones/:id', component: ShowComponent },

  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
