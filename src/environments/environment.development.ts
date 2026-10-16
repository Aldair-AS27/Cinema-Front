/**
 * Entorno de DESARROLLO.
 * Mientras el backend no esté disponible, `useMocks: true` activa datos simulados locales.
 * Cuando el backend esté listo: cambia `apiUrl` y pon `useMocks: false`.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // ← URL local de desarrollo (o Swagger local)
  useMocks: true,                      // ← true = usa datos mock, false = llama al backend real
};
