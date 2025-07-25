import { Routes } from '@angular/router';
// 1. Importación CORREGIDA: Usamos el nombre de archivo correcto 'auth.guard'.
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // --- Rutas Públicas (cualquiera puede acceder) ---
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'simulator',
    // 2. Componente CORREGIDO: Ahora carga SimulatorComponent, no RegisterComponent.
    loadComponent: () => import('./simulator/simulator/simulator.component').then(m => m.SimulatorComponent)
  },
  
  // --- Rutas Protegidas ---
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
    // La aplicación del guard aquí es correcta.
    canActivate: [authGuard]
  },
  
  // Esta ruta es para cargar un árbol específico en el simulador.
  // Sin embargo, en nuestro diseño actual, el simulador lee un 'queryParam' (?loadTree=123),
  // no un parámetro de ruta como '/trees/123'.
  // Podemos eliminar esta ruta para evitar duplicados, ya que la ruta '/simulator'
  // ya maneja la carga de árboles. Si la mantienes, asegúrate de tener una razón específica para ello.
  // Por ahora, la comentaré para simplificar.
  /* 
  {
    path: 'trees/:id',
    loadComponent: () => import('./simulator/simulator/simulator.component').then(m => m.SimulatorComponent),
    canActivate: [authGuard]
  },
  */

  // --- Redirecciones ---
  // Si el usuario va a la raíz del sitio, lo redirigimos a /simulator.
  { path: '', redirectTo: '/simulator', pathMatch: 'full' },
  
  // Si el usuario va a cualquier otra ruta que no exista, lo redirigimos a /simulator.
  { path: '**', redirectTo: '/simulator' }
];
