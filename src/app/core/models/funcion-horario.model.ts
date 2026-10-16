export interface FuncionHorario {
  id: string;
  idFuncion?: number;
  pelicula_id: string;
  idPelicula?: number;
  sala_id: string;
  idSala?: number;
  fecha: string;        // ISO date: 'YYYY-MM-DD'
  hora_inicio: string;  // 'HH:mm'
  precio: number;
  precioBase?: number;
  formato?: string;
  version?: string;
  activa?: boolean;
  estado?: string;
  created_at?: string;

  /** Relaciones opcionales */
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
