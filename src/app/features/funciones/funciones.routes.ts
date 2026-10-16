import { Routes } from '@angular/router';

export const FUNCIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/funcion-list/funcion-list.component').then((m) => m.FuncionListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./pages/funcion-form/funcion-form.component').then((m) => m.FuncionFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/funcion-detail/funcion-detail.component').then((m) => m.FuncionDetailComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/funcion-form/funcion-form.component').then((m) => m.FuncionFormComponent),
  },
];
