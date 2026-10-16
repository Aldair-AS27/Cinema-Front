/**
 * Entorno de DESARROLLO conectado al backend real Spring Boot en localhost:8080.
 * `useMocks: false` activa las llamadas HTTP reales a los endpoints de la API.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  useMocks: false,
};
