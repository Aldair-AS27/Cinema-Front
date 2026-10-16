import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { FuncionHorario, CreateFuncionHorarioDto, UpdateFuncionHorarioDto } from '../models';

@Injectable({ providedIn: 'root' })
export class FuncionHorarioService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.funcionHorario;

  getAll(): Observable<FuncionHorario[]> {
    return this.http.get<any>(this.ep.getAll).pipe(
      map((res) => this.extractList(res).map(this.adaptFuncion))
    );
  }

  getById(id: string | number): Observable<FuncionHorario> {
    return this.http.get<any>(this.ep.getById(id)).pipe(
      map((res) => this.adaptFuncion(res?.data ?? res))
    );
  }

  getByPelicula(peliculaId: string | number): Observable<FuncionHorario[]> {
    return this.http.get<any>(this.ep.getByPelicula(peliculaId)).pipe(
      map((res) => this.extractList(res).map(this.adaptFuncion))
    );
  }

  getByFecha(fecha: string): Observable<FuncionHorario[]> {
    return this.http.get<any>(this.ep.getByFecha(fecha)).pipe(
      map((res) => this.extractList(res).map(this.adaptFuncion))
    );
  }

  create(dto: CreateFuncionHorarioDto): Observable<FuncionHorario> {
    const payload = {
      idPelicula: Number(dto.pelicula_id),
      idSala: Number(dto.sala_id),
      fechaHoraInicio: `${dto.fecha}T${dto.hora_inicio}:00Z`,
      precioBase: dto.precio,
      formato: dto.formato ?? '2D',
      version: dto.version ?? 'DOB',
      estado: dto.activa !== false ? 'ACTIVO' : 'INACTIVO'
    };
    return this.http.post<any>(this.ep.create, payload).pipe(
      map((res) => this.adaptFuncion(res?.data ?? res))
    );
  }

  update(id: string | number, dto: UpdateFuncionHorarioDto): Observable<FuncionHorario> {
    return this.http.put<any>(this.ep.update(id), dto).pipe(
      map((res) => this.adaptFuncion(res?.data ?? res))
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

  private adaptFuncion(raw: any): FuncionHorario {
    let fecha = raw.fecha ?? '';
    let hora = raw.hora_inicio ?? '';
    if (raw.fechaHoraInicio) {
      try {
        const d = new Date(raw.fechaHoraInicio);
        if (!isNaN(d.getTime())) {
          fecha = d.toISOString().split('T')[0];
          hora = d.toTimeString().substring(0, 5);
        }
      } catch {
        // Ignorado
      }
    }
    return {
      id: String(raw.id ?? raw.idFuncion ?? ''),
      idFuncion: raw.idFuncion ?? (raw.id ? Number(raw.id) : undefined),
      pelicula_id: String(raw.pelicula_id ?? raw.idPelicula ?? ''),
      idPelicula: raw.idPelicula ?? (raw.pelicula_id ? Number(raw.pelicula_id) : undefined),
      sala_id: String(raw.sala_id ?? raw.idSala ?? ''),
      idSala: raw.idSala ?? (raw.sala_id ? Number(raw.sala_id) : undefined),
      fecha: fecha || '2026-10-20',
      hora_inicio: hora || '19:00',
      precio: Number(raw.precio ?? raw.precioBase ?? 22.0),
      precioBase: Number(raw.precioBase ?? raw.precio ?? 22.0),
      formato: raw.formato ?? raw.sala?.tipo ?? '2D',
      version: raw.version ?? 'DOB',
      activa: raw.activa ?? (raw.estado ? raw.estado === 'ACTIVO' : true),
      estado: raw.estado ?? (raw.activa ? 'ACTIVO' : 'INACTIVO'),
      pelicula: {
        titulo: raw.pelicula?.titulo ?? raw.tituloPelicula ?? 'Película',
        imagen_url: raw.pelicula?.imagen_url ?? raw.posterUrl ?? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
        duracion: raw.pelicula?.duracion ?? 120,
        clasificacion: raw.pelicula?.clasificacion ?? 'B'
      },
      sala: {
        nombre: raw.sala?.nombre ?? raw.nombreSala ?? `Sala ${raw.idSala ?? raw.sala_id ?? 1}`,
        tipo: raw.sala?.tipo ?? raw.formato ?? '2D Regular'
      },
      created_at: raw.created_at
    };
  }
}
