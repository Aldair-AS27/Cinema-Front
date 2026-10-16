export type TipoSala = '2D' | '3D' | 'IMAX' | '4DX' | 'VIP';

export interface Sala {
  id: string;
  idSala?: number;
  nombre: string;
  nombreNumero?: string;
  capacidad: number;
  tipo: TipoSala | string;
  tipoSala?: string;
  activa?: boolean;
  estado?: string;
  created_at?: string;
}

export type CreateSalaDto = Omit<Sala, 'id' | 'created_at'>;
export type UpdateSalaDto = Partial<CreateSalaDto>;
