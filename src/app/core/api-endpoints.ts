import { environment } from '../../environments/environment';

/**
 * Registro centralizado de todos los endpoints de la API Spring Boot.
 * Conectado con los controladores de backend:
 * - PeliculaController (/api/peliculas)
 * - SalaController (/api/salas)
 * - ButacaController (/api/butacas)
 * - FuncionController (/api/funciones)
 * - DulceriaController (/api/dulceria)
 * - ReservaController (/api/reservas)
 */

const base = environment.apiUrl;

export const API_ENDPOINTS = {
  peliculas: {
    getAll:   `${base}/peliculas`,
    getById:  (id: string | number) => `${base}/peliculas/${id}`,
    create:   `${base}/peliculas`,
    update:   (id: string | number) => `${base}/peliculas/${id}`,
    delete:   (id: string | number) => `${base}/peliculas/${id}`,
  },

  salas: {
    getAll:   `${base}/salas`,
    getById:  (id: string | number) => `${base}/salas/${id}`,
    create:   `${base}/salas`,
    update:   (id: string | number) => `${base}/salas/${id}`,
    delete:   (id: string | number) => `${base}/salas/${id}`,
  },

  butacas: {
    getAll:         `${base}/butacas`,
    getById:        (id: string | number) => `${base}/butacas/${id}`,
    getBySala:      (salaId: string | number) => `${base}/butacas/sala/${salaId}`,
    create:         `${base}/butacas`,
    update:         (id: string | number) => `${base}/butacas/${id}`,
    delete:         (id: string | number) => `${base}/butacas/${id}`,
  },

  funcionHorario: {
    getAll:         `${base}/funciones`,
    getById:        (id: string | number) => `${base}/funciones/${id}`,
    getByPelicula:  (peliculaId: string | number) => `${base}/funciones/pelicula/${peliculaId}`,
    getByFecha:     (fecha: string) => `${base}/funciones?fecha=${fecha}`,
    create:         `${base}/funciones`,
    update:         (id: string | number) => `${base}/funciones/${id}`,
    delete:         (id: string | number) => `${base}/funciones/${id}`,
  },

  funcionButaca: {
    getAll:          `${base}/funciones`,
    getById:         (id: string | number) => `${base}/funciones/${id}`,
    getByFuncion:    (funcionId: string | number) => `${base}/funciones/${funcionId}/butacas`,
    create:          `${base}/funciones/bloquear-butacas`,
    update:          (id: string | number) => `${base}/funciones/${id}`,
    delete:          (id: string | number) => `${base}/funciones/${id}`,
  },

  dulceria: {
    getAll:          `${base}/dulceria`,
    getByCategoria:  (categoria: string) => `${base}/dulceria/categoria/${categoria}`,
  },

  reservas: {
    create:          `${base}/reservas`,
    getByCodigo:     (codigo: string) => `${base}/reservas/${codigo}`,
  },
};
