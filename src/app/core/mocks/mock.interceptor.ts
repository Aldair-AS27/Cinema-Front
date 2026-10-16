import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { Pelicula, Sala, Butaca, FuncionHorario, FuncionButaca } from '../models';
import {
  MOCK_PELICULAS,
  MOCK_SALAS,
  MOCK_BUTACAS,
  MOCK_FUNCIONES,
  MOCK_FUNCION_BUTACAS,
} from './mock-data';

/**
 * Interceptor de MOCKS con persistencia en memoria.
 *
 * CÓMO FUNCIONA:
 *  1. Analiza la URL y el método de cada request.
 *  2. Si coincide con un recurso conocido, responde con datos locales.
 *  3. POST / PATCH / DELETE mutan los arrays en memoria, por lo que al
 *     crear, editar o eliminar algo el cambio SE VE en la UI al recargar
 *     la lista (durante la sesión del navegador; se resetea al recargar la app).
 *  4. Simula latencia de red (350 ms) para comportamiento realista.
 *
 * BAJO ACOPLAMIENTO: Los servicios y componentes no saben si están hablando
 * con un mock o con el backend real. La lógica está 100% aquí.
 *
 * DESACTIVAR: pon `useMocks: false` en environment.development.ts
 * cuando el backend esté disponible.
 */

const LATENCIA = 350; // ms — simula respuesta de red
let secuencia = 0;

/** Genera ids únicos para los registros creados durante la sesión */
function nuevoId(prefijo: string): string {
  secuencia += 1;
  return `${prefijo}-${Date.now().toString(36)}${secuencia}`;
}

/** Respuesta exitosa (clona el body para evitar mutaciones externas) */
function ok<T>(body: T, status = 200) {
  return of(new HttpResponse({ status, body: structuredClone(body) })).pipe(delay(LATENCIA));
}

/** Respuesta de error */
function fallo(status: number, message: string) {
  return throwError(() => ({ status, message }));
}

// ─────────────────────────────────────────────
// Parser de URL: /api/peliculas/pel-001 → { recurso: 'peliculas', id: 'pel-001' }
// ─────────────────────────────────────────────
const RECURSOS = ['peliculas', 'salas', 'butacas', 'funcion_horario', 'funcion_butaca'] as const;
type Recurso = (typeof RECURSOS)[number];

function parsearUrl(url: string): {
  recurso: Recurso | null;
  id?: string;
  query: URLSearchParams;
} {
  const parsed = new URL(url, 'http://mock.local');
  const segmentos = parsed.pathname.split('/').filter(Boolean);

  for (let i = 0; i < segmentos.length; i++) {
    const encontrado = RECURSOS.find((r) => r === segmentos[i]);
    if (encontrado) {
      return { recurso: encontrado, id: segmentos[i + 1], query: parsed.searchParams };
    }
  }
  return { recurso: null, query: parsed.searchParams };
}

// ─────────────────────────────────────────────
// Helpers de dominio
// ─────────────────────────────────────────────

/**
 * Genera la rejilla de butacas de una sala nueva:
 * 10 asientos por fila, fila A = VIP, última fila = discapacitados.
 */
function generarButacasDeSala(sala: Sala): Butaca[] {
  const FILAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const POR_FILA = 10;
  const numFilas = Math.max(1, Math.ceil(sala.capacidad / POR_FILA));
  const butacas: Butaca[] = [];

  for (let f = 0; f < numFilas; f++) {
    const fila = FILAS[f] ?? `F${f + 1}`;
    const enEstaFila = Math.min(POR_FILA, sala.capacidad - f * POR_FILA);
    for (let n = 1; n <= enEstaFila; n++) {
      butacas.push({
        id: nuevoId(`but-${sala.id}`),
        sala_id: sala.id,
        fila,
        numero: n,
        tipo: f === 0 ? 'vip' : f === numFilas - 1 ? 'discapacitados' : 'regular',
      });
    }
  }
  return butacas;
}

/** Popula la película y la sala de una función (como haría el JOIN del backend) */
function denormalizarFuncion(funcion: FuncionHorario): FuncionHorario {
  const pelicula = MOCK_PELICULAS.find((p) => p.id === funcion.pelicula_id);
  const sala = MOCK_SALAS.find((s) => s.id === funcion.sala_id);

  return {
    ...funcion,
    pelicula: pelicula
      ? {
          titulo: pelicula.titulo,
          imagen_url: pelicula.imagen_url,
          duracion: pelicula.duracion,
          clasificacion: pelicula.clasificacion,
        }
      : funcion.pelicula,
    sala: sala ? { nombre: sala.nombre, tipo: sala.tipo } : funcion.sala,
  };
}

/** Crea el mapa de butacas de una función nueva (todas disponibles, VIP con recargo) */
function generarFuncionButacas(funcion: FuncionHorario): FuncionButaca[] {
  const butacas = MOCK_BUTACAS.filter((b) => b.sala_id === funcion.sala_id);
  return butacas.map((b) => ({
    id: nuevoId(`fb-${funcion.id}`),
    funcion_id: funcion.id,
    butaca_id: b.id,
    estado: 'disponible' as const,
    precio: b.tipo === 'vip' ? Math.round(funcion.precio * 1.5 * 100) / 100 : undefined,
    butaca: { fila: b.fila, numero: b.numero, tipo: b.tipo },
  }));
}

// ─────────────────────────────────────────────
// Interceptor
// ─────────────────────────────────────────────
export const mockInterceptor: HttpInterceptorFn = (req, _next) => {
  const { recurso, id, query } = parsearUrl(req.url);
  const body = (req.body ?? {}) as Record<string, unknown>;

  switch (recurso) {
    case 'peliculas':
      return manejarPeliculas(req.method, id, body);
    case 'salas':
      return manejarSalas(req.method, id, body);
    case 'butacas':
      return manejarButacas(req.method, id, query, body);
    case 'funcion_horario':
      return manejarFunciones(req.method, id, query, body);
    case 'funcion_butaca':
      return manejarFuncionButacas(req.method, id, query, body);
    default:
      return fallo(404, `Mock: URL no registrada: ${req.url}`);
  }
};

// ─────────────────────────────────────────────
// PELÍCULAS
// ─────────────────────────────────────────────
function manejarPeliculas(method: string, id?: string, body?: Record<string, unknown>) {
  if (method === 'GET') {
    if (id) {
      const pelicula = MOCK_PELICULAS.find((p) => p.id === id);
      return pelicula ? ok(pelicula) : fallo(404, 'Película no encontrada');
    }
    return ok(MOCK_PELICULAS);
  }

  if (method === 'POST') {
    const nueva = {
      ...(body as Partial<Pelicula>),
      id: nuevoId('pel'),
      created_at: new Date().toISOString(),
    } as Pelicula;
    MOCK_PELICULAS.unshift(nueva);
    return ok(nueva, 201);
  }

  if (method === 'PATCH' && id) {
    const idx = MOCK_PELICULAS.findIndex((p) => p.id === id);
    if (idx === -1) return fallo(404, 'Película no encontrada');
    const actualizada: Pelicula = { ...MOCK_PELICULAS[idx], ...body, id };
    MOCK_PELICULAS[idx] = actualizada;
    return ok(actualizada);
  }

  if (method === 'DELETE' && id) {
    const idx = MOCK_PELICULAS.findIndex((p) => p.id === id);
    if (idx === -1) return fallo(404, 'Película no encontrada');
    MOCK_PELICULAS.splice(idx, 1);
    return ok(null, 204);
  }

  return fallo(405, `Mock: método ${method} no soportado en /peliculas`);
}

// ─────────────────────────────────────────────
// SALAS
// ─────────────────────────────────────────────
function manejarSalas(method: string, id?: string, body?: Record<string, unknown>) {
  if (method === 'GET') {
    if (id) {
      const sala = MOCK_SALAS.find((s) => s.id === id);
      return sala ? ok(sala) : fallo(404, 'Sala no encontrada');
    }
    return ok(MOCK_SALAS);
  }

  if (method === 'POST') {
    const nueva = {
      ...(body as Partial<Sala>),
      id: nuevoId('sala'),
      activa: true,
      created_at: new Date().toISOString(),
    } as Sala;
    MOCK_SALAS.push(nueva);
    // Genera automáticamente sus butacas para que el detalle de sala funcione
    const butacas = generarButacasDeSala(nueva);
    MOCK_BUTACAS.push(...butacas);
    return ok({ ...nueva, butacas_generadas: butacas.length }, 201);
  }

  if (method === 'PATCH' && id) {
    const idx = MOCK_SALAS.findIndex((s) => s.id === id);
    if (idx === -1) return fallo(404, 'Sala no encontrada');
    const actualizada: Sala = { ...MOCK_SALAS[idx], ...body, id };
    MOCK_SALAS[idx] = actualizada;
    return ok(actualizada);
  }

  if (method === 'DELETE' && id) {
    const idx = MOCK_SALAS.findIndex((s) => s.id === id);
    if (idx === -1) return fallo(404, 'Sala no encontrada');
    MOCK_SALAS.splice(idx, 1);
    // Elimina también sus butacas
    for (let i = MOCK_BUTACAS.length - 1; i >= 0; i--) {
      if (MOCK_BUTACAS[i].sala_id === id) MOCK_BUTACAS.splice(i, 1);
    }
    return ok(null, 204);
  }

  return fallo(405, `Mock: método ${method} no soportado en /salas`);
}

// ─────────────────────────────────────────────
// BUTACAS
// ─────────────────────────────────────────────
function manejarButacas(
  method: string,
  id?: string,
  query?: URLSearchParams,
  body?: Record<string, unknown>,
) {
  if (method === 'GET') {
    if (id) {
      const butaca = MOCK_BUTACAS.find((b) => b.id === id);
      return butaca ? ok(butaca) : fallo(404, 'Butaca no encontrada');
    }
    const salaId = query?.get('sala_id');
    const resultado = salaId ? MOCK_BUTACAS.filter((b) => b.sala_id === salaId) : MOCK_BUTACAS;
    return ok(resultado);
  }

  if (method === 'POST') {
    const nueva = { ...(body as Partial<Butaca>), id: nuevoId('but') } as Butaca;
    MOCK_BUTACAS.push(nueva);
    return ok(nueva, 201);
  }

  if (method === 'PATCH' && id) {
    const idx = MOCK_BUTACAS.findIndex((b) => b.id === id);
    if (idx === -1) return fallo(404, 'Butaca no encontrada');
    const actualizada: Butaca = { ...MOCK_BUTACAS[idx], ...body, id };
    MOCK_BUTACAS[idx] = actualizada;
    return ok(actualizada);
  }

  if (method === 'DELETE' && id) {
    const idx = MOCK_BUTACAS.findIndex((b) => b.id === id);
    if (idx === -1) return fallo(404, 'Butaca no encontrada');
    MOCK_BUTACAS.splice(idx, 1);
    return ok(null, 204);
  }

  return fallo(405, `Mock: método ${method} no soportado en /butacas`);
}

// ─────────────────────────────────────────────
// FUNCIONES DE HORARIO (cartelera)
// ─────────────────────────────────────────────
function manejarFunciones(
  method: string,
  id?: string,
  query?: URLSearchParams,
  body?: Record<string, unknown>,
) {
  if (method === 'GET') {
    if (id) {
      const funcion = MOCK_FUNCIONES.find((f) => f.id === id);
      return funcion ? ok(funcion) : fallo(404, 'Función no encontrada');
    }
    const peliculaId = query?.get('pelicula_id');
    const fecha = query?.get('fecha');
    let resultado = [...MOCK_FUNCIONES];
    if (peliculaId) resultado = resultado.filter((f) => f.pelicula_id === peliculaId);
    if (fecha) resultado = resultado.filter((f) => f.fecha === fecha);
    return ok(resultado);
  }

  if (method === 'POST') {
    const peliculaId = body?.['pelicula_id'] as string;
    const salaId = body?.['sala_id'] as string;
    if (!MOCK_PELICULAS.some((p) => p.id === peliculaId)) {
      return fallo(400, 'La película seleccionada no existe');
    }
    if (!MOCK_SALAS.some((s) => s.id === salaId)) {
      return fallo(400, 'La sala seleccionada no existe');
    }

    const nueva = denormalizarFuncion({
      ...(body as Partial<FuncionHorario>),
      id: nuevoId('fun'),
      activa: body?.['activa'] !== false,
      created_at: new Date().toISOString(),
    } as FuncionHorario);

    MOCK_FUNCIONES.unshift(nueva);
    // Genera su mapa de butacas para que el Seat Map funcione de inmediato
    MOCK_FUNCION_BUTACAS.push(...generarFuncionButacas(nueva));
    return ok(nueva, 201);
  }

  if (method === 'PATCH' && id) {
    const idx = MOCK_FUNCIONES.findIndex((f) => f.id === id);
    if (idx === -1) return fallo(404, 'Función no encontrada');

    const anterior = MOCK_FUNCIONES[idx];
    const actualizada = denormalizarFuncion({ ...anterior, ...body, id } as FuncionHorario);
    MOCK_FUNCIONES[idx] = actualizada;

    // Si cambió de sala, se regenera su mapa de butacas
    if (actualizada.sala_id !== anterior.sala_id) {
      for (let i = MOCK_FUNCION_BUTACAS.length - 1; i >= 0; i--) {
        if (MOCK_FUNCION_BUTACAS[i].funcion_id === id) MOCK_FUNCION_BUTACAS.splice(i, 1);
      }
      MOCK_FUNCION_BUTACAS.push(...generarFuncionButacas(actualizada));
    }
    return ok(actualizada);
  }

  if (method === 'DELETE' && id) {
    const idx = MOCK_FUNCIONES.findIndex((f) => f.id === id);
    if (idx === -1) return fallo(404, 'Función no encontrada');
    MOCK_FUNCIONES.splice(idx, 1);
    // Elimina también su mapa de butacas
    for (let i = MOCK_FUNCION_BUTACAS.length - 1; i >= 0; i--) {
      if (MOCK_FUNCION_BUTACAS[i].funcion_id === id) MOCK_FUNCION_BUTACAS.splice(i, 1);
    }
    return ok(null, 204);
  }

  return fallo(405, `Mock: método ${method} no soportado en /funcion_horario`);
}

// ─────────────────────────────────────────────
// FUNCION-BUTACAS (mapa de asientos por función)
// ─────────────────────────────────────────────
function manejarFuncionButacas(
  method: string,
  id?: string,
  query?: URLSearchParams,
  body?: Record<string, unknown>,
) {
  if (method === 'GET') {
    if (id) {
      const fb = MOCK_FUNCION_BUTACAS.find((f) => f.id === id);
      return fb ? ok(fb) : fallo(404, 'FuncionButaca no encontrada');
    }
    const funcionId = query?.get('funcion_id');
    const resultado = funcionId
      ? MOCK_FUNCION_BUTACAS.filter((fb) => fb.funcion_id === funcionId)
      : MOCK_FUNCION_BUTACAS;
    return ok(resultado);
  }

  if (method === 'POST') {
    const nueva = { ...(body as Partial<FuncionButaca>), id: nuevoId('fb') } as FuncionButaca;
    MOCK_FUNCION_BUTACAS.push(nueva);
    return ok(nueva, 201);
  }

  if (method === 'PATCH' && id) {
    const idx = MOCK_FUNCION_BUTACAS.findIndex((fb) => fb.id === id);
    if (idx === -1) return fallo(404, 'FuncionButaca no encontrada');
    const actualizada: FuncionButaca = { ...MOCK_FUNCION_BUTACAS[idx], ...body, id };
    MOCK_FUNCION_BUTACAS[idx] = actualizada;
    return ok(actualizada);
  }

  if (method === 'DELETE' && id) {
    const idx = MOCK_FUNCION_BUTACAS.findIndex((fb) => fb.id === id);
    if (idx === -1) return fallo(404, 'FuncionButaca no encontrada');
    MOCK_FUNCION_BUTACAS.splice(idx, 1);
    return ok(null, 204);
  }

  return fallo(405, `Mock: método ${method} no soportado en /funcion_butaca`);
}
