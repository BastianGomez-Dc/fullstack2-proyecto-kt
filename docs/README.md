# Documentación fs2-react-app (SyncPass)

Guías y documentación del proyecto con Vite + React + TypeScript.

## Índice

1. [Nuevo proyecto Vite + React + TS](./01-nuevo-proyecto-vite.md) — crear, limpiar template, instalar dependencias, correr.
2. [Estructura base](./02-estructura-base.md) — estructura real, capas Atomic y convenciones.
3. [Crear componentes](./03-componentes.md) — convención (CSS Module o Tailwind), niveles Atomic Design y ejemplos.
4. [Wouter: instalación y configuración](./04-wouter.md) — routing, `base` y `RequireAuth`.
5. [Deploy en GitHub Pages](./05-github-pages.md) — workflow, tests/cobertura, configuración y errores comunes.
6. [Registro con Cognito + BD](./06-registro-cognito-bd.md) — diseño y requisitos de seguridad (documento histórico: parte describe decisiones ya superadas, ver 07).
7. [Registro: qué falta](./07-pendientes-registro.md) — estado real, tareas pendientes y preguntas para el usuario.
8. [Rúbrica EVA3](./08-desarrollo-ev3.md) — requisitos y ponderaciones.
9. [Panel de notificaciones push](./09-panel-notificaciones.md) — integración web del envío manual y del historial tipado.
10. [Mantenedor de cursos](./10-mantenedor-cursos.md) — catálogo y operaciones administrativas.
11. [Estado de avance EVA3](./11-estado-ev3.md) — requisitos comprobables en este repo, pendientes y evidencia.
12. **[ARQUITECTURA](./ARQUITECTURA.md)** — capas (pages, components, hooks, contexts, api, utils), tipos Request/Response, C1/C2/C3 reales, Tailwind y flujos.
13. **[ALCANCE](./ALCANCE.md)** — RF/RNF, casos de uso, flujos, reglas de rol e implementado/parcial/backlog.
14. **[MOCKUPS](./MOCKUPS.md)** — wireframes de todas las vistas y estados + trazabilidad a archivos y tests.

## Comandos rápidos

```bash
npm install          # instala dependencias
npm run dev          # desarrollo en http://localhost:5173
npm run build        # chequeo TS + build a dist/
npm run preview      # previsualiza el build
npm run lint         # lint con oxlint
npm test             # Vitest (API/auth + React Testing Library)
npm run test:coverage # cobertura V8 en coverage/
```

> Nota: la autenticación real es Amplify SRP (`aws-amplify/auth`), no el flujo OIDC Hosted UI descrito en documentos históricos. Ver [ARQUITECTURA.md](./ARQUITECTURA.md).
