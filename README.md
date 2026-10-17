# fs2-react-app

App base con **Vite + React + TypeScript** para el ramo FS2. Incluye ruteo con **wouter**, componentes reutilizables con CSS Modules y deploy automático a **GitHub Pages**.

- Demo: https://docentedev.github.io/fs2-react-app/
- Rutas: `/` (Home) · `/login` · `/register`

## Requisitos

- Node.js 22+ · npm 10+

## Inicio rápido

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor desarrollo con HMR |
| `npm run build` | Chequeo TS (`tsc -b`) + build a `dist/` |
| `npm run preview` | Previsualiza el build |
| `npm run lint` | Linter (`oxlint`) |

## Estructura

```
src/
  main.tsx          # entry: monta <App />
  App.tsx           # <Router> + <Menu /> + rutas
  index.css / App.css
  components/       # UI reutilizable: button, card, input, menu
  pages/            # vistas: home, login, register
public/             # favicon, icons, .nojekyll
.github/workflows/  # deploy a Pages
docs/               # guías del proyecto
```

- `components/`: piezas sin noción de ruta, con CSS Module al lado (`Button.tsx` + `Button.module.css`).
- `pages/`: una carpeta por vista (`home/Home.tsx` → ruta `/`).
- `App.tsx` solo compone layout + rutas.

## Documentación

En [`docs/`](./docs/README.md):

1. Nuevo proyecto Vite + React + TS (crear, limpiar, dependencias)
2. Estructura base
3. Crear componentes
4. Wouter (instalación y `base`)
5. Deploy en GitHub Pages (workflow + errores comunes)

## Deploy

### Autenticación con Cognito

La configuración está en `src/main.tsx`, que monta el
`AuthProvider` de `react-oidc-context`. El botón de `/login` abre el acceso
administrado por Cognito; el proveedor procesa el retorno y el callback
elimina los parámetros OIDC de la URL.

En el cliente de aplicación de Cognito deben estar habilitados el flujo
Authorization Code y los scopes `email openid phone`. La URL de retorno
permitida debe coincidir exactamente con
`https://d84l1y8p4kdic.cloudfront.net`. Para esta aplicación de navegador,
el cliente debe estar configurado sin secreto; la librería utiliza PKCE.

`npm run build` genera los archivos para la raíz de CloudFront. Configura
el alojamiento para devolver `index.html` en las rutas de la SPA, como
`/login`. El workflow de GitHub Pages especifica su propia ruta base.
Para probar desde localhost se necesita registrar su URL de retorno en
Cognito y ajustar `redirect_uri`; la configuración entregada vuelve siempre
a CloudFront. No se ha verificado el acceso con una cuenta real.

Ejecuta `npm test` para comprobar la limpieza de la URL tras el retorno.

Cada push a `main` redespliega vía `.github/workflows/deploy.yml` (requiere **Settings > Pages > Source: GitHub Actions** una sola vez). Detalle en [`docs/05-github-pages.md`](./docs/05-github-pages.md).
