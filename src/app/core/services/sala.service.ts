import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { Sala, CreateSalaDto, UpdateSalaDto } from '../models';

/**
 * Servicio de acceso a datos para la entidad Sala.
 */
@Injectable({ providedIn: 'root' })
export class SalaService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.salas;

  getAll(): Observable<Sala[]> {
    return this.http.get<Sala[]>(this.ep.getAll);
  }

  getById(id: string): Observable<Sala> {
    return this.http.get<Sala>(this.ep.getById(id));
  }

  create(dto: CreateSalaDto): Observable<Sala> {
    return this.http.post<Sala>(this.ep.create, dto);
  }

  update(id: string, dto: UpdateSalaDto): Observable<Sala> {
    return this.http.patch<Sala>(this.ep.update(id), dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.ep.delete(id));
  }
}
