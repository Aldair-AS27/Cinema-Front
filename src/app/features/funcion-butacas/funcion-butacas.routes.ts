import { Routes } from '@angular/router';

export const FUNCION_BUTACAS_ROUTES: Routes = [
  {
    path: ':funcionId',
    loadComponent: () =>
      import('./pages/seat-map/seat-map.component').then(
        (m) => m.SeatMapComponent
      ),
  },
];
