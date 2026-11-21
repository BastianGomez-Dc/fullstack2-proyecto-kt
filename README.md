# SyncPass Front (React)

Front web del proyecto **SyncPass**: **Vite + React 19 + TypeScript + Wouter**, autenticación con **AWS Amplify/Cognito**, estilos con **CSS Modules** y tokens, y **Tailwind v4** en componentes seleccionados. Desplegado en **Vercel** con proxy serverless a EC2.

- Rutas: `/` (Home) → `/login` → `/register` (y `/register?confirmar=1`) → `/cursos`* → `/notifications`* → cualquier otra (404). Las rutas marcadas con `*` pasan por `RequireAuth`.
- URL publicada: https://fullstack2-proyecto-kt.vercel.app
- Backend API: https://syncpass.duckdns.org (EC2, Ubuntu 26.04, Spring Boot 4.1.1)

## Requisitos

- Node.js 22+ / npm 10+

## Inicio rápido

```bash
npm install
npm run dev      # http://localhost:5173
```

En desarrollo, `vite.config.ts` redirige `/api` a `http://localhost:8080` (backend local, mismo origen). Para probar registro/confirmación se necesita ese backend; el login usa Cognito directamente con Amplify.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Chequeo TS (`tsc -b`) + build a `dist/` |
| `npm run preview` | Previsualiza el build |
| `npm run lint` | Linter (`oxlint`) |
| `npm test` | Pruebas con Vitest (`vitest run`: API/auth + RTL) |
| `npm run test:coverage` | Vitest + cobertura V8 (`coverage/`, umbral global 30%) |

## Estructura

```text
src/
  main.tsx              # <AuthProvider> + <App />
  App.tsx               # <Router base=BASE_URL> + Header + Switch de rutas + RequireAuth
  index.css             # tokens, reset de elementos (@layer base) y utilidades globales
  api/                  # clients HTTP tipados: client.ts, registro.ts, cursos.ts, notifications.ts
  auth/                 # cognito.ts (Amplify SRP)
  contexts/             # AuthContext.tsx (AuthProvider + useAuth)
  hooks/                # useDocumentTitle.ts
  utils/                # funciones puras: curso.ts, telefono.ts, notificaciones.ts
  components/
    atoms/              # Icon, Logo, Button*, Input*
    molecules/          # Alerta, BotonEnvio, Card, Dialogo, PassCard, Form.module.css
    organisms/          # Header, Footer, CursoForm, Menu*
    templates/          # AuthLayout, RequireAuth
  pages/
    home/ (Home + UltimosCursos)  login/  register/  cursos/  notifications/  not-found/
tests/                  # suites .test.ts/.test.tsx (Vitest + React Testing Library)
  setup.ts              # jest-dom + cleanup
coverage/               # reporte generado (text/json-summary/lcov), ignorado por git
public/                 # favicon, icons, .nojekyll
api/                    # serverless function proxy (Vercel) → reenvía /api/* a EC2
.github/workflows/      # deploy a Pages + tests/cobertura
docs/                   # documentación y decisiones
vercel.json             # build, output, rewrites (SPA fallback)
```
`*` Componentes de ejemplo de la guía 03; están clasificados pero no se usan en las páginas. Capas y convenciones en [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md).

## Documentación

En [`docs/`](./docs/README.md):

1. Nuevo proyecto Vite + React + TS
2. Estructura base
3. Crear componentes (convención y clasificación)
4. Wouter (instalación, `base` y guard)
5. Deploy en GitHub Pages
6. Registro con Cognito + BD (diseño)
7. Pendientes del registro
8. Rúbrica EVA3
9. Panel de notificaciones
10. Mantenedor de cursos
11. Estado frente a la rúbrica
12. **ARQUITECTURA** (C1/C2/C3 reales)
13. **ALCANCE** (RF/RNF, casos de uso, flujos)
14. **MOCKUPS** (vistas, estados y trazabilidad)

## Autenticación (estado real)

El login **no usa OIDC Hosted UI ni `react-oidc-context`**: `src/auth/cognito.ts` configura Amplify v6 y llama a `signIn` con **USER_SRP_AUTH** (la contraseña nunca viaja en texto plano). `obtenerSesion()` obtiene `accessToken` + `idToken`; el contexto guarda el **access token** como `token` y deriva `nombre`/`rol` de los claims del ID token (`cognito:groups`). El backend recibe `Authorization: Bearer <access token>` en las rutas `/api/*`.

Registro, confirmación y reenvío **sí pasan por el backend** (`POST /api/auth/registro`, `/auth/registro/confirmar`, `/auth/registro/reenviar-codigo`); los contratos Request están en `src/api/registro.ts`. El rol lo asigna el servidor. Las dependencias `oidc-client-ts` y `react-oidc-context` quedan en `package.json` como vestigio de un enfoque anterior, **no son el flujo actual**.

## Tests y cobertura

```bash
npm test               # 84 pruebas: API/auth/utils + RTL (componentes, páginas, guard, App/404)
npm run test:coverage  # V8: 65,44% líneas / 64,54% sentencias, umbral 30% superado
```

Los tests de API usan `fetch` simulado y los de componentes jsdom con mocks controlados: **no hay red ni Cognito real**. El reporte queda en `coverage/` (`lcov-report/index.html`, `coverage-summary.json`, `lcov.info`).

## Deploy

**Vercel (producción):** el proyecto de Vercel importa este repo de GitHub y publica cada push a `main` (las demás ramas generan *previews*). `vercel.json` compila con `npm run build`, sirve `dist/` y define un *rewrite* SPA (fallback para Wouter) + un **serverless function** (`api/proxy.ts`) que reenvía `/api/*` al backend Spring Boot en EC2. Así la SPA y la API comparten origen igual que con el proxy de Vite en desarrollo (sin CORS ni `VITE_API_BASE_URL`).

**GitHub Pages (alternativa):** cada push a `main` ejecuta el workflow `.github/workflows/deploy.yml`: instala dependencias, corre `npm run test:coverage`, publica el artifact `coverage-report`, compila con `npm run build -- --base=/fullstack2-proyecto-kt/`, agrega `404.html` como fallback SPA y despliega a GitHub Pages. Requiere **Settings > Pages > Source: GitHub Actions** una sola vez. Detalle y errores comunes en [`docs/05-github-pages.md`](./docs/05-github-pages.md).

## URLs de producción

- Front: https://fullstack2-proyecto-kt.vercel.app
- Back: https://syncpass.duckdns.org (EC2, Ubuntu 26.04, Spring Boot 4.1.1)
- Proxy: Vercel serverless function reenvía `/api/*` → EC2
