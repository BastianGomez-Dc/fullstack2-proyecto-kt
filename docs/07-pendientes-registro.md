# Registro con Cognito + base de datos: qué falta (especificación de pendientes)

> **Fecha:** 2026-10-24.
> **Para quién:** una IA (o persona) que va a terminar, verificar y desplegar el registro de usuarios de SyncPass.
> **Documento anterior:** [06-registro-cognito-bd.md](./06-registro-cognito-bd.md) (diseño original y requisitos de seguridad). Este documento **no lo reemplaza**: lista lo que quedó pendiente después de implementar.

---

## 0. Reglas de trabajo (obligatorias, léelas primero)

1. **No des nada por hecho.** La sección 2 describe lo que existía al 2026-10-24, pero el código puede haber cambiado. Antes de usar cualquier dato, revísalo en los archivos y avisa si algo no coincide.
2. **No inventes datos.** Nada de IDs de pool o client, URLs, dominios, contraseñas, nombres de grupos, cadenas de conexión, IPs, límites de AWS ni cifras que no estén en el código o que no te haya dado el usuario. Si necesitas un dato, pídelo. Los valores entre `<...>` de este documento son marcadores: **pregunta el valor real**.
3. **Si no encuentras algo, detente y pregunta.** Si falta un archivo, una carpeta, un script, un recurso de AWS, una tabla o una variable, no lo crees ni lo simules por tu cuenta. Pregúntale al usuario dónde está o si hay que crearlo.
4. **Pregunta antes de decidir.** Cada tarea tiene preguntas (sección 6). Las que bloquean la tarea se responden antes de escribir código. Puedes recomendar una opción, pero espera la confirmación.
5. **La cuenta AWS es de AWS Academy (voclabs).** Tú no tienes acceso a la consola de AWS, la AWS CLI no tiene credenciales en el PC del usuario y no puedes usar la llave SSH. Todo lo que se haga en AWS (Cognito, EC2, IAM, API Gateway, SES) **lo hace el usuario**: dale los pasos exactos y pídele que confirme el resultado o te pegue la salida. Las credenciales del lab son temporales.
6. **El backend es de un compañero** (repo `feliignaciodev/monolito_backend_syncpass`) y lo usa también una app Android. Cualquier cambio de contrato, esquema o configuración compartida se avisa al usuario **antes** de hacerlo, para que lo coordine con su equipo.
7. **No toques el trabajo ajeno sin commit.** En el repo del backend hay cambios sin commit en `deploy/` (API Gateway, nginx, Parameter Store) que **no son parte del registro**. No los modifiques, no los descartes y no los incluyas en commits del registro, salvo que el usuario lo pida.
8. **Nunca subas secretos** (contraseña de la BD, credenciales AWS, llaves `.pem`, tokens). Revisa `.gitignore` antes de crear archivos con secretos.
9. **No hagas commit, push ni PR sin que el usuario lo pida.**
10. **Si un requisito de seguridad no se puede cumplir, no lo saltes en silencio.** Explica el riesgo concreto y pregunta si se acepta.
11. **Trabaja por tareas** (sección 4). Al cerrar cada una muestra qué cambió y cómo lo verificaste. Si las pruebas fallan, dilo con la salida.

---

## 1. Resumen del estado

| Área | Estado |
|---|---|
| Código del registro (backend + front) | ✅ Escrito y con pruebas automáticas en verde |
| Configuración de Cognito para el registro | ❌ Pendiente (la hace el usuario en la consola) |
| Migraciones en Supabase | ❌ Sin confirmar (el README del backend marca DB-04 como pendiente) |
| Prueba de punta a punta con servicios reales | ❌ Nunca se ejecutó |
| Commits / PR | ❌ Nada commiteado en ninguno de los dos repos |
| Impacto en la app Android (cambio de pool) | ❌ Sin coordinar con el equipo |
| Despliegue en producción (EC2 / GitHub Pages) | ❌ El registro no funciona fuera de local |
| Protecciones extra (límite de peticiones, correo, cuentas sin confirmar) | ❌ Pendientes de decidir |

---

## 2. Qué está hecho (verificar antes de confiar)

### 2.1 Decisiones ya tomadas con el usuario

No las vuelvas a discutir salvo que el usuario lo pida.

| Decisión | Valor |
|---|---|
| Backend | `monolito_backend_syncpass` (no `fs2-api`). Ruta local al 2026-10-24: `C:\Users\BastiánGómez\Desktop\projects-duoc\monolito_backend_syncpass-main` |
| User Pool | El del front: `us-east-1_AwWWrn8Ib`, App Client `47v1h6d5fb83r3cle10gsv4hjq` (están en `src/auth/cognito.ts`). En este pool el correo es el nombre de usuario. |
| Base de datos | PostgreSQL en Supabase |
| Rol de quien se registra | `BENEFICIARIO` (rol que ya existía en el backend). `ALUMNO` se descartó para no cambiar el esquema compartido con Android. |
| Flujo | El registro **pasa por el backend** (el backend llama a Cognito y escribe en la BD) |
| Login del front | Sigue directo contra Cognito con Amplify (SRP), sin pasar por el backend |
| Token hacia el backend | **Access token** (el backend rechaza ID tokens) |
| Alcance de la primera entrega | Solo local |

### 2.2 Backend (`monolito_backend_syncpass-main`)

| Archivo | Qué hace |
|---|---|
| `src/main/java/com/backendapp/demo/api/AuthController.java` | `POST /api/auth/registro` (201), `/api/auth/registro/confirmar` (204) y `/api/auth/registro/reenviar-codigo` (204) |
| `src/main/java/com/backendapp/demo/service/CognitoService.java` | `registrar` (SignUp + AdminAddUserToGroup; si falla el grupo, borra la cuenta), `confirmarRegistro` (ConfirmSignUp) y `reenviarCodigo` (ResendConfirmationCode). Traduce los errores al español. |
| `src/main/java/com/backendapp/demo/service/UsuarioService.java` | `registrar`: revisa que el correo no exista en la BD, llama a Cognito, guarda el perfil (`username = sub`, rol `BENEFICIARIO`) y, si falla la BD, borra la cuenta de Cognito |
| `src/main/java/com/backendapp/demo/dto/RegistroRequest.java`, `ConfirmarRegistroRequest.java`, `ReenviarCodigoRequest.java` | Validación de entrada. **No existe campo de rol.** |
| `src/main/java/com/backendapp/demo/config/SecurityConfiguration.java` | Los 3 endpoints nuevos son públicos (`permitAll`) |
| `src/test/java/com/backendapp/demo/RegistroTest.java`, `CognitoServiceRegistroTest.java` | 14 pruebas nuevas. Total de la suite: 47, todas en verde (H2 + Cognito simulado) |
| `README.md` | Tabla de endpoints actualizada |

Cómo correr las pruebas: `JAVA_HOME="C:/Program Files/Android/Android Studio/jbr"` y luego `./mvnw test`.

### 2.3 Front (este repo)

| Archivo | Qué hace |
|---|---|
| `src/api/registro.ts` | `registrarUsuario`, `confirmarRegistro`, `reenviarCodigo` y `mensajeDeRegistro` |
| `src/api/client.ts` | La URL base por defecto pasó de `""` a `"/api"` (se puede cambiar con `VITE_API_BASE_URL`) |
| `vite.config.ts` | En desarrollo, el proxy envía `/api` a `http://localhost:8080` |
| `src/pages/register/Register.tsx` | Tres pasos: formulario → confirmar código (con "Enviar otro código") → listo. También permite llegar directo a "Confirma tu cuenta". |
| `src/auth/cognito.ts` | Guarda el access token en la sesión. El mensaje para `UserNotConfirmedException` indica cómo confirmar la cuenta. |
| `src/pages/login/Login.module.css` | Estilos `.aviso` y `.botonEnlace` |
| `tests/registro.test.mjs` | 3 pruebas. Total: 9 en verde. `npm run build` y `npm run lint` sin errores. |

### 2.4 Lo que nunca se probó

- Ninguna llamada real a Cognito ni a Supabase.
- Que en el pool real el claim `username` del token sea igual a `sub`. El código **asume** que sí al guardar `usuario.username = sub` (ver tarea T3).
- La interfaz de `/register` en un navegador contra el backend real.

---

## 3. Requisitos de seguridad que siguen vigentes

Valen para todas las tareas. Si una tarea no puede cumplir alguno, aplica la regla 10.

- [ ] La contraseña solo viaja por **HTTPS** fuera de `localhost`. Hoy el front del EC2 está en `http://34.239.68.146`, sin HTTPS.
- [ ] El rol de quien se registra lo asigna el servidor. **No agregues un campo de rol** a `RegistroRequest`.
- [ ] El backend sigue validando firma, emisor, vencimiento, `token_use=access` y `client_id` (`SecurityConfiguration.jwtDecoder`). No lo relajes para que algo funcione.
- [ ] Nada de contraseñas, códigos de verificación ni tokens en los logs, ni en el front ni en el backend.
- [ ] El App Client del front **no tiene secreto** y así debe seguir.
- [ ] Credenciales AWS: en el EC2 se usa el rol de la instancia y en el PC el archivo `~/.aws/credentials` del lab. **Nunca** en el código, en `.env` versionado ni en `application.properties`.
- [ ] CORS: nunca `*` con credenciales. Si hace falta, solo el origen exacto del front.
- [ ] Los errores no revelan detalles internos (stack traces, SQL, nombres de tablas).
- [ ] Usar solo datos ficticios en las pruebas. El README del backend lo exige (restricción 5.1 del caso).

---

## 4. Tareas pendientes

Orden recomendado: **T1 → T2 → T3 → T4 → T5**. Después, T6 a T10 según lo que decida el usuario.

### T1. Configurar el User Pool para el registro (la hace el usuario)

**Por qué:** sin esto el registro responde 503 (auto-registro deshabilitado) o 502 (falta el grupo; la cuenta se borra).

**Cómo:** guía al usuario por la consola de Cognito, pool `us-east-1_AwWWrn8Ib` (confirma primero que sigue siendo ese), y pídele confirmación de cada punto:
1. **Grupos**: `ADMINISTRADOR` (precedencia 1), `COORDINADOR` (2), `VOLUNTARIO` (3), `BENEFICIARIO` (4). Los nombres deben coincidir **exactamente** con `Rol.java` del backend. Revisa ese archivo antes de dar los nombres.
2. **Auto-registro** habilitado (*Sign-up → Self-service sign-up*).
3. **Verificación del correo** por código (*Cognito-assisted verification*, enviar código al email).
4. **Atributos**: `email` y `name` aceptados en el registro. Pregunta si `name` es obligatorio en el pool.
5. **App Client** `47v1h6d5fb83r3cle10gsv4hjq`: permiso de escritura para `email` y `name` (*Attribute read and write permissions*).
6. **Política de contraseñas**: pide al usuario la política real y compárala con `REQUISITOS` en `src/pages/register/Register.tsx` (8+ caracteres, mayúscula, minúscula, número y símbolo). Si el pool es más estricto que el front, ajusta el front y avisa.
7. **Usuarios que ya existen en el pool** (por ejemplo, el que se usó para probar el login el 2026-10-23): no tienen grupo. Pregunta qué rol darles y que el usuario los agregue a mano.

**Verificación:** el usuario confirma cada punto. Más adelante, T3 lo comprueba en la práctica.

### T2. Preparar el entorno local con servicios reales (la hace el usuario, tú guías)

**Cómo:**
1. **Credenciales del lab**: AWS Academy → *AWS Details* → *AWS CLI*. Copiar el bloque completo, **incluido `aws_session_token`**, a `C:\Users\<usuario>\.aws\credentials`. Pregunta la ruta real. El archivo `pasos.md` del backend (paso 0.2) explica errores típicos como `ExpiredToken` o `InvalidClientTokenId`.
2. **Variables del backend** en IntelliJ (*Run → Edit Configurations → Environment variables*). Spring **no** lee `.env` en este backend:
   ```
   DB_URL=jdbc:postgresql://<host-session-pooler>:5432/postgres?sslmode=require
   DB_USER=<usuario-supabase>
   DB_PASSWORD=<contraseña>            # la escribe el usuario, nunca tú
   AWS_REGION=us-east-1
   COGNITO_USER_POOL_ID=us-east-1_AwWWrn8Ib
   COGNITO_CLIENT_ID=47v1h6d5fb83r3cle10gsv4hjq
   COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_AwWWrn8Ib
   SYNCPASS_DATOS_SEMILLA=<true|false>  # preguntar: true carga proyectos/eventos ficticios si la BD no tiene proyectos
   ```
   Confirma los IDs del pool y del client leyendo `src/auth/cognito.ts` del front. Usa el **Session pooler** de Supabase, no la *Direct connection* (`pasos.md` del backend explica por qué).
3. **Migraciones**: al arrancar, Flyway aplica V1 y V2. Pide al usuario que confirme en el log `Successfully applied` (o que ya estaban aplicadas) y `Started SyncPassApiApplication`. Pregunta si la BD de Supabase es compartida con el equipo: si lo es, **arrancar el backend puede crear tablas y datos semilla en una BD que otros usan**.
4. Front: `npm run dev` y abrir `http://localhost:5173/register`.

**Verificación:** el backend arranca sin errores y `GET http://localhost:8080/api/health` responde 200.

### T3. Prueba de punta a punta con servicios reales

**Cómo:** guía al usuario por estos casos. Usa un correo real que el usuario controle (para recibir el código), pero datos de nombre ficticios. Pide capturas o salidas cuando haga falta.

| # | Caso | Resultado esperado |
|---|---|---|
| 1 | Registro con datos válidos | 201. Llega el correo con el código. Aparece la fila en `usuario` (Supabase → Table editor) con rol `BENEFICIARIO` y `cognito_sub` = sub del usuario en Cognito. El usuario aparece en el grupo `BENEFICIARIO`. |
| 2 | Confirmar con un código incorrecto | 400 "El código no es correcto" |
| 3 | "Enviar otro código" | 204, llega un correo nuevo |
| 4 | Confirmar con el código correcto | 204. En Cognito queda *Confirmed*. |
| 5 | Login en `/login` con esa cuenta | Entra. El rol del usuario en el front es `BENEFICIARIO`. |
| 6 | Registrar de nuevo el mismo correo | 409 "Ya existe una cuenta con ese email" |
| 7 | Enviar `"rol":"ADMINISTRADOR"` en el cuerpo (con la pestaña Red o curl) | Se ignora, queda `BENEFICIARIO` |
| 8 | Login antes de confirmar (con otra cuenta nueva) | Mensaje que lleva a "Confirma tu cuenta" |
| 9 | Pestaña Red | Ninguna petición al backend lleva tokens en la URL; la contraseña solo va en el cuerpo de `/api/auth/registro` |

**Comprobar la suposición `username = sub`:** después del caso 5, pide al usuario el **access token** (en DevTools → Application → Local Storage, la clave de Amplify que termina en `accessToken`) y decodifícalo **localmente**, sin pegarlo en sitios web. Compara los claims `username` y `sub`:
- Si son iguales: no hay que hacer nada.
- Si son distintos: el registro guarda `username = sub`, pero el login del backend (`UsuarioService.login`, usado por Android) usa el claim `username`. El perfil se sigue encontrando por `cognito_sub`, así que funciona, pero la columna queda inconsistente. Propón al usuario guardar el `username` real (obtenido con `AdminGetUser`) y espera su decisión.

**Si algo falla:** revisa el log del backend (los errores de Cognito se registran en `CognitoService.servicioNoDisponible`) y la tabla de problemas de `pasos.md`. No cambies el código hasta entender la causa.

### T4. Commits y PR

**Cómo:**
- **Front (este repo):** pregunta si commitear en `main` (como se ha hecho hasta ahora) o en una rama. Los archivos son los de la sección 2.3, más este documento.
- **Backend (repo del compañero):** recomienda **una rama y un PR**, no commit directo en `main`, porque el repo es compartido. Incluye **solo** los archivos de la sección 2.2. **No incluyas** `deploy/*` (regla 7). Pregunta el nombre de la rama y si el usuario tiene permiso de push en ese repo (el remoto es `https://BastianGomez-Dc@github.com/feliignaciodev/monolito_backend_syncpass.git`; verifica que no haya cambiado).
- La descripción del PR debe incluir el cambio de pool y el impacto en Android (T5).

### T5. Coordinar el impacto en la app Android

**Contexto:** el backend estaba pensado para el pool `syncpass-dev` que crea `deploy/cognito-setup.ps1`. Ese pool usa nombres de usuario normales con el correo como alias, solo permite altas por administrador, usa `USER_PASSWORD_AUTH`, tiene access token de 12 h y tiene usuarios demo `coordinador`, `voluntario` y `admin`. Si el backend apunta al pool del front:
- Los usuarios demo **no existen** en el pool del front, y sus nombres (`coordinador`, etc.) no son correos.
- `POST /api/auth/login` (el que usa Android) necesita `ALLOW_USER_PASSWORD_AUTH` en el App Client. Pregunta si el client del front lo tiene.
- La duración del access token puede ser distinta a 12 h. Pide al usuario el valor real del client del front.
- `cognito-setup.ps1`, `pasos.md` y `.env.example` del backend siguen describiendo `syncpass-dev`.

**Cómo:** no decidas tú. Presenta las opciones de la pregunta P5.1 y, según la respuesta, actualiza la documentación del backend y, si corresponde, guía al usuario para crear los usuarios demo en el pool del front (con correos ficticios; pregunta cuáles).

### T6. Despliegue en producción

**Contexto actual:**
- El front se publica en **dos lugares**: el EC2 `http://34.239.68.146` (Nginx sirve `/var/www/kt`, script `scripts/deploy-ec2.ps1`) y **GitHub Pages** (`.github/workflows/deploy.yml`, se publica con cada push a `main`). En ninguno existe `/api`, así que hoy el registro publicado falla con 404 o 405.
- El backend tiene scripts para EC2 + Nginx + HTTPS en `deploy/`. Además, hay **cambios sin commit** que ponen **API Gateway** delante del backend (encabezado `X-Origin-Verify`). `parameter-store.ps1` menciona un script `apigateway-setup.ps1` que **no está en el repo**: pregunta dónde está o si falta crearlo. No lo crees por tu cuenta.
- El backend **no tiene configuración de CORS**. Si el front llama al backend desde otro origen, el navegador bloquea las peticiones.

**Cómo (depende de las respuestas a P6.x):**
- **Opción A, mismo origen:** el Nginx del front reenvía `/api/` al backend, sea por IP privada, localhost si están en la misma instancia, o la URL de API Gateway. Así no hace falta CORS y `VITE_API_BASE_URL` puede seguir vacío. Tú escribes el bloque `location /api/`, el usuario lo instala. Si hay API Gateway con `X-Origin-Verify`, ese secreto **no** puede quedar en el repo.
- **Opción B, otro origen:** compilar el front con `VITE_API_BASE_URL=https://<url-del-backend>/api` y agregar CORS en el backend **solo** para los orígenes exactos del front (pregunta cuáles). Esto requiere cambiar el backend compartido: avisa (regla 6).
- **GitHub Pages:** pregunta si el registro debe funcionar ahí. Si no, considera mostrar un aviso o desactivar el registro en ese build. Pregunta antes.
- **HTTPS (bloqueante):** el registro envía la contraseña al backend, así que el backend debe estar en HTTPS. Además, una página servida por HTTP puede ser alterada en tránsito aunque llame a una API HTTPS, así que lo correcto es que **el front también** esté en HTTPS. `vite.config.ts` menciona CloudFront: pregunta si existe una distribución de CloudFront o un dominio. Si no hay forma de tener HTTPS, aplica la regla 10.

**Verificación:** repetir los casos 1 a 7 de T3 contra la URL de producción.

### T7. Protecciones contra abuso del registro

**Riesgos:**
- Los 3 endpoints son públicos. Alguien puede automatizar registros o reenvíos para **enviar correos masivos a terceros** o agotar la cuota de correo de Cognito.
- Cognito envía correos con su remitente por defecto, que tiene un **límite diario bajo**. Pide al usuario que revise el valor actual en la consola o en la documentación de AWS; **no lo afirmes de memoria**. En producción suele configurarse SES.
- La respuesta 409 "Ya existe una cuenta con ese email" permite averiguar qué correos están registrados (enumeración). El backend ya evita esto en confirmar y reenviar, pero no en el registro.

**Cómo (según P7.x):**
- Límite de peticiones por IP: en API Gateway (throttling), en Nginx (`limit_req`) o en la aplicación. Pregunta dónde, porque depende de T6.
- CAPTCHA en el formulario: requiere un servicio externo. Pregunta.
- SES para el correo: lo configura el usuario y puede tener restricciones en AWS Academy. Pregunta si está permitido.
- Enumeración: aceptar el riesgo, o responder siempre "Revisa tu correo" sin revelar si la cuenta existía. Pregunta.

### T8. Cuentas que nunca se confirman

**Riesgo:** el perfil se guarda en la BD con `activo = true` **antes** de confirmar el correo. Si alguien se registra con un correo ajeno y no confirma:
- Queda una fila en `usuario` y una cuenta *Unconfirmed* en Cognito que bloquean ese correo: el dueño real recibe 409 al intentar registrarse.
- El dueño real puede recuperarla con "Enviar otro código" → confirmar, pero la contraseña la eligió otra persona. Tendría que restablecerla, y la recuperación de contraseña **no existe** todavía (T9).

**Opciones (pregunta P8.1):**
- a) Crear la fila en la BD **al confirmar**, no al registrar. Cambia el flujo y la compensación.
- b) Mantener el flujo y agregar una columna `confirmado` (migración **V3** nueva; **nunca** editar V1 ni V2) más una limpieza periódica de cuentas sin confirmar en Cognito y en la BD.
- c) Aceptar el riesgo en el entorno académico y documentarlo.

Cualquier cambio de esquema afecta al backend compartido (regla 6).

### T9. Funcionalidades que faltan alrededor del registro

Pregunta cuáles entran en el alcance. No las implementes todas por defecto.

| Funcionalidad | Situación actual | Cómo se haría |
|---|---|---|
| Recuperar contraseña | No existe ni en el front ni en el backend | Directo con Amplify (`resetPassword` / `confirmResetPassword`), o endpoints en el backend como en `fs2-api`. Pregunta cuál. Cuidado con la enumeración de cuentas. |
| Confirmar desde el login | El login solo muestra un mensaje que lleva a "Crear cuenta → Confirma tu cuenta" | Un enlace o ruta directa (por ejemplo `/register?confirmar=1`). Revisa cómo maneja wouter los query params en la versión instalada. |
| Iniciar sesión automáticamente al confirmar | Se muestra un botón "Ir a iniciar sesión" | Usar `iniciarSesion` de `AuthContext` con la contraseña que aún está en el estado del formulario. Evalúa el riesgo de mantenerla en memoria. |
| Perfil desde la BD en el front | El front toma nombre y rol del ID token; `GET /api/me` del backend solo devuelve `sub` y roles | Pregunta si el front necesita datos de la BD. Si sí, haría falta un endpoint nuevo en el backend. |
| Sincronizar cambios de correo o nombre hechos en Cognito | No se sincronizan con la BD | Fuera de alcance salvo que se pida |
| Borrar cuentas | No existe | Fuera de alcance salvo que se pida |

### T10. Documentación pendiente

- Backend: actualizar la ruta de tickets del `README.md` (AUTH-0x) y `pasos.md` con el pool definitivo, los grupos y las variables, según lo decidido en T5. Revisa primero qué dice cada archivo.
- Front: marcar en este documento las tareas terminadas, con la fecha.

---

## 5. Criterios de "terminado"

- [ ] T1 y T2 confirmados por el usuario.
- [ ] Los casos 1 a 9 de T3 pasan con servicios reales y la suposición `username = sub` quedó verificada o resuelta.
- [ ] Pruebas automáticas en verde: backend `./mvnw test`; front `npm test`, `npm run lint` y `npm run build`.
- [ ] Commits o PR hechos según T4, sin secretos y sin los cambios ajenos de `deploy/`.
- [ ] El equipo está al tanto del impacto en Android (T5).
- [ ] Si se despliega: HTTPS de punta a punta, o el riesgo aceptado explícitamente por el usuario (T6).
- [ ] Decisiones de T7 y T8 tomadas y documentadas.

---

## 6. Preguntas para el usuario

Hazlas cuando llegues a la tarea correspondiente. Las marcadas **(bloquea)** se responden antes de continuar.

**T1, Cognito**
- P1.1 **(bloquea)** ¿El pool sigue siendo `us-east-1_AwWWrn8Ib` y el client `47v1h6d5fb83r3cle10gsv4hjq`?
- P1.2 ¿Ya existen los 4 grupos en ese pool?
- P1.3 ¿Cuál es la política de contraseñas real del pool?
- P1.4 ¿`name` es obligatorio en el pool?
- P1.5 ¿Qué rol se les da a los usuarios que ya existen en el pool sin grupo?

**T2, entorno**
- P2.1 **(bloquea)** ¿La BD de Supabase es solo tuya o compartida con el equipo? ¿Ya tiene aplicadas V1 y V2?
- P2.2 ¿Quieres cargar los datos semilla ficticios (`SYNCPASS_DATOS_SEMILLA`)?
- P2.3 ¿Dónde está tu archivo de credenciales AWS?

**T4, commits**
- P4.1 Front: ¿commit en `main` o en una rama?
- P4.2 **(bloquea)** Backend: ¿tienes permiso de push al repo del compañero? ¿Qué nombre de rama usamos? ¿Abro el PR o lo abres tú?

**T5, Android**
- P5.1 **(bloquea)** ¿Qué pool usará la app Android? a) el del front (hay que recrear los usuarios demo con correo y habilitar `ALLOW_USER_PASSWORD_AUTH`); b) se mantiene `syncpass-dev` para Android y el pool del front para la web (**no funciona** con un solo backend: el backend valida un solo client, así que habría que cambiar el backend); c) otra opción que decida tu equipo.
- P5.2 ¿El App Client del front tiene `ALLOW_USER_PASSWORD_AUTH`? ¿Cuánto dura su access token?

**T6, producción**
- P6.1 **(bloquea)** ¿Dónde corre el backend en producción (misma EC2 del front, otra EC2, detrás de API Gateway)? ¿Cuál es su URL?
- P6.2 **(bloquea)** ¿Hay o habrá HTTPS para el front (dominio, CloudFront, certificado)? Si no, ¿aceptas el riesgo por escrito para el entorno académico?
- P6.3 ¿Mismo origen con proxy en Nginx (opción A) u otro origen con CORS (opción B)?
- P6.4 ¿El registro debe funcionar también en GitHub Pages?
- P6.5 ¿Dónde está `apigateway-setup.ps1`, que menciona `parameter-store.ps1`? ¿Los cambios sin commit de `deploy/` son tuyos o de tu compañero, y ya están en uso?

**T7, abuso**
- P7.1 ¿Dónde limitamos las peticiones (API Gateway, Nginx o la aplicación)?
- P7.2 ¿Se puede usar SES en tu cuenta de AWS Academy?
- P7.3 ¿Aceptas que el registro revele si un correo ya tiene cuenta, o prefieres un mensaje neutro?
- P7.4 ¿Quieres CAPTCHA?

**T8, cuentas sin confirmar**
- P8.1 ¿Opción a, b o c?

**T9, alcance**
- P9.1 ¿Cuáles de las funcionalidades de T9 entran ahora?
