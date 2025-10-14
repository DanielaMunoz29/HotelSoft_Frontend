# Copilot Instructions for HotelSoft-Frontend

## Arquitectura General
- Proyecto Angular ubicado en `src/app/`.
- Estructura modular: `auth/` (autenticación), `core/` (servicios, modelos, interceptores), `home/`, `shared/` (componentes reutilizables).
- Flujo principal: autenticación → servicios → componentes de UI.

## Flujos de Desarrollo
- **Iniciar app:**
  - Usar `npm start` para desarrollo local.
- **Pruebas:**
  - Ejecutar `npm test` para pruebas unitarias.
- **Debug:**
  - Debug estándar de Angular; breakpoints en VS Code funcionan en `src/app/`.

## Patrones y Convenciones
- Servicios en `core/services/` siguen patrón singleton Angular (`providedIn: 'root'`).
- Modelos de datos en `core/models/`.
- Interceptores HTTP en `core/interceptors/` (ej: `jwt.interceptor.ts`).
- Componentes de autenticación en `auth/` (login, registro, 2FA, Google login, etc).
- Componentes compartidos en `shared/` (header, footer).
- Rutas definidas en `app.routes.ts`.
- Configuración global en `app.config.ts`.

## Integraciones y Dependencias
- Autenticación soporta login tradicional y Google (ver `google-auth.service.ts`).
- Proxy configurado en `proxy.conf.json` para llamadas API backend.
- Imágenes y recursos estáticos en `public/`.

## Ejemplos de patrones clave
- **Servicio de autenticación:**
  - `core/services/auth.service.ts` gestiona login, registro, sesión y tokens.
- **Interceptor JWT:**
  - `core/interceptors/jwt.interceptor.ts` añade token a cada request HTTP.
- **Componente de login:**
  - `auth/login/login.component.ts` implementa formulario reactivo y validación.

## Notas para agentes AI
- Mantener consistencia con la estructura de carpetas y nombres.
- Usar servicios para lógica de negocio y componentes para UI.
- Consultar `README.md` para contexto general del proyecto.
- Si se agregan nuevos módulos, seguir el patrón modular de Angular.
