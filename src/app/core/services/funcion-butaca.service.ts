import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { FuncionButaca, CreateFuncionButacaDto, UpdateFuncionButacaDto, EstadoButaca } from '../models';

@Injectable({ providedIn: 'root' })
export class FuncionButacaService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.funcionButaca;

  getAll(): Observable<FuncionButaca[]> {
    return this.http.get<any>(this.ep.getAll).pipe(
      map((res) => this.extractList(res).map(this.adaptFuncionButaca))
    );
  }

  getById(id: string | number): Observable<FuncionButaca> {
    return this.http.get<any>(this.ep.getById(id)).pipe(
      map((res) => this.adaptFuncionButaca(res?.data ?? res))
    );
  }

  /**
   * Obtiene el mapa en tiempo real de butacas para una función (RF04/RF05).
   * Llama a: GET /api/funciones/{idFuncion}/butacas
   */
  getByFuncion(funcionId: string | number): Observable<FuncionButaca[]> {
    return this.http.get<any>(this.ep.getByFuncion(funcionId)).pipe(
      map((res) => this.extractList(res).map(this.adaptFuncionButaca))
    );
  }

  /** Bloquear butacas por 5 minutos (RF05) */
  bloquearButacas(idFuncion: number | string, butacaIds: (number | string)[], clienteIdentificador?: string): Observable<any> {
    const payload = {
      idFuncion: Number(idFuncion),
      butacaIds: butacaIds.map(Number),
      clienteIdentificador: clienteIdentificador ?? `web-${Date.now()}`
    };
    return this.http.post<any>(this.ep.create, payload);
  }

  create(dto: CreateFuncionButacaDto): Observable<FuncionButaca> {
    return this.http.post<any>(this.ep.create, dto).pipe(
      map((res) => this.adaptFuncionButaca(res?.data ?? res))
    );
  }

  update(id: string | number, dto: UpdateFuncionButacaDto): Observable<FuncionButaca> {
    return this.http.patch<any>(this.ep.update(id), dto).pipe(
      map((res) => this.adaptFuncionButaca(res?.data ?? res))
    );
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(this.ep.delete(id));
  }

  private extractList(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  private adaptFuncionButaca(raw: any): FuncionButaca {
    let estado: EstadoButaca = 'disponible';
    const rawEstado = (raw.estadoDisponibilidad ?? raw.estado ?? '').toLowerCase();
    if (rawEstado.includes('bloque') || rawEstado.includes('lock')) {
      estado = 'bloqueada';
    } else if (rawEstado.includes('ocupad') || rawEstado.includes('compr') || rawEstado.includes('vend')) {
      estado = 'ocupada';
    } else if (rawEstado.includes('reserv')) {
      estado = 'reservada';
    }

    return {
      id: String(raw.id ?? raw.idFuncionButaca ?? raw.idButaca ?? ''),
      idFuncionButaca: raw.idFuncionButaca ?? (raw.id ? Number(raw.id) : undefined),
      funcion_id: String(raw.funcion_id ?? raw.idFuncion ?? ''),
      idFuncion: raw.idFuncion ?? (raw.funcion_id ? Number(raw.funcion_id) : undefined),
      butaca_id: String(raw.butaca_id ?? raw.idButaca ?? ''),
      idButaca: raw.idButaca ?? (raw.butaca_id ? Number(raw.butaca_id) : undefined),
      estado: estado,
      estadoDisponibilidad: raw.estadoDisponibilidad ?? estado.toUpperCase(),
      precio: raw.precio,
      bloqueadoHasta: raw.bloqueadoHasta,
      created_at: raw.created_at,
      butaca: {
        fila: raw.butaca?.fila ?? raw.fila ?? 'A',
        numero: raw.butaca?.numero ?? raw.numero ?? 1,
        tipo: (raw.butaca?.tipo ?? raw.tipoButaca ?? 'regular').toLowerCase()
      }
    };
  }
}
