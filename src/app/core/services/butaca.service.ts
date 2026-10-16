import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { Butaca, CreateButacaDto, UpdateButacaDto, TipoButaca } from '../models';

@Injectable({ providedIn: 'root' })
export class ButacaService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.butacas;

  getAll(): Observable<Butaca[]> {
    return this.http.get<any>(this.ep.getAll).pipe(
      map((res) => this.extractList(res).map(this.adaptButaca))
    );
  }

  getById(id: string): Observable<Butaca> {
    return this.http.get<any>(this.ep.getById(id)).pipe(
      map((res) => this.adaptButaca(res?.data ?? res))
    );
  }

  getBySala(salaId: string | number): Observable<Butaca[]> {
    return this.http.get<any>(this.ep.getBySala(salaId)).pipe(
      map((res) => this.extractList(res).map(this.adaptButaca))
    );
  }

  create(dto: CreateButacaDto): Observable<Butaca> {
    const payload = {
      fila: dto.fila,
      numero: dto.numero,
      tipoButaca: dto.tipo ? dto.tipo.toUpperCase() : 'REGULAR',
      sala: { idSala: Number(dto.sala_id) }
    };
    return this.http.post<any>(this.ep.create, payload).pipe(
      map((res) => this.adaptButaca(res?.data ?? res))
    );
  }

  update(id: string, dto: UpdateButacaDto): Observable<Butaca> {
    return this.http.put<any>(this.ep.update(id), dto).pipe(
      map((res) => this.adaptButaca(res?.data ?? res))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.ep.delete(id));
  }

  private extractList(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  private adaptButaca(raw: any): Butaca {
    const tipo = (raw.tipo ?? raw.tipoButaca ?? 'regular').toLowerCase() as TipoButaca;
    return {
      id: String(raw.id ?? raw.idButaca ?? ''),
      idButaca: raw.idButaca ?? (raw.id ? Number(raw.id) : undefined),
      sala_id: String(raw.sala_id ?? raw.idSala ?? raw.sala?.idSala ?? '1'),
      idSala: raw.idSala ?? raw.sala?.idSala ?? (raw.sala_id ? Number(raw.sala_id) : 1),
      fila: raw.fila ?? 'A',
      numero: raw.numero ?? 1,
      tipo: tipo,
      tipoButaca: raw.tipoButaca ?? tipo.toUpperCase(),
      estadoOperativo: raw.estadoOperativo ?? 'DISPONIBLE',
      created_at: raw.created_at,
    };
  }
}
