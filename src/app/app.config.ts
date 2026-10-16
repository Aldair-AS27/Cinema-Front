import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { mockInterceptor } from './core/mocks/mock.interceptor';
import { environment } from '../environments/environment';

// Datos de localización en español (fechas, moneda, etc.)
registerLocaleData(localeEs);

/**
 * Configuración raíz de la aplicación.
 *
 * MOCKS vs REAL:
 *  - Si environment.useMocks === true → usa mockInterceptor (datos locales, sin red).
 *  - Si environment.useMocks === false (o undefined) → usa apiInterceptor (backend real).
 *
 * Para cambiar al backend real: pon useMocks: false en environment.development.ts
 * y actualiza apiUrl con el enlace del Swagger.
 */

// Selección dinámica del interceptor según el entorno
const interceptors = (environment as { useMocks?: boolean }).useMocks
  ? [mockInterceptor]
  : [apiInterceptor];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    { provide: LOCALE_ID, useValue: 'es' },
    provideHttpClient(
      withFetch(),
      withInterceptors(interceptors)
    ),
  ],
};
