/**
 * Modelo de la entidad FuncionHorario (la cartelera).
 * Cruza una Pelicula con una Sala en una fecha/hora específica.
 * Refleja la tabla `funcion_horario` de Supabase.
 */
export interface FuncionHorario {
  id: string;
  pelicula_id: string;
  sala_id: string;
  fecha: string;        // ISO date: 'YYYY-MM-DD'
  hora_inicio: string;  // 'HH:mm'
  precio: number;
  activa?: boolean;
  created_at?: string;

  /** Relaciones opcionales (pueden venir populadas del backend con JOIN) */
  pelicula?: {
    titulo: string;
    imagen_url: string;
    duracion: number;
    clasificacion: string;
  };
  sala?: {
    nombre: string;
    tipo: string;
  };
}

export type CreateFuncionHorarioDto = Omit<FuncionHorario, 'id' | 'created_at' | 'pelicula' | 'sala'>;
export type UpdateFuncionHorarioDto = Partial<CreateFuncionHorarioDto>;
