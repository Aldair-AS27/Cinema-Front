import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { ReservaRequest, ReservaResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.reservas;

  /** Procesa la reserva con pago atómico y generación de QR (RF07/RF08) */
  procesarReserva(payload: ReservaRequest): Observable<ReservaResponse> {
    return this.http.post<any>(this.ep.create, payload).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /** Consulta reserva por código único */
  getByCodigo(codigo: string): Observable<ReservaResponse> {
    return this.http.get<any>(this.ep.getByCodigo(codigo)).pipe(
      map((res) => res?.data ?? res)
    );
  }
}
