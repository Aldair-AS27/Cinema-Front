import { HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, throwError } from 'rxjs';

import { mockInterceptor } from './mock.interceptor';
import { Pelicula, FuncionHorario, FuncionButaca } from '../models';

/**
 * Tests del interceptor de mocks.
 * Verifican que el CRUD en memoria funciona: crear → aparece en la lista,
 * editar → persiste, eliminar → desaparece; y que las funciones nuevas
 * reciben su mapa de butacas automáticamente.
 */

const BASE = 'http://localhost:3000/api';

/** El mock nunca debe delegar al backend real */
const NEXT = () => throwError(() => new Error('El mock no debe delegar al backend'));

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  body?: unknown,
): Promise<{ status: number; body: T }> {
  const req =
    body === undefined
      ? new HttpRequest(method as 'GET', url)
      : new HttpRequest(method as 'POST', url, body);
  const event = await firstValueFrom(mockInterceptor(req, NEXT));
  const res = event as HttpResponse<T>;
  return { status: res.status, body: res.body as T };
}

describe('mockInterceptor', () => {
  describe('GET', () => {
    it('devuelve la lista de películas mock', async () => {
      const { status, body } = await request<Pelicula[]>('GET', `${BASE}/peliculas`);
      expect(status).toBe(200);
      expect(body.length).toBeGreaterThanOrEqual(5);
      expect(body.some((p) => p.titulo.includes('Interstellar'))).toBe(true);
    });

    it('devuelve una película por id y 404 si no existe', async () => {
      const ok = await request<Pelicula>('GET', `${BASE}/peliculas/pel-001`);
      expect(ok.status).toBe(200);
      expect(ok.body.titulo).toContain('Interstellar');

      await expect(request('GET', `${BASE}/peliculas/no-existe`)).rejects.toMatchObject({
        status: 404,
      });
    });

    it('filtra los asientos por función (?funcion_id=)', async () => {
      const { body } = await request<FuncionButaca[]>(
        'GET',
        `${BASE}/funcion_butaca?funcion_id=fun-001`,
      );
      expect(body.length).toBeGreaterThan(0);
      expect(body.every((fb) => fb.funcion_id === 'fun-001')).toBe(true);
      expect(body[0].butaca?.fila).toBeTruthy();
    });
  });

  describe('CRUD de películas (en memoria)', () => {
    it('crea, lista, edita y elimina una película', async () => {
      // Crear
      const creada = await request<Pelicula>('POST', `${BASE}/peliculas`, {
        titulo: 'Test CRUD',
        sinopsis: 'Película temporal de prueba',
        duracion: 90,
        clasificacion: 'PG',
        genero: 'Test',
        imagen_url: '',
        activo: true,
      });
      expect(creada.status).toBe(201);
      expect(creada.body.id).toBeTruthy();

      // Aparece en la lista
      const lista1 = await request<Pelicula[]>('GET', `${BASE}/peliculas`);
      expect(lista1.body.some((p) => p.id === creada.body.id)).toBe(true);

      // Editar
      const editada = await request<Pelicula>(
        'PATCH',
        `${BASE}/peliculas/${creada.body.id}`,
        { titulo: 'Test CRUD Editado' },
      );
      expect(editada.status).toBe(200);
      expect(editada.body.titulo).toBe('Test CRUD Editado');

      // Eliminar
      const borrada = await request('DELETE', `${BASE}/peliculas/${creada.body.id}`);
      expect(borrada.status).toBe(204);

      // Ya no está
      const lista2 = await request<Pelicula[]>('GET', `${BASE}/peliculas`);
      expect(lista2.body.some((p) => p.id === creada.body.id)).toBe(false);
    });
  });

  describe('Función nueva', () => {
    it('recibe su mapa de butacas y lo limpia al eliminar la función', async () => {
      const nueva = await request<FuncionHorario>('POST', `${BASE}/funcion_horario`, {
        pelicula_id: 'pel-002',
        sala_id: 'sala-002',
        fecha: '2026-12-01',
        hora_inicio: '19:00',
        precio: 30,
      });
      expect(nueva.status).toBe(201);
      expect(nueva.body.pelicula?.titulo).toContain('Dune');
      expect(nueva.body.sala?.nombre).toContain('VIP');

      // Tiene su mapa de butacas (sala-002 tiene 60 butacas)
      const mapa = await request<FuncionButaca[]>(
        'GET',
        `${BASE}/funcion_butaca?funcion_id=${nueva.body.id}`,
      );
      expect(mapa.body.length).toBe(60);
      expect(mapa.body.every((fb) => fb.estado === 'disponible')).toBe(true);

      // Eliminar la función limpia también su mapa
      await request('DELETE', `${BASE}/funcion_horario/${nueva.body.id}`);
      const mapa2 = await request<FuncionButaca[]>(
        'GET',
        `${BASE}/funcion_butaca?funcion_id=${nueva.body.id}`,
      );
      expect(mapa2.body.length).toBe(0);
    });

    it('rechaza funciones con película o sala inexistente', async () => {
      await expect(
        request('POST', `${BASE}/funcion_horario`, {
          pelicula_id: 'no-existe',
          sala_id: 'sala-001',
          fecha: '2026-12-01',
          hora_inicio: '10:00',
          precio: 10,
        }),
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('Reserva de asientos', () => {
    it('persiste el estado reservada al hacer PATCH', async () => {
      const mapa = await request<FuncionButaca[]>(
        'GET',
        `${BASE}/funcion_butaca?funcion_id=fun-002`,
      );
      const disponible = mapa.body.find((fb) => fb.estado === 'disponible');
      expect(disponible).toBeTruthy();

      const reservada = await request<FuncionButaca>(
        'PATCH',
        `${BASE}/funcion_butaca/${disponible!.id}`,
        { estado: 'reservada' },
      );
      expect(reservada.status).toBe(200);
      expect(reservada.body.estado).toBe('reservada');

      // El cambio persiste en la siguiente consulta
      const mapa2 = await request<FuncionButaca[]>(
        'GET',
        `${BASE}/funcion_butaca?funcion_id=fun-002`,
      );
      expect(mapa2.body.find((fb) => fb.id === disponible!.id)?.estado).toBe('reservada');
    });
  });
});
