import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_ENDPOINTS } from '../api-endpoints';
import { DulceriaProducto } from '../models';

@Injectable({ providedIn: 'root' })
export class DulceriaService {
  private readonly http = inject(HttpClient);
  private readonly ep = API_ENDPOINTS.dulceria;

  /** Obtiene todo el catálogo de dulcería y combos */
  getCatalogo(): Observable<DulceriaProducto[]> {
    return this.http.get<any>(this.ep.getAll).pipe(
      map((res) => this.extractList(res).map(this.adaptProducto))
    );
  }

  /** Filtra por categoría (COMBOS, PALOMITAS, BEBIDAS, SNACKS) */
  getByCategoria(categoria: string): Observable<DulceriaProducto[]> {
    return this.http.get<any>(this.ep.getByCategoria(categoria)).pipe(
      map((res) => this.extractList(res).map(this.adaptProducto))
    );
  }

  private extractList(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  private adaptProducto(raw: any): DulceriaProducto {
    return {
      id: String(raw.id ?? raw.idProducto ?? ''),
      idProducto: raw.idProducto ?? (raw.id ? Number(raw.id) : undefined),
      nombre: raw.nombre ?? '',
      descripcion: raw.descripcion ?? '',
      precio: Number(raw.precio ?? 0),
      categoria: raw.categoria ?? 'COMBOS',
      imagen_url: raw.imagen_url ?? raw.imagenUrl ?? '',
      imagenUrl: raw.imagenUrl ?? raw.imagen_url ?? '',
      disponible: raw.disponible ?? true,
    };
  }
}
