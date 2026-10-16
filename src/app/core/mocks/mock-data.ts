import { Pelicula } from '../models/pelicula.model';
import { Sala } from '../models/sala.model';
import { Butaca } from '../models/butaca.model';
import { FuncionHorario } from '../models/funcion-horario.model';
import { FuncionButaca } from '../models/funcion-butaca.model';

// ─────────────────────────────────────────────
// PELÍCULAS
// ─────────────────────────────────────────────
export const MOCK_PELICULAS: Pelicula[] = [
  {
    id: 'pel-001',
    titulo: 'Interstellar: Horizonte Final',
    sinopsis: 'Un grupo de astronautas viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad, enfrentando los límites del tiempo y el espacio.',
    duracion: 169,
    clasificacion: 'PG-13',
    genero: 'Ciencia Ficción',
    imagen_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop',
    activo: true,
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'pel-002',
    titulo: 'Dune: Parte III',
    sinopsis: 'Paul Atreides continúa su cruzada en Arrakis, descubriendo que su destino está más entrelazado con la especias y el universo de lo que imaginaba.',
    duracion: 155,
    clasificacion: 'PG-13',
    genero: 'Épica / Sci-Fi',
    imagen_url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
    activo: true,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'pel-003',
    titulo: 'Eclipse Negro',
    sinopsis: 'Una agente de inteligencia descubre una conspiración global que podría cambiar el equilibrio de poder mundial. Acción y suspenso al límite.',
    duracion: 128,
    clasificacion: 'R',
    genero: 'Acción / Thriller',
    imagen_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    activo: true,
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'pel-004',
    titulo: 'El Último Guardián',
    sinopsis: 'En un mundo post-apocalíptico, un soldado robot aprende lo que significa ser humano al proteger a la última colonia de sobrevivientes.',
    duracion: 142,
    clasificacion: 'PG',
    genero: 'Animación / Aventura',
    imagen_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
    activo: true,
    created_at: '2026-02-10T00:00:00Z',
  },
  {
    id: 'pel-005',
    titulo: 'Quantum',
    sinopsis: 'Un físico cuántico descubre que sus experimentos están creando universos paralelos donde sus decisiones tienen consecuencias catastróficas.',
    duracion: 135,
    clasificacion: 'PG-13',
    genero: 'Thriller / Ciencia Ficción',
    imagen_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop',
    activo: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'pel-006',
    titulo: 'Marea Roja',
    sinopsis: 'Un submarino de la OTAN intercepta un mensaje cifrado que podría iniciar la Tercera Guerra Mundial. El capitán tiene minutos para decidir.',
    duracion: 116,
    clasificacion: 'R',
    genero: 'Thriller / Bélico',
    imagen_url: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=400&h=600&fit=crop',
    activo: true,
    created_at: '2026-03-15T00:00:00Z',
  },
];

// ─────────────────────────────────────────────
// SALAS
// ─────────────────────────────────────────────
export const MOCK_SALAS: Sala[] = [
  { id: 'sala-001', nombre: 'Sala 1 - IMAX',  capacidad: 120, tipo: 'IMAX', activa: true },
  { id: 'sala-002', nombre: 'Sala 2 - VIP',   capacidad: 60,  tipo: 'VIP',  activa: true },
  { id: 'sala-003', nombre: 'Sala 3 - 4DX',   capacidad: 80,  tipo: '4DX',  activa: true },
  { id: 'sala-004', nombre: 'Sala 4 - 3D',    capacidad: 100, tipo: '3D',   activa: true },
  { id: 'sala-005', nombre: 'Sala 5 - 2D',    capacidad: 150, tipo: '2D',   activa: true },
];

// ─────────────────────────────────────────────
// BUTACAS (generadas para Sala 1: filas A-H, 15 columnas)
// ─────────────────────────────────────────────
function generarButacas(salaId: string, filas: string[], columnas: number): Butaca[] {
  const butacas: Butaca[] = [];
  filas.forEach((fila) => {
    for (let num = 1; num <= columnas; num++) {
      butacas.push({
        id: `but-${salaId}-${fila}${num}`,
        sala_id: salaId,
        fila,
        numero: num,
        // Fila A es VIP, última fila es discapacitados, resto regular
        tipo:
          fila === 'A' ? 'vip'
          : fila === filas[filas.length - 1] ? 'discapacitados'
          : 'regular',
      });
    }
  });
  return butacas;
}

export const MOCK_BUTACAS: Butaca[] = [
  ...generarButacas('sala-001', ['A','B','C','D','E','F','G','H'], 15),
  ...generarButacas('sala-002', ['A','B','C','D','E','F'], 10),
  ...generarButacas('sala-003', ['A','B','C','D','E','F','G'], 12),
];

// ─────────────────────────────────────────────
// FUNCIONES HORARIO (Cartelera)
// ─────────────────────────────────────────────
export const MOCK_FUNCIONES: FuncionHorario[] = [
  {
    id: 'fun-001', pelicula_id: 'pel-001', sala_id: 'sala-001',
    fecha: '2026-10-16', hora_inicio: '14:00', precio: 28.50, activa: true,
    pelicula: { titulo: 'Interstellar: Horizonte Final', imagen_url: MOCK_PELICULAS[0].imagen_url, duracion: 169, clasificacion: 'PG-13' },
    sala: { nombre: 'Sala 1 - IMAX', tipo: 'IMAX' },
  },
  {
    id: 'fun-002', pelicula_id: 'pel-001', sala_id: 'sala-001',
    fecha: '2026-10-16', hora_inicio: '18:30', precio: 28.50, activa: true,
    pelicula: { titulo: 'Interstellar: Horizonte Final', imagen_url: MOCK_PELICULAS[0].imagen_url, duracion: 169, clasificacion: 'PG-13' },
    sala: { nombre: 'Sala 1 - IMAX', tipo: 'IMAX' },
  },
  {
    id: 'fun-003', pelicula_id: 'pel-002', sala_id: 'sala-002',
    fecha: '2026-10-16', hora_inicio: '16:00', precio: 35.00, activa: true,
    pelicula: { titulo: 'Dune: Parte III', imagen_url: MOCK_PELICULAS[1].imagen_url, duracion: 155, clasificacion: 'PG-13' },
    sala: { nombre: 'Sala 2 - VIP', tipo: 'VIP' },
  },
  {
    id: 'fun-004', pelicula_id: 'pel-003', sala_id: 'sala-003',
    fecha: '2026-10-16', hora_inicio: '20:00', precio: 32.00, activa: true,
    pelicula: { titulo: 'Eclipse Negro', imagen_url: MOCK_PELICULAS[2].imagen_url, duracion: 128, clasificacion: 'R' },
    sala: { nombre: 'Sala 3 - 4DX', tipo: '4DX' },
  },
  {
    id: 'fun-005', pelicula_id: 'pel-004', sala_id: 'sala-004',
    fecha: '2026-10-17', hora_inicio: '11:00', precio: 22.00, activa: true,
    pelicula: { titulo: 'El Último Guardián', imagen_url: MOCK_PELICULAS[3].imagen_url, duracion: 142, clasificacion: 'PG' },
    sala: { nombre: 'Sala 4 - 3D', tipo: '3D' },
  },
  {
    id: 'fun-006', pelicula_id: 'pel-005', sala_id: 'sala-005',
    fecha: '2026-10-17', hora_inicio: '21:30', precio: 20.00, activa: true,
    pelicula: { titulo: 'Quantum', imagen_url: MOCK_PELICULAS[4].imagen_url, duracion: 135, clasificacion: 'PG-13' },
    sala: { nombre: 'Sala 5 - 2D', tipo: '2D' },
  },
];

// ─────────────────────────────────────────────
// FUNCION-BUTACAS (estado del mapa de sala-001 para fun-001)
// ─────────────────────────────────────────────
function generarFuncionButacas(funcionId: string, salaId: string): FuncionButaca[] {
  const butacasDeSala = MOCK_BUTACAS.filter((b) => b.sala_id === salaId);
  const ocupadasAlAzar = new Set<string>();

  // Simula ~40% de butacas ocupadas/reservadas de forma aleatoria pero determinista
  butacasDeSala.forEach((b, i) => {
    if (i % 3 === 0) ocupadasAlAzar.add(b.id);
    if (i % 7 === 0) ocupadasAlAzar.add(b.id);
  });

  return butacasDeSala.map((b) => {
    const estaOcupada = ocupadasAlAzar.has(b.id);
    return {
      id: `fb-${funcionId}-${b.id}`,
      funcion_id: funcionId,
      butaca_id: b.id,
      estado: estaOcupada ? (b.fila === 'A' ? 'reservada' : 'ocupada') : 'disponible',
      precio: b.tipo === 'vip' ? 45.00 : undefined,
      butaca: { fila: b.fila, numero: b.numero, tipo: b.tipo },
    };
  });
}

export const MOCK_FUNCION_BUTACAS: FuncionButaca[] = [
  ...generarFuncionButacas('fun-001', 'sala-001'),
  ...generarFuncionButacas('fun-002', 'sala-001'),
  ...generarFuncionButacas('fun-003', 'sala-002'),
  ...generarFuncionButacas('fun-004', 'sala-003'),
];
