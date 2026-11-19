# 02 — Estructura base del proyecto

Estructura real de `fs2-react-app` (corte 2026-11-19):

```text
fs2-react-app/
  .github/workflows/deploy.yml  # tests/cobertura + build + deploy a GitHub Pages
  docs/                         # esta documentación (incluye ARQUITECTURA/ALCANCE/MOCKUPS)
  index.html                    # entry HTML (título, favicon, fuentes, /src/main.tsx)
  package.json                  # scripts + dependencias
  vite.config.ts                # plugin React + Tailwind, base '/' y proxy /api → :8080
  vitest.config.ts              # jsdom, setup, cobertura V8 y umbral 30%
  public/
    favicon.svg
    icons.svg
    .nojekyll                   # desactiva Jekyll en GitHub Pages
  src/
    main.tsx                    # entry: <AuthProvider> + <App />, importa index.css y tailwind.css
    App.tsx                     # <Router base=BASE_URL> + salto de contenido + Header + Switch + RequireAuth
    index.css                   # tokens de diseño, reset de elementos (@layer base) y utilidades globales
    tailwind.css                # Tailwind v4: solo theme + utilities (sin preflight) + animación aparecer
    api/                        # clients HTTP tipados: client.ts, registro.ts, cursos.ts, notifications.ts
    auth/                       # cognito.ts (Amplify SRP)
    contexts/                   # AuthContext.tsx (AuthProvider + useAuth)
    hooks/                      # useDocumentTitle.ts
    utils/                      # funciones puras: curso.ts, telefono.ts, notificaciones.ts
    components/                 # UI reutilizable, agrupada por niveles (Atomic Design incremental)
      atoms/                    # Icon, Logo†, Button*, Input*
      molecules/                # Alerta†, BotonEnvio, Card*†, Dialogo, PassCard, Form.module.css
      organisms/                # Header, Footer†, CursoForm, Menu*
      templates/                # AuthLayout, RequireAuth†
    pages/                      # vistas asociadas a rutas
      home/Home.tsx             # / (+ home/UltimosCursos.tsx: últimos cursos del endpoint público)
      login/Login.tsx           # /login
      register/Register.tsx     # /register y /register?confirmar=1
      cursos/Cursos.tsx         # /cursos (protegida)
      notifications/Notifications.tsx # /notifications (protegida)
      not-found/NotFound.tsx    # cualquier otra ruta (Tailwind)
  tests/                        # *.test.ts / *.test.tsx + setup.ts (Vitest + RTL)
  coverage/                     # reporte generado (ignorado por git)
  dist/                         # build (generado, no se commitea)
```
`*` Componentes de ejemplo sin uso en las páginas; se clasificaron, no se eliminaron. `†` Componentes con utilidades de Tailwind, sin CSS Module.

## Convención

- `components/`: piezas reutilizables sin noción de ruta, organizadas en `atoms/`, `molecules/`, `organisms/` y `templates/` según su responsabilidad. La reclasificación **no cambió markup, estilos ni comportamiento**.
- `pages/`: una carpeta por vista, con el nombre capitalizado igual que el componente. Cada página pone su propio `<main id="contenido">`.
- Cada componente visual usa **o** su CSS Module al lado (`Header.tsx` + `Header.module.css`) **o** utilidades de Tailwind (`Logo`, `Alerta`, `Card`, `Footer`, `RequireAuth`, `NotFound`, lista del historial). No se mezclan en un mismo elemento: el CSS Module (sin capa) ganaría.
- Los colores, radios, sombras y duraciones salen de los tokens de `index.css` (`var(--color-primario)`, `var(--radio-md)`, ...). Tailwind los referencia con valores arbitrarios (`bg-[var(--color-primario)]`); preflight está desactivado y el reset propio vive en `@layer base`, debajo de las utilidades.
- `hooks/` guarda hooks propios, `contexts/` los contextos de React y `utils/` funciones puras (sin HTTP ni React) que se prueban en entorno `node`.
- Los íconos se definen en `components/atoms/Icon.tsx` y se usan con `<Icon nombre="..." />`.
- `App.tsx` es composición: layout + ruteo + guard. No lleva lógica de negocio.
- `main.tsx` solo monta providers globales (`AuthProvider`).
- `api/` conserva ese nombre; equivale a la capa de *clients/datasource remoto* de la rúbrica (no se renombra a `clients`). Cada cliente declara sus tipos de Request y Response. Ver [ARQUITECTURA.md](./ARQUITECTURA.md).

## Pruebas

- Los tests unitarios de API/auth están en `tests/*.test.ts` con entorno `node` y `fetch` simulado.
- Los tests de componentes están en `tests/*.test.tsx` con jsdom + React Testing Library y mocks controlados (sin red/Cognito real).
- `npm run test:coverage` escribe `text`, `json-summary` y `lcov` en `coverage/` con umbral global 30%.

## Cómo iniciar el proyecto (clon fresco)

```bash
git clone <url-del-repo>
cd fs2-react-app
npm install
npm run dev
```

- Dev: `http://localhost:5173`
- Build: `npm run build` → genera `dist/`
- Preview: `npm run preview`
- Tests: `npm test` y `npm run test:coverage`
