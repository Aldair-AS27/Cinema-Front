import { Routes } from '@angular/router';

export const PELICULAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/pelicula-list/pelicula-list.component').then((m) => m.PeliculaListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./pages/pelicula-form/pelicula-form.component').then((m) => m.PeliculaFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/pelicula-detail/pelicula-detail.component').then((m) => m.PeliculaDetailComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/pelicula-form/pelicula-form.component').then((m) => m.PeliculaFormComponent),
  },
];
