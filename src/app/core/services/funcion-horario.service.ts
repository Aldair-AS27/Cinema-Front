import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { FuncionHorario, CreateFuncionHorarioDto, UpdateFuncionHorarioDto } from '../models';

/**
 * Servicio de acceso a datos para la entidad FuncionHorario (cartelera).
 */
@Injectable({ providedIn: 'root' })
export class FuncionHorarioService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.funcionHorario;

  getAll(): Observable<FuncionHorario[]> {
    return this.http.get<FuncionHorario[]>(this.ep.getAll);
  }

  getById(id: string): Observable<FuncionHorario> {
    return this.http.get<FuncionHorario>(this.ep.getById(id));
  }

  /** Obtiene las funciones de una película específica */
  getByPelicula(peliculaId: string): Observable<FuncionHorario[]> {
    return this.http.get<FuncionHorario[]>(this.ep.getByPelicula(peliculaId));
  }

  /** Obtiene la cartelera de una fecha específica (formato: 'YYYY-MM-DD') */
  getByFecha(fecha: string): Observable<FuncionHorario[]> {
    return this.http.get<FuncionHorario[]>(this.ep.getByFecha(fecha));
  }

  create(dto: CreateFuncionHorarioDto): Observable<FuncionHorario> {
    return this.http.post<FuncionHorario>(this.ep.create, dto);
  }

  update(id: string, dto: UpdateFuncionHorarioDto): Observable<FuncionHorario> {
    return this.http.patch<FuncionHorario>(this.ep.update(id), dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.ep.delete(id));
  }
}
