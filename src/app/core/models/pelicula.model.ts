export interface Pelicula {
  id: string;
  idPelicula?: number;
  titulo: string;
  sinopsis: string;
  duracion: number;
  duracionMinutos?: number;
  clasificacion: string;
  genero: string;
  imagen_url: string;
  posterUrl?: string;
  activo?: boolean;
  estado?: string;
  created_at?: string;
}

export type CreatePeliculaDto = Omit<Pelicula, 'id' | 'created_at'>;
export type UpdatePeliculaDto = Partial<CreatePeliculaDto>;
