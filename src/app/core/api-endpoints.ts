import { environment } from '../../environments/environment';

/**
 * Registro centralizado de todos los endpoints del API.
 *
 * BAJO ACOPLAMIENTO: Los servicios solo importan desde aquí,
 * nunca construyen URLs manualmente.
 *
 * Para adaptar al Swagger real: ajusta las rutas de cada función
 * sin tocar ningún servicio.
 */

const base = environment.apiUrl;

export const API_ENDPOINTS = {
  peliculas: {
    getAll:   `${base}/peliculas`,
    getById:  (id: string) => `${base}/peliculas/${id}`,
    create:   `${base}/peliculas`,
    update:   (id: string) => `${base}/peliculas/${id}`,
    delete:   (id: string) => `${base}/peliculas/${id}`,
  },

  salas: {
    getAll:   `${base}/salas`,
    getById:  (id: string) => `${base}/salas/${id}`,
    create:   `${base}/salas`,
    update:   (id: string) => `${base}/salas/${id}`,
    delete:   (id: string) => `${base}/salas/${id}`,
  },

  butacas: {
    getAll:         `${base}/butacas`,
    getById:        (id: string) => `${base}/butacas/${id}`,
    getBySala:      (salaId: string) => `${base}/butacas?sala_id=${salaId}`,
    create:         `${base}/butacas`,
    update:         (id: string) => `${base}/butacas/${id}`,
    delete:         (id: string) => `${base}/butacas/${id}`,
  },

  funcionHorario: {
    getAll:         `${base}/funcion_horario`,
    getById:        (id: string) => `${base}/funcion_horario/${id}`,
    getByPelicula:  (peliculaId: string) => `${base}/funcion_horario?pelicula_id=${peliculaId}`,
    getByFecha:     (fecha: string) => `${base}/funcion_horario?fecha=${fecha}`,
    create:         `${base}/funcion_horario`,
    update:         (id: string) => `${base}/funcion_horario/${id}`,
    delete:         (id: string) => `${base}/funcion_horario/${id}`,
  },

  funcionButaca: {
    getAll:          `${base}/funcion_butaca`,
    getById:         (id: string) => `${base}/funcion_butaca/${id}`,
    getByFuncion:    (funcionId: string) => `${base}/funcion_butaca?funcion_id=${funcionId}`,
    create:          `${base}/funcion_butaca`,
    update:          (id: string) => `${base}/funcion_butaca/${id}`,
    delete:          (id: string) => `${base}/funcion_butaca/${id}`,
  },
};
