import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { FuncionButaca, CreateFuncionButacaDto, UpdateFuncionButacaDto } from '../models';

/**
 * Servicio de acceso a datos para FuncionButaca (mapa de asientos por función).
 */
@Injectable({ providedIn: 'root' })
export class FuncionButacaService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.funcionButaca;

  getAll(): Observable<FuncionButaca[]> {
    return this.http.get<FuncionButaca[]>(this.ep.getAll);
  }

  getById(id: string): Observable<FuncionButaca> {
    return this.http.get<FuncionButaca>(this.ep.getById(id));
  }

  /**
   * Obtiene el mapa completo de asientos para una función.
   * Es la consulta más crítica: alimenta el selector visual de butacas.
   */
  getByFuncion(funcionId: string): Observable<FuncionButaca[]> {
    return this.http.get<FuncionButaca[]>(this.ep.getByFuncion(funcionId));
  }

  /** Reserva / ocupa una butaca en una función */
  create(dto: CreateFuncionButacaDto): Observable<FuncionButaca> {
    return this.http.post<FuncionButaca>(this.ep.create, dto);
  }

  /** Actualiza el estado de una butaca (ej: disponible → reservada → ocupada) */
  update(id: string, dto: UpdateFuncionButacaDto): Observable<FuncionButaca> {
    return this.http.patch<FuncionButaca>(this.ep.update(id), dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.ep.delete(id));
  }
}
