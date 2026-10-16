import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Configuración de renderizado SSR por ruta.
 *
 * - Rutas estáticas (listas): Prerender → generadas como HTML estático en build time.
 * - Rutas dinámicas (con :id): Client → renderizadas en el navegador porque los IDs
 *   vienen del backend y no se conocen en build time.
 */
export const serverRoutes: ServerRoute[] = [
  // Rutas estáticas → prerender (SEO óptimo)
  { path: '',                 renderMode: RenderMode.Prerender },
  { path: 'peliculas',        renderMode: RenderMode.Prerender },
  { path: 'salas',            renderMode: RenderMode.Prerender },
  { path: 'butacas',          renderMode: RenderMode.Prerender },
  { path: 'funciones',        renderMode: RenderMode.Prerender },

  // Rutas dinámicas (params) → render en cliente
  { path: 'peliculas/:id',            renderMode: RenderMode.Client },
  { path: 'salas/:id',                renderMode: RenderMode.Client },
  { path: 'funciones/:id',            renderMode: RenderMode.Client },
  { path: 'funcion-butacas/:funcionId', renderMode: RenderMode.Client },

  // Fallback
  { path: '**',               renderMode: RenderMode.Client },
];
