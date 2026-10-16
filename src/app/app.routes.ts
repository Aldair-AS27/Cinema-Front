import { Routes } from '@angular/router';

/**
 * Rutas raíz de la aplicación CinePolis.
 *
 * LAZY LOADING por feature: cada sección carga su código solo cuando se navega a ella.
 * Esto mantiene el bundle inicial pequeño y cada feature independiente.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'peliculas',
    pathMatch: 'full',
  },
  {
    path: 'peliculas',
    loadChildren: () =>
      import('./features/peliculas/peliculas.routes').then((m) => m.PELICULAS_ROUTES),
  },
  {
    path: 'salas',
    loadChildren: () =>
      import('./features/salas/salas.routes').then((m) => m.SALAS_ROUTES),
  },
  {
    path: 'butacas',
    loadChildren: () =>
      import('./features/butacas/butacas.routes').then((m) => m.BUTACAS_ROUTES),
  },
  {
    path: 'funciones',
    loadChildren: () =>
      import('./features/funciones/funciones.routes').then((m) => m.FUNCIONES_ROUTES),
  },
  {
    path: 'funcion-butacas',
    loadChildren: () =>
      import('./features/funcion-butacas/funcion-butacas.routes').then(
        (m) => m.FUNCION_BUTACAS_ROUTES
      ),
  },
  {
    path: '**',
    redirectTo: 'peliculas',
  },
];
