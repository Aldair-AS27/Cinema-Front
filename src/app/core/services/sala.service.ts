import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { Sala, CreateSalaDto, UpdateSalaDto, TipoSala } from '../models';

@Injectable({ providedIn: 'root' })
export class SalaService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.salas;

  getAll(): Observable<Sala[]> {
    return this.http.get<any>(this.ep.getAll).pipe(
      map((res) => this.extractList(res).map(this.adaptSala))
    );
  }

  getById(id: string): Observable<Sala> {
    return this.http.get<any>(this.ep.getById(id)).pipe(
      map((res) => this.adaptSala(res?.data ?? res))
    );
  }

  create(dto: CreateSalaDto): Observable<Sala> {
    const payload = {
      nombreNumero: dto.nombre,
      tipoSala: dto.tipo,
      estado: dto.activa !== false ? 'ACTIVA' : 'INACTIVA',
    };
    return this.http.post<any>(this.ep.create, payload).pipe(
      map((res) => this.adaptSala(res?.data ?? res))
    );
  }

  update(id: string, dto: UpdateSalaDto): Observable<Sala> {
    const payload: any = {};
    if (dto.nombre !== undefined) payload.nombreNumero = dto.nombre;
    if (dto.tipo !== undefined) payload.tipoSala = dto.tipo;
    if (dto.activa !== undefined) payload.estado = dto.activa ? 'ACTIVA' : 'INACTIVA';

    return this.http.put<any>(this.ep.update(id), payload).pipe(
      map((res) => this.adaptSala(res?.data ?? res))
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

  private adaptSala(raw: any): Sala {
    return {
      id: String(raw.id ?? raw.idSala ?? ''),
      idSala: raw.idSala ?? (raw.id ? Number(raw.id) : undefined),
      nombre: raw.nombre ?? raw.nombreNumero ?? `Sala ${raw.idSala ?? raw.id ?? ''}`,
      nombreNumero: raw.nombreNumero ?? raw.nombre ?? '',
      capacidad: raw.capacidad ?? 80,
      tipo: (raw.tipo ?? raw.tipoSala ?? '2D') as TipoSala,
      tipoSala: raw.tipoSala ?? raw.tipo ?? '2D',
      activa: raw.activa ?? (raw.estado ? raw.estado.toUpperCase().startsWith('ACTIV') : true),
      estado: raw.estado ?? (raw.activa ? 'ACTIVA' : 'INACTIVA'),
      created_at: raw.created_at,
    };
  }
}
