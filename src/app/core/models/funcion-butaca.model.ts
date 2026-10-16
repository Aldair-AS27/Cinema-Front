export type EstadoButaca = 'disponible' | 'reservada' | 'ocupada' | 'bloqueada';

export interface FuncionButaca {
  id: string;
  idFuncionButaca?: number;
  funcion_id: string;
  idFuncion?: number;
  butaca_id: string;
  idButaca?: number;
  estado: EstadoButaca;
  estadoDisponibilidad?: string;
  precio?: number;
  bloqueadoHasta?: string;
  created_at?: string;

  /** Relaciones opcionales */
  butaca?: {
    fila: string;
    numero: number;
    tipo: string;
  };
}

export type CreateFuncionButacaDto = Omit<FuncionButaca, 'id' | 'created_at' | 'butaca'>;
export type UpdateFuncionButacaDto = Partial<CreateFuncionButacaDto>;
