# 🎬 CinePolis — Frontend

Sistema de reservas de cine: cartelera, salas, butacas y mapa visual de asientos.
Angular 21 (standalone + signals) · SSR · HttpClient · Vitest.

## 🚀 Arrancar en local

```bash
npm install
ng serve            # http://localhost:4200
```

El primer arranque redirige `/` → `/peliculas` (cartelera).

## 🧪 Tests

```bash
ng test --watch=false
```

Cubren:
- Arranque del shell (navbar, footer, rutas básicas).
- CRUD completo del interceptor de mocks (crear/editar/eliminar persisten en memoria).
- Generación automática del mapa de butacas para funciones nuevas.
- Reserva de asientos (PATCH `estado: reservada`).

## 🔌 Mocks vs Backend real

Todo el tráfico HTTP pasa por un interceptor intercambiable (`app.config.ts`):

| Modo | Cuándo | Qué usa |
|---|---|---|
| **Mocks** | `environment.development.ts` → `useMocks: true` | `core/mocks/mock.interceptor.ts` — datos locales con persistencia en memoria (350 ms de latencia simulada) |
| **Real** | `useMocks: false` | `core/interceptors/api.interceptor.ts` → backend vía `apiUrl` |

### Cuando llegue el Swagger

1. Edita **solo** `src/environments/environment.ts`:
   ```ts
   apiUrl: 'https://TU_BACKEND_URL_REAL/api'
   ```
2. En `src/environments/environment.development.ts` pon `useMocks: false`.
3. Si las rutas del backend difieren de `/peliculas`, `/salas`, `/butacas`,
   `/funcion_horario`, `/funcion_butaca`, ajusta **solo** `src/app/core/api-endpoints.ts`.

Ningún servicio ni componente requiere cambios.

## 🗂️ Estructura

```
src/
├── environments/          # URLs y flag useMocks (dev reemplaza a prod vía fileReplacements)
└── app/
    ├── app.config.ts      # HttpClient + interceptores + locale es + Router
    ├── app.routes.ts      # Lazy loading por feature
    ├── core/
    │   ├── api-endpoints.ts     # URLs centralizadas
    │   ├── interceptors/        # api.interceptor (real)
    │   ├── mocks/               # mock.interceptor con CRUD en memoria + mock-data
    │   ├── models/              # Pelicula, Sala, Butaca, FuncionHorario, FuncionButaca
    │   └── services/            # Un servicio por entidad (getAll/getById/create/update/delete)
    ├── features/
    │   ├── peliculas/           # Cartelera: lista + detalle + form crear/editar
    │   ├── funciones/           # Programación: lista + detalle + form crear/editar
    │   ├── salas/               # Salas: lista + detalle con butacas + form crear/editar
    │   ├── butacas/             # Vista admin (tabla)
    │   └── funcion-butacas/     # 🗺️ Mapa de asientos interactivo + reserva
    └── shared/styles/           # Design tokens (azul profundo · dorado · glass blanco)
```

## 🎨 Design system

Paleta en `src/app/shared/styles/design-tokens.css`:
azul profundo (`--blue-900/950`), dorado elegante (`--gold-*`),
blanco transparente glass (`--glass`, `--glass-bdr`).
Los formularios comparten `src/app/shared/styles/form.styles.css`.
