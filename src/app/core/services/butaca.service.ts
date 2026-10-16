import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { Butaca, CreateButacaDto, UpdateButacaDto } from '../models';

/**
 * Servicio de acceso a datos para la entidad Butaca (asiento físico).
 */
@Injectable({ providedIn: 'root' })
export class ButacaService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.butacas;

  getAll(): Observable<Butaca[]> {
    return this.http.get<Butaca[]>(this.ep.getAll);
  }

  getById(id: string): Observable<Butaca> {
    return this.http.get<Butaca>(this.ep.getById(id));
  }

  /** Obtiene todas las butacas de una sala específica */
  getBySala(salaId: string): Observable<Butaca[]> {
    return this.http.get<Butaca[]>(this.ep.getBySala(salaId));
  }

  create(dto: CreateButacaDto): Observable<Butaca> {
    return this.http.post<Butaca>(this.ep.create, dto);
  }

  update(id: string, dto: UpdateButacaDto): Observable<Butaca> {
    return this.http.patch<Butaca>(this.ep.update(id), dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.ep.delete(id));
  }
}
