import { Routes } from '@angular/router';

export const SALAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sala-list/sala-list.component').then((m) => m.SalaListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./pages/sala-form/sala-form.component').then((m) => m.SalaFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/sala-detail/sala-detail.component').then((m) => m.SalaDetailComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/sala-form/sala-form.component').then((m) => m.SalaFormComponent),
  },
];
