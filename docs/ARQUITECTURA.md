# ARQUITECTURA (documentación C4 del front SyncPass)

> **Corte:** 2026-11-19. **Alcance:** repositorio web `fullstack2-proyecto-kt` (Vite + React 19 + TypeScript + Wouter + Tailwind v4 + AWS Amplify/Cognito).
> Este documento describe **lo que el código hace realmente**. El backend, Supabase, la app Android y AWS viven en otros repositorios/cuentas: cuando no hay evidencia aquí se marca como *no verificable en este repo*. No se afirma una URL productiva ni un despliegue de API Gateway que no conste en el código.

## Arquitectura en capas (React)

La rúbrica pide capas como *hooks, contexts, clients, components, pages, utils*. Cada una tiene su carpeta en `src/`:

| Capa (rúbrica) | Carpeta real | Contenido |
|---|---|---|
| `pages` | `src/pages/**` | Vistas ruteadas con Wouter en `App.tsx`: `home/Home` (+ `home/UltimosCursos`), `login/Login`, `register/Register`, `cursos/Cursos`, `notifications/Notifications`, `not-found/NotFound` |
| `components` | `src/components/{atoms,molecules,organisms,templates}` | UI reutilizable clasificada con Atomic Design (ver C3) |
| `hooks` | `src/hooks/` | `useDocumentTitle.ts` (hook propio). `useAuth` se exporta junto al contexto |
| `contexts` | `src/contexts/` | `AuthContext.tsx`: `AuthProvider` + `useAuth` (token, usuario, `isReady`, `iniciarSesion`, `cerrarSesion`) |
| `clients` | `src/api/` (se conserva el nombre `api`) | `client.ts` (`apiRequest`, `ApiError`) y clientes tipados `registro.ts`, `cursos.ts`, `notifications.ts` |
| `utils` | `src/utils/` | Funciones puras, sin HTTP ni React: `curso.ts` (validación, fechas, duración, orden), `telefono.ts` (E.164), `notificaciones.ts` (formato del historial) |
| Servicio de identidad | `src/auth/` | `cognito.ts`: Amplify v6 (SRP), mensajes de error y claims → `Usuario` |

Dependencias: `pages` usa `components`, `hooks`, `contexts`, `api` y `utils`; `contexts` usa `auth`; los clientes de `api` usan `api/client.ts`. `utils` no depende de otras capas salvo **tipos** (`utils/curso.ts` importa `type Curso` de `api/cursos.ts`). `mensajeDeRegistro` se queda en `api/registro.ts` porque traduce el `ApiError` del cliente HTTP.

### Clientes HTTP con tipos de Request y Response

| Cliente | Request | Response |
|---|---|---|
| `api/client.ts` | `ApiRequestOptions` (`method`, `body`, `token`, `signal`) | `Promise<T>` genérico; errores como `ApiError` (`status` + mensaje) |
| `api/registro.ts` | `DatosRegistro`, `ConfirmarRegistroRequest`, `ReenviarCodigoRequest` | `UsuarioRegistrado`; confirmar/reenviar → `void` (204) |
| `api/cursos.ts` | `CursoCreateRequest`, `CursoUpdateRequest` (`Partial`) | `Curso` / `Curso[]` (`listarCursos`, `listarCursosRecientes`, `obtenerCurso`, `crearCurso`, `editarCurso`); `desactivarCurso` → `void` |
| `api/notifications.ts` | `ManualNotificationRequest` (`roles: Rol[]`) | `NotificationResponse`; `HistorialResponse` = `HistorialItem[]` |

Las respuestas de notificaciones se validan en tiempo de ejecución (`esNotificationResponse`, `esHistorialItem`): si el backend devuelve otra forma, el cliente lanza `ApiError(502)` en vez de propagar datos mal tipados.

### Equivalencia con las capas Android/MVVM de la rúbrica

La rúbrica también describe capas Android/MVVM (`Datasource`, `Repository`, `Remote/Local`, `ViewModel`, `View`). En este repositorio **no hay app Android ni MVVM**: la equivalencia es conceptual:

| Capa de la rúbrica | Equivalente real en este repo | Ubicación |
|---|---|---|
| `View` / `Screen` | Páginas montadas por Wouter | `src/pages/**` |
| `Components` | Componentes clasificados (Atomic Design incremental) | `src/components/{atoms,molecules,organisms,templates}` |
| `ViewModel` / estado de UI | Contexto de sesión + hooks | `src/contexts/AuthContext.tsx`, `src/hooks/useDocumentTitle.ts` |
| `Repository` / `Datasource` remoto | Clientes HTTP tipados (`api`, equivale a `clients`) | `src/api/{client,registro,cursos,notifications}.ts` |
| `Datasource` local | **No hay datos locales**: los cursos vienen del backend (`/api/cursos`, `/api/cursos/recientes`); Amplify guarda la sesión de Cognito en `localStorage` | — |
| Servicio de identidad | Cliente Cognito (Amplify) | `src/auth/cognito.ts` |
| Offline / Room / sincronización | **No presente** (backlog de la app Android, otro repo) | — |

El nombre `api` se conserva: equivale a la capa *clients* y no se renombra.

## C1 — Contexto del sistema

```mermaid
flowchart LR
    U[Participante / organizador\n navegador web] --> SPA[SyncPass SPA\n React + Wouter]
    A[Administrador\n navegador web] --> SPA
    SPA --> C[(AWS Cognito\n User Pool)]
    SPA --> B[Backend REST SyncPass\n repo monolito_backend_syncpass]
    B --> D[(Base de datos\n Supabase*)]
    B --> C
    O[Despliegue web\n GitHub Pages / EC2 / CloudFront*] -.sirve assets.- SPA
```

\* El despliegue y Supabase se mencionan en `docs/06`/`docs/07` y en los scripts de `scripts/`, pero **no se verifican desde este repositorio**. No se declara una URL productiva: `vite.config.ts` usa `base: '/'` y el workflow de Pages compila con `--base=/fullstack2-proyecto-kt/`.

**Interacciones C1**
- El usuario abre la SPA en el navegador; la SPA es estática (Vite build en `dist/`).
- La SPA habla con Cognito para **login** (Amplify SRP) y con el backend para **registro, confirmación, reenvío, cursos (incluido el listado público de recientes de la portada) y notificaciones**.
- El backend valida el JWT y aplica la autorización real; la SPA solo oculta controles por rol.
- **API Gateway:** aparece solo como cambios sin commitear en el repo del backend (ver `docs/07-pendientes-registro.md`, T6/P6.5); **no está desplegado ni verificado** y no se dibuja como eslabón activo.

## C2 — Contenedores (topología real verificable)

```mermaid
flowchart TD
    subgraph Navegador
      SPA[SPA React 19 + Wouter]
      CTX[contexts/AuthContext / useAuth]
      API[api/client.ts + clientes tipados]
      GUARD[RequireAuth]
      SPA --> CTX --> GUARD --> SPA
      SPA --> API
    end
    COG[(AWS Cognito\n us-east-1_AwWWrn8Ib\n app client 47v1...)]
    BE[Backend REST syncpass\n /api/auth/registro\n /api/cursos\n /api/notifications]
    DB[(Supabase*)]

    SPA -- "Amplify signIn (SRP)\n fetchAuthSession" --> COG
    API -- "HTTPS/mismo origen\n Authorization: Bearer <access token>\n (sin token: registro y /cursos/recientes)" --> BE
    BE -- "SignUp / ConfirmSignUp\n (Admin* con credenciales del backend)" --> COG
    BE --> DB
```

Notas C2:
- En desarrollo, `vite.config.ts` hace proxy de `/api` a `http://localhost:8080`: **mismo origen**, sin CORS.
- `api/client.ts` construye la base desde `VITE_API_BASE_URL ?? '/api'`, adjunta `Content-Type` cuando hay cuerpo y `Authorization: Bearer <token>` cuando hay token. Los errores se normalizan en `ApiError` leyendo `data.error`.
- `auth/cognito.ts` entrega a `contexts/AuthContext.tsx` el **access token** (`accessToken.toString()`), que el contexto guarda como `token`, y construye el `Usuario` desde los claims del **ID token** (`preferred_username` → `email` → `cognito:username` → `sub`; rol desde `cognito:groups`). El access token es el que acepta el backend (según `docs/07`).
- No se ha ejecutado ninguna llamada real a Cognito ni al backend desde este repo: las pruebas simulan `fetch` y los módulos de Amplify.

## C3 — Componentes (React)

```mermaid
flowchart TD
    MAIN[main.tsx\n AuthProvider + App] --> APP[App.tsx\n Router base=BASE_URL + Switch]
    APP --> H[organisms/Header]
    APP --> R[Switch de rutas]
    R --> P1[pages/home/Home]
    R --> P2[pages/login/Login]
    R --> P3[pages/register/Register]
    R --> G[templates/RequireAuth]
    G --> P4[pages/cursos/Cursos]
    G --> P5[pages/notifications/Notifications]
    R --> P6[pages/not-found/NotFound]
    P1 --> UC[pages/home/UltimosCursos]
    P1 --> F[organisms/Footer]
    P1 --> PC[molecules/PassCard]
    H & F & PC --> LG[atoms/Logo]
    P2 --> AL[templates/AuthLayout]
    P3 --> AL
    AL --> PC
    P4 --> CF[organisms/CursoForm]
    P4 & CF --> DLG[molecules/Dialogo]
    P2 --> M[molecules/Alerta + BotonEnvio]
    P3 --> M
    P5 --> BTN[molecules/BotonEnvio]
    P1 & P2 & P3 & P4 & P5 & P6 --> DT[hooks/useDocumentTitle]
    P1 & P2 & P4 & P5 & H & G --> CTX[contexts/AuthContext / useAuth]
    CTX --> COG[auth/cognito.ts]
    P3 --> APIR[api/registro.ts]
    UC & P4 --> APIC[api/cursos.ts]
    P5 --> APIN[api/notifications.ts]
    APIR & APIC & APIN --> CL[api/client.ts]
    UC & P4 & CF --> UTC[utils/curso.ts]
    P3 --> UTT[utils/telefono.ts]
    P5 --> UTN[utils/notificaciones.ts]
```

### Capas de componentes (Atomic Design incremental)

| Nivel | Componentes | Responsabilidad |
|---|---|---|
| `atoms` | `Icon`, `Logo`, `Button`, `Input` | Piezas indivisibles sin estado de negocio. `Logo` usa Tailwind. `Button`/`Input` son ejemplos de la guía 03 y no se usan en las páginas. |
| `molecules` | `Alerta`, `BotonEnvio`, `Card`, `Dialogo`, `PassCard` | Grupos simples. `Alerta` y `Card` usan Tailwind; `Dialogo` envuelve el `<dialog>` nativo (detalle, desactivar y descartar cambios); `Form.module.css` lo comparten `BotonEnvio`, `Login` y `Register`. `Card` es ejemplo sin uso. |
| `organisms` | `Header`, `Footer`, `CursoForm`, `Menu` | Bloques con navegación, sesión o formularios completos. `Footer` usa Tailwind. `Menu` es ejemplo sin uso. |
| `templates` | `AuthLayout`, `RequireAuth` | Estructura de pantalla (login/registro) y guard de ruta reutilizable. `RequireAuth` usa Tailwind. |

Los componentes con CSS Module lo tienen junto al `.tsx`; los migrados a Tailwind (`Logo`, `Alerta`, `Card`, `Footer`, `RequireAuth`) ya no tienen CSS Module. La reclasificación por niveles **no cambió markup, estilos ni comportamiento**; los ejemplos sin uso se clasificaron, no se eliminaron.

### Tailwind de forma acotada

`src/tailwind.css` importa solo `theme` + `utilities` de Tailwind v4 (**sin preflight**, porque `src/index.css` ya define reset y tokens) y declara el orden de capas `@layer theme, base, utilities;` (el mismo que encabeza `index.css`):

- El reset de elementos de `index.css` (`h1`–`h4`, `p`, controles de formulario, `:focus-visible`) vive en `@layer base`, **por debajo de las utilidades**, como haría el preflight. Así `mt-4` o `text-white` pueden ajustar un `<p>` o un `<h2>`. (Antes ese reset no tenía capa y anulaba, por ejemplo, los márgenes `mt-*` de los textos de la 404.)
- Los tokens (`:root`), `.container`, `.sr-only`, `.saltar-contenido` y los **CSS Modules** siguen sin capa y ganan cualquier conflicto. Por eso, al migrar un componente, se borra su regla del CSS Module; y por eso `.container` de `index.css` prevalece sobre la utilidad `container` que Tailwind genera al encontrar esa clase.
- `@theme` agrega `--animate-aparecer` y `@keyframes aparecer` (usa los tokens `--duracion` y `--curva-salida`) para la entrada de `Alerta`.

Dónde se usa:

| Nivel | Archivo | Uso |
|---|---|---|
| atom | `components/atoms/Logo.tsx` | Tipografía y color según `claro`; relleno del isotipo con `fill-[var(--color-primario)]` |
| molecule | `components/molecules/Alerta.tsx` | Tonos error/éxito elegidos por prop (`--color-error*`, `--color-exito*`), `animate-aparecer` |
| molecule | `components/molecules/Card.tsx` | Ejemplo de la guía 03 (sin uso en páginas), mismos valores que su CSS anterior |
| organism | `components/organisms/Footer.tsx` | Grilla responsive (`grid-cols-[1fr_1fr]`, `md:grid-cols-[2fr_1fr_1fr]`, `max-md:col-span-full`), `hover:`/`focus-visible:` en los enlaces |
| template | `components/templates/RequireAuth.tsx` | Estados «Verificando la sesión…» / «Redirigiendo…» centrados |
| page | `pages/not-found/NotFound.tsx` | Vista 404 completa |
| page | `pages/notifications/Notifications.tsx` | Solo la lista del historial (el resto de la página usa su CSS Module) |

Convención: los colores, radios y sombras salen de los tokens de `index.css` con valores arbitrarios (`bg-[var(--color-...)]`, `text-[var(--color-...)]`, `rounded-[var(--radio-md)]`); en `border` y `outline` se indica el tipo (`border-[color:var(--...)]`, `outline-[color:var(--...)]`) porque con `var()` Tailwind no puede distinguir ancho de color. El resto de la app (`Header`, `Home`, `UltimosCursos`, `Login`, `Register`, `Cursos`, `CursoForm`, `Dialogo`, `PassCard`, `AuthLayout`, `BotonEnvio`) sigue con CSS Modules y los mismos tokens.

## Flujos reales

### Login, restauración y Bearer

```mermaid
sequenceDiagram
    actor U as Usuario
    participant L as pages/login/Login
    participant C as AuthContext
    participant A as auth/cognito (Amplify)
    participant B as Backend /api

    U->>L: correo + contraseña
    L->>L: valida campos (noValidate)
    L->>C: iniciarSesion(correo, password)
    C->>A: signIn (USER_SRP_AUTH)
    A-->>C: isSignedIn / nextStep
    C->>A: fetchAuthSession
    A-->>C: access + ID token
    C-->>L: token (access) + Usuario (claims del ID)
    L->>L: navigate("/")
    U->>B: acciones con Authorization: Bearer <access token>
```

Restauración al recargar: `AuthProvider` ejecuta `obtenerSesion()` en un `useEffect`; con sesión válida guarda token/usuario y siempre marca `isReady = true` en `finally`. `RequireAuth` espera `isReady`, exige `isAuthenticated` y `token`, y redirige a `/login` (con `navigate('/login', {replace:true})`, respetando el `base` del `Router`). El parámetro `roles` es opcional; en `App.tsx` las rutas `/cursos` y `/notifications` se envuelven solo con la comprobación de sesión/token, por lo que el panel mantiene su mensaje de «Acceso denegado» para roles no administradores.

### Registro / confirmación / reenvío

```mermaid
sequenceDiagram
    actor U as Usuario
    participant R as pages/register/Register
    participant API as api/registro.ts
    participant B as Backend /api/auth/registro*

    U->>R: nombre, correo, teléfono, contraseña
    R->>R: normaliza y valida teléfono E.164 (utils/telefono) y requisitos de contraseña
    R->>API: registrarUsuario({nombre,email,telefono,password})
    API->>B: POST /auth/registro (sin rol)
    B-->>R: 201
    R->>R: etapa "confirmar"
    U->>R: código de 6 dígitos
    R->>API: confirmarRegistro({email,codigo})
    API->>B: POST /auth/registro/confirmar
    B-->>R: 204 → etapa "listo" → /login
    opt reenvío
      R->>API: reenviarCodigo({email})
      API->>B: POST /auth/registro/reenviar-codigo
    end
```

`/register?confirmar=1` abre directo la etapa de confirmación (lo usan el login y el pie de página).

### Últimos cursos en la portada

```mermaid
sequenceDiagram
    actor V as Visitante o usuario
    participant H as pages/home/UltimosCursos
    participant API as api/cursos.ts
    participant B as Backend /api/cursos/recientes

    V->>H: abre /
    H->>H: 3 tarjetas esqueleto + «Cargando los últimos cursos…»
    H->>API: listarCursosRecientes(3, signal)
    API->>B: GET /cursos/recientes?limite=3 (sin token)
    alt respuesta con cursos
      B-->>H: Curso[] (activos, del más nuevo al más antiguo)
      H->>H: tarjetas + «Ver todos los cursos»
    else lista vacía
      B-->>H: []
      H->>H: «Aún no hay cursos publicados»
    else error de red o del servidor
      B-->>H: error
      H->>H: mensaje + «Intentar de nuevo» (repite la petición)
    end
```

El endpoint es público: el backend acota `limite` entre 1 y 12 y excluye los cursos `FINALIZADO`. Si el usuario sale de la portada antes de la respuesta, el `AbortController` cancela la petición. El botón de cada tarjeta depende de la sesión: «Inscribirme» (visitante → `/register`) o «Ver detalles» (autenticado → `/cursos`).

### Cursos y notificaciones

Tras el guard, `Cursos` carga `listarCursos(token)`. Todos los roles ven la tabla y el **diálogo de detalle**; el administrador además crea y edita con `CursoForm` (se descarga aparte con `React.lazy`) y desactiva tras confirmar en un **diálogo** (`molecules/Dialogo`, `<dialog>` nativo). Las acciones de administrador se ocultan para otros roles, pero **la autorización efectiva la aplica el backend**. El formulario valida con `validarCurso` (`utils/curso.ts`) las mismas reglas que el backend; entre ellas, **la fecha de término debe ser igual o posterior a la de inicio** (el calendario de término usa `min`, el error aparece apenas ambas fechas están elegidas y el envío se bloquea; el backend responde 400 si llegara una fecha invertida).

`Notifications` exige rol `ADMINISTRADOR` en la UI, envía `enviarNotificacionManual({titulo,cuerpo,roles}, token)` y consulta `getHistorial(token)`.

**Historial:** `getHistorial(token): Promise<HistorialResponse>` (`HistorialItem[]`). `HistorialItem` copia el record `HistorialItem` de `NotificationController` en el backend: `id`, `titulo`, `cuerpo`, `roles` (vacío o `null` = todos los usuarios activos), `enviadoEn` (`LocalDateTime` sin zona) y `dispositivosEnviados`. El cliente valida cada registro y lanza `ApiError(502)` si no cumple el contrato. La UI muestra cada envío con fecha y hora (`utils/notificaciones.ts`), destinatarios y dispositivos. **El backend hoy devuelve siempre `[]`** (no hay tabla de historial), así que en uso real se ve «Aún no hay notificaciones en el historial»; la lista se prueba con datos simulados.

## Pruebas y evidencia

- `npm test` → Vitest, **84 pruebas en 16 archivos**: 39 unitarias en entorno `node` con `fetch` simulado (`auth`, `cognito`, `cursos`, `registro`, `notifications`, `curso-validacion`, `telefono`, `notificaciones-formato`) y 45 de componentes con jsdom + React Testing Library (`app`/404, `login`, `require-auth`, `curso-form`, `cursos-page`, `ultimos-cursos`, `notifications-page`, `componentes-tailwind`). Los mocks son controlados: sin red ni Cognito real.
- `npm run test:coverage` → V8, salida `text`, `json-summary` y `lcov` en `coverage/`. Umbral global 30% en líneas, sentencias, funciones y ramas; resultado real: 65,44% líneas / 64,54% sentencias / 65,56% funciones / 68,07% ramas.
- `npm run lint` (oxlint) y `npm run build` (`tsc -b && vite build`) sin errores.
