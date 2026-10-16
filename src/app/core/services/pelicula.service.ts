import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { Pelicula, CreatePeliculaDto, UpdatePeliculaDto } from '../models';

/**
 * Servicio de acceso a datos para la entidad Pelicula.
 *
 * ALTA COHESIÓN: solo opera sobre películas.
 * BAJO ACOPLAMIENTO: no conoce componentes ni otros servicios.
 *
 * providedIn: 'root' → singleton automático, sin necesidad de declararlo en ningún módulo.
 */
@Injectable({ providedIn: 'root' })
export class PeliculaService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.peliculas;

  /** Obtiene todas las películas */
  getAll(): Observable<Pelicula[]> {
    return this.http.get<Pelicula[]>(this.ep.getAll);
  }

  /** Obtiene una película por ID */
  getById(id: string): Observable<Pelicula> {
    return this.http.get<Pelicula>(this.ep.getById(id));
  }

  /** Crea una nueva película */
  create(dto: CreatePeliculaDto): Observable<Pelicula> {
    return this.http.post<Pelicula>(this.ep.create, dto);
  }

  /** Actualiza una película existente */
  update(id: string, dto: UpdatePeliculaDto): Observable<Pelicula> {
    return this.http.patch<Pelicula>(this.ep.update(id), dto);
  }

  /** Elimina una película */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.ep.delete(id));
  }
}
