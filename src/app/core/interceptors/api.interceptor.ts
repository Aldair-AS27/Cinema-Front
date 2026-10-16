import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor HTTP centralizado.
 *
 * RESPONSABILIDADES (alta cohesión):
 *  1. Agrega headers comunes a cada request (Content-Type, Accept).
 *  2. Captura y normaliza los errores HTTP de forma global.
 *
 * Para agregar autenticación JWT: descomenta y rellena la sección de Authorization.
 */
export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);

  // Clona y enriquece la request con headers comunes
  const enrichedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 'Authorization': `Bearer ${token}` ← descomentar cuando haya auth
    },
  });

  return next(enrichedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = buildErrorMessage(error);

      // Redirige a una pantalla de error si el servidor está caído
      if (error.status === 0) {
        console.error('[API] Sin conexión al servidor:', message);
      }

      // Redirige si el recurso no existe
      if (error.status === 404) {
        console.warn('[API] Recurso no encontrado:', req.url);
      }

      // Manejo de errores de autenticación (futuro)
      if (error.status === 401) {
        console.warn('[API] No autorizado. Redirigiendo...');
        router.navigate(['/']);
      }

      return throwError(() => ({ status: error.status, message }));
    })
  );
};

/** Extrae un mensaje legible del error HTTP */
function buildErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) return 'No se pudo conectar al servidor. Verifica tu conexión.';
  if (error.error?.message) return error.error.message;
  if (error.message) return error.message;
  return `Error ${error.status}: ${error.statusText}`;
}
