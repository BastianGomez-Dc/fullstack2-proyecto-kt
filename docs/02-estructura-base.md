# 02 — Estructura base del proyecto

Estructura real de `fs2-react-app`:

```
fs2-react-app/
  .github/workflows/deploy.yml  # deploy a GitHub Pages
  docs/                         # esta documentación
  index.html                    # entry HTML (título, favicon, fuentes, /src/main.tsx)
  package.json                  # scripts + dependencias (react, react-dom, wouter)
  vite.config.ts                # config Vite + base '/fs2-react-app/'
  public/
    favicon.svg
    icons.svg
    .nojekyll                   # desactiva Jekyll en GitHub Pages
  src/
    main.tsx                    # entry: monta <App /> dentro de <AuthProvider>
    App.tsx                     # shell: <Router> + enlace "Saltar al contenido" + <Header /> + <Switch> de rutas
    index.css                   # tokens de diseño (colores, radios, sombras, movimiento), reset y utilidades globales
    api/                        # llamadas al backend (client.ts, registro.ts)
    auth/                       # sesión con Cognito (cognito.ts, AuthContext.tsx)
    data/                       # datos estáticos (cursos.ts: catálogo de ejemplo)
    components/                 # UI reutilizable (dumb components), cada uno con su CSS Module
      header/Header.tsx         # encabezado común: navegación, menú móvil, estado de sesión
      footer/Footer.tsx         # pie de página
      logo/Logo.tsx             # isotipo + nombre
      icon/Icon.tsx             # set de íconos SVG (<Icon nombre="qr" />)
      pass/PassCard.tsx         # ilustración del pase digital con QR (decorativa)
      auth-layout/AuthLayout.tsx # diseño de login y registro: panel de marca + formulario
      form/                     # Form.module.css compartido, Alerta.tsx, BotonEnvio.tsx
      button/ card/ input/ menu/ # componentes de ejemplo de la guía 03 (no se usan en las páginas)
    pages/                      # vistas asociadas a rutas (smart components)
      home/Home.tsx             # ruta /
      login/Login.tsx           # ruta /login
      register/Register.tsx     # ruta /register (también /register?confirmar=1)
      not-found/NotFound.tsx    # cualquier otra ruta
      hooks/useDocumentTitle.ts
  dist/                         # build (generado, no se commitea)
```

## Convención

- `components/`: piezas reutilizables sin noción de ruta. Reciben props (`Header`, `AuthLayout`, `Icon`...).
- `pages/`: una carpeta por vista, con el nombre capitalizado igual que el componente (`home/Home.tsx` → `Home`). Cada página pone su propio `<main id="contenido">`.
- Cada componente visual vive con su CSS Module al lado: `Header.tsx` + `Header.module.css`.
- Los colores, radios, sombras y duraciones salen de los tokens de `index.css` (`var(--color-primario)`, `var(--radio-md)`...). No se escriben colores sueltos en los componentes.
- Los íconos se agregan en `components/icon/Icon.tsx` y se usan con `<Icon nombre="..." />`; no se copian SVG en las páginas.
- `App.tsx` es solo composición: layout (`Header`) + ruteo (`Switch`/`Route`). No lleva lógica de negocio.
- `main.tsx` no se toca salvo para providers globales (tema, store, etc.).

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
