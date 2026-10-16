/**
 * Estado posible de una butaca dentro de una función específica.
 */
export type EstadoButaca = 'disponible' | 'reservada' | 'ocupada' | 'bloqueada';

/**
 * Modelo de la entidad FuncionButaca (mapa dinámico de asientos por función).
 * Es la tabla pivote entre FuncionHorario y Butaca.
 * Refleja la tabla `funcion_butaca` de Supabase.
 */
export interface FuncionButaca {
  id: string;
  funcion_id: string;
  butaca_id: string;
  estado: EstadoButaca;
  precio?: number;       // puede sobrescribir el precio de la función (ej: butaca VIP)
  created_at?: string;

  /** Relaciones opcionales (populadas del backend con JOIN) */
  butaca?: {
    fila: string;
    numero: number;
    tipo: string;
  };
}

export type CreateFuncionButacaDto = Omit<FuncionButaca, 'id' | 'created_at' | 'butaca'>;
export type UpdateFuncionButacaDto = Partial<CreateFuncionButacaDto>;
