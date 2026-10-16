/**
 * Tipos posibles para el tipo de sala.
 * Definidos como union type para garantizar consistencia en toda la app.
 */
export type TipoSala = '2D' | '3D' | 'IMAX' | '4DX' | 'VIP';

/**
 * Modelo de la entidad Sala.
 * Refleja la tabla `sala` de Supabase.
 */
export interface Sala {
  id: string;
  nombre: string;
  capacidad: number;
  tipo: TipoSala;
  activa?: boolean;
  created_at?: string;
}

export type CreateSalaDto = Omit<Sala, 'id' | 'created_at'>;
export type UpdateSalaDto = Partial<CreateSalaDto>;
