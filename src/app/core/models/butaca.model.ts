/**
 * Tipos posibles para una butaca.
 */
export type TipoButaca = 'regular' | 'vip' | 'discapacitados';

/**
 * Modelo de la entidad Butaca (asiento físico estático de una sala).
 * Refleja la tabla `butaca` de Supabase.
 */
export interface Butaca {
  id: string;
  sala_id: string;
  fila: string;      // ejemplo: 'A', 'B', 'C' ...
  numero: number;    // ejemplo: 1, 2, 3 ...
  tipo: TipoButaca;
  created_at?: string;
}

export type CreateButacaDto = Omit<Butaca, 'id' | 'created_at'>;
export type UpdateButacaDto = Partial<CreateButacaDto>;
