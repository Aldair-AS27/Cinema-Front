export interface ItemDulceriaRequest {
  idProducto: number;
  cantidad: number;
}

export interface ReservaRequest {
  idFuncion: number;
  clienteNombre: string;
  clienteEmail: string;
  metodoPago: string; // TARJETA, YAPE, PLIN, EFECTIVO
  butacaIds: number[];
  itemsDulceria?: ItemDulceriaRequest[];
}

export interface DetalleReserva {
  idDetalle: number;
  tipoItem: string;
  descripcionItem: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ReservaResponse {
  idReserva: number;
  codigoReserva: string;
  clienteNombre: string;
  clienteEmail: string;
  tituloPelicula: string;
  nombreSala: string;
  fechaHoraFuncion: string;
  asientosReservados: string[];
  totalBoletos: number;
  totalDulceria: number;
  totalPagar: number;
  estado: string;
  codigoQrBase64?: string;
  codigoPickup?: string;
  detalles: DetalleReserva[];
}
