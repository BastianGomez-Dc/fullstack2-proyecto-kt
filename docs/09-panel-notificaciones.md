# Panel de notificaciones push

## Objetivo

La aplicación web permite a usuarios con rol `ADMINISTRADOR` enviar notificaciones push a la app móvil mediante el backend existente. El backend sigue siendo responsable de autorizar la operación y distribuir las notificaciones; este cambio solo integra la interfaz web y sus llamadas HTTP.

## Cambios realizados

- [x] Se añadió `src/api/notifications.ts` con los tipos de roles y las funciones para enviar una notificación y consultar el historial.
- [x] Las llamadas usan `apiRequest`, incluyen el JWT de Cognito como `Authorization: Bearer ...` y validan la forma de las respuestas.
- [x] Se añadió la ruta `/notifications` con formulario de título, cuerpo y selección de roles.
- [x] Si no se seleccionan roles, se envía `roles: []`, que el contrato del backend interpreta como envío a todos los usuarios activos.
- [x] Se añadieron estados de envío, validación de campos vacíos, feedback de éxito y presentación de errores del API.
- [x] El panel consulta el endpoint de historial y muestra el estado vacío, el error o la lista de envíos. El formato de cada registro es el record `HistorialItem` del `NotificationController` del backend (ver «Historial tipado» más abajo).
- [x] La navegación solo muestra el enlace de notificaciones al rol `ADMINISTRADOR`. La ruta también bloquea la vista a visitantes y a otros roles.
- [x] Se añadió `isReady` al contexto de autenticación para esperar a que Cognito restaure la sesión antes de decidir el acceso al panel.
- [x] Se agregaron pruebas del servicio para el JWT, roles, envío a todos, error 403 e historial vacío.

## Historial tipado (actualización 2026-11-19)

`getHistorial(token)` devuelve `Promise<HistorialResponse>` (`HistorialItem[]`) en lugar de `unknown[]`. Los campos copian el record del backend:

| Campo | Tipo en TS | Tipo en el backend | Nota |
|---|---|---|---|
| `id` | `number` | `Long` | |
| `titulo` | `string` | `String` | |
| `cuerpo` | `string` | `String` | |
| `roles` | `string[] | null` | `List<String>` | Vacío o `null`: se envió a todos los usuarios activos |
| `enviadoEn` | `string` | `LocalDateTime` | Sin zona horaria, p. ej. `2026-11-13T22:00:00` |
| `dispositivosEnviados` | `number` | `int` | |

El cliente valida cada registro (`esHistorialItem`) y lanza `ApiError(502)` si la respuesta no cumple el contrato. La página muestra cada envío con título, cuerpo, fecha y hora, destinatarios y dispositivos (`src/utils/notificaciones.ts`), con utilidades de Tailwind. **El backend todavía devuelve siempre `[]`** porque no tiene tabla de historial, así que en uso real se ve «Aún no hay notificaciones en el historial»; la lista se prueba con datos simulados (`tests/notifications.test.ts`, `tests/notifications-page.test.tsx`, `tests/notificaciones-formato.test.ts`).

## Seguridad y alcance

La comprobación del rol en el frontend es solo una protección de interfaz; no reemplaza la autorización del endpoint. El backend debe seguir exigiendo el rol `ADMINISTRADOR` para ambos endpoints. El cliente nunca debe tratar un JWT ni un rol del navegador como prueba suficiente para autorizar una operación.

No se modificaron el backend ni el archivo de contexto pegado por el usuario. En desarrollo, Vite ya reenvía `/api` al backend local. En otros entornos, `VITE_API_BASE_URL` debe apuntar al origen/ruta del API que corresponda.

## Verificación

Verificación realizada desde la raíz del proyecto:

```bash
npm test       # 84 pruebas aprobadas en el corte vigente (14 en el corte original de esta guía)
npm run build  # TypeScript y build de producción correctos
npm run lint   # sin errores
```

La prueba real del envío requiere una sesión Cognito con rol `ADMINISTRADOR` y un backend disponible; no se considera validada por las pruebas unitarias del servicio.
