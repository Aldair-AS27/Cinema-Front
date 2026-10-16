import { Routes } from '@angular/router';

export const BUTACAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/butaca-list/butaca-list.component').then(
        (m) => m.ButacaListComponent
      ),
  },
];
