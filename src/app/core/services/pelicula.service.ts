import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { Pelicula, CreatePeliculaDto, UpdatePeliculaDto } from '../models';

/**
 * Servicio de acceso a datos para la entidad Pelicula conectado al backend Spring Boot.
 */
@Injectable({ providedIn: 'root' })
export class PeliculaService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.peliculas;

  /** Obtiene todas las películas activas adaptadas */
  getAll(): Observable<Pelicula[]> {
    return this.http.get<any>(this.ep.getAll).pipe(
      map((res) => this.extractList(res).map(this.adaptPelicula))
    );
  }

  /** Obtiene una película por ID */
  getById(id: string): Observable<Pelicula> {
    return this.http.get<any>(this.ep.getById(id)).pipe(
      map((res) => this.adaptPelicula(res?.data ?? res))
    );
  }

  /** Crea una nueva película */
  create(dto: CreatePeliculaDto): Observable<Pelicula> {
    const payload = {
      titulo: dto.titulo,
      sinopsis: dto.sinopsis,
      duracionMinutos: dto.duracion,
      clasificacion: dto.clasificacion,
      genero: dto.genero,
      posterUrl: dto.imagen_url,
      estado: dto.activo !== false ? 'ACTIVA' : 'INACTIVA',
    };
    return this.http.post<any>(this.ep.create, payload).pipe(
      map((res) => this.adaptPelicula(res?.data ?? res))
    );
  }

  /** Actualiza una película existente */
  update(id: string, dto: UpdatePeliculaDto): Observable<Pelicula> {
    const payload: any = {};
    if (dto.titulo !== undefined) payload.titulo = dto.titulo;
    if (dto.sinopsis !== undefined) payload.sinopsis = dto.sinopsis;
    if (dto.duracion !== undefined) payload.duracionMinutos = dto.duracion;
    if (dto.clasificacion !== undefined) payload.clasificacion = dto.clasificacion;
    if (dto.genero !== undefined) payload.genero = dto.genero;
    if (dto.imagen_url !== undefined) payload.posterUrl = dto.imagen_url;
    if (dto.activo !== undefined) payload.estado = dto.activo ? 'ACTIVA' : 'INACTIVA';

    return this.http.put<any>(this.ep.update(id), payload).pipe(
      map((res) => this.adaptPelicula(res?.data ?? res))
    );
  }

  /** Elimina una película */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.ep.delete(id));
  }

  private extractList(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  private adaptPelicula(raw: any): Pelicula {
    return {
      id: String(raw.id ?? raw.idPelicula ?? ''),
      idPelicula: raw.idPelicula ?? (raw.id ? Number(raw.id) : undefined),
      titulo: raw.titulo ?? '',
      sinopsis: raw.sinopsis ?? '',
      duracion: raw.duracion ?? raw.duracionMinutos ?? 120,
      duracionMinutos: raw.duracionMinutos ?? raw.duracion ?? 120,
      clasificacion: raw.clasificacion ?? 'B',
      genero: raw.genero ?? '',
      imagen_url: raw.imagen_url ?? raw.posterUrl ?? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
      posterUrl: raw.posterUrl ?? raw.imagen_url ?? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
      activo: raw.activo ?? (raw.estado ? raw.estado.toUpperCase().startsWith('ACTIV') : true),
      estado: raw.estado ?? (raw.activo ? 'ACTIVA' : 'INACTIVA'),
      created_at: raw.created_at,
    };
  }
}
