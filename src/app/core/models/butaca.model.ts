export type TipoButaca = 'regular' | 'vip' | 'discapacitados';

export interface Butaca {
  id: string;
  idButaca?: number;
  sala_id: string;
  idSala?: number;
  fila: string;
  numero: number;
  tipo: TipoButaca | string;
  tipoButaca?: string;
  estadoOperativo?: string;
  created_at?: string;
}

export type CreateButacaDto = Omit<Butaca, 'id' | 'created_at'>;
export type UpdateButacaDto = Partial<CreateButacaDto>;
