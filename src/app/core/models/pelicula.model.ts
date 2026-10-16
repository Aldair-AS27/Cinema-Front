/**
 * Modelo de la entidad Pelicula.
 * Refleja la tabla `pelicula` de Supabase.
 */
export interface Pelicula {
  id: string;
  titulo: string;
  sinopsis: string;
  duracion: number;        // en minutos
  clasificacion: string;   // G, PG, PG-13, R, etc.
  genero: string;
  imagen_url: string;
  activo?: boolean;
  created_at?: string;
}

/** DTO para crear una película (sin campos autogenerados) */
export type CreatePeliculaDto = Omit<Pelicula, 'id' | 'created_at'>;

/** DTO para actualizar una película (todos los campos opcionales) */
export type UpdatePeliculaDto = Partial<CreatePeliculaDto>;
