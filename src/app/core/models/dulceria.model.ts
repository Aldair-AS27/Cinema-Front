export interface DulceriaProducto {
  idProducto?: number;
  id?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string; // COMBO, PALOMITAS, BEBIDAS, SNACKS
  imagenUrl?: string;
  imagen_url?: string;
  disponible?: boolean;
}
