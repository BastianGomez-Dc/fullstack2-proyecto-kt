# Panel de notificaciones push

## Objetivo

La aplicación web permite a usuarios con rol `ADMINISTRADOR` enviar notificaciones push a la app móvil mediante el backend existente. El backend sigue siendo responsable de autorizar la operación y distribuir las notificaciones; este cambio solo integra la interfaz web y sus llamadas HTTP.

## Cambios realizados

- [x] Se añadió `src/api/notifications.ts` con los tipos de roles y las funciones para enviar una notificación y consultar el historial.
- [x] Las llamadas usan `apiRequest`, incluyen el JWT de Cognito como `Authorization: Bearer ...` y validan la forma de las respuestas.
- [x] Se añadió la ruta `/notifications` con formulario de título, cuerpo y selección de roles.
- [x] Si no se seleccionan roles, se envía `roles: []`, que el contrato del backend interpreta como envío a todos los usuarios activos.
- [x] Se añadieron estados de envío, validación de campos vacíos, feedback de éxito y presentación de errores del API.
- [x] El panel consulta el endpoint de historial y muestra el estado vacío o la cantidad de registros. No presupone un formato para mostrar cada registro mientras el backend no lo defina.
- [x] La navegación solo muestra el enlace de notificaciones al rol `ADMINISTRADOR`. La ruta también bloquea la vista a visitantes y a otros roles.
- [x] Se añadió `isReady` al contexto de autenticación para esperar a que Cognito restaure la sesión antes de decidir el acceso al panel.
- [x] Se agregaron pruebas del servicio para el JWT, roles, envío a todos, error 403 e historial vacío.

## Seguridad y alcance

La comprobación del rol en el frontend es solo una protección de interfaz; no reemplaza la autorización del endpoint. El backend debe seguir exigiendo el rol `ADMINISTRADOR` para ambos endpoints. El cliente nunca debe tratar un JWT ni un rol del navegador como prueba suficiente para autorizar una operación.

No se modificaron el backend ni el archivo de contexto pegado por el usuario. En desarrollo, Vite ya reenvía `/api` al backend local. En otros entornos, `VITE_API_BASE_URL` debe apuntar al origen/ruta del API que corresponda.

## Verificación

Verificación realizada desde la raíz del proyecto:

```bash
npm test       # 14 pruebas aprobadas
npm run build  # TypeScript y build de producción correctos
npm run lint   # sin errores
```

La prueba real del envío requiere una sesión Cognito con rol `ADMINISTRADOR` y un backend disponible; no se considera validada por las pruebas unitarias del servicio.
