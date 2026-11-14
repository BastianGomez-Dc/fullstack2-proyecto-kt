# Mantenedor de cursos

## Alcance

La página `/cursos` consume el CRUD existente del backend. En SyncPass, “curso” reutiliza la entidad `Proyecto`; no se crea una entidad nueva ni se modifica el backend.

## Cambios realizados

- [x] Se añadieron tipos para cursos y funciones HTTP para listar, obtener detalle, crear, editar y desactivar.
- [x] Se agregó la ruta `/cursos`. Los usuarios autenticados pueden consultar cursos activos y ver el detalle.
- [x] Los usuarios `ADMINISTRADOR` pueden crear, editar y desactivar cursos desde el panel.
- [x] El formulario aplica validaciones y límites de longitud definidos por el backend.
- [x] Las fechas se muestran como `DD/MM/YYYY` y se editan con controles de fecha.
- [x] Los estados tienen badges visuales y la desactivación pide confirmación antes de llamar a la API.
- [x] Se muestran estados de carga, errores del backend, mensajes de éxito y lista vacía.
- [x] Se agregaron pruebas de rutas, métodos HTTP, token JWT, payloads, PATCH 204 y error 403.

## Contrato utilizado

| Acción | Método y ruta | Permiso |
|---|---|---|
| Listar cursos activos | `GET /api/cursos` | Cualquier usuario autenticado |
| Ver detalle | `GET /api/cursos/{id}` | Cualquier usuario autenticado |
| Crear | `POST /api/cursos` | `ADMINISTRADOR` |
| Editar | `PUT /api/cursos/{id}` | `ADMINISTRADOR` |
| Desactivar | `PATCH /api/cursos/{id}/desactivar` | `ADMINISTRADOR` |

El frontend envía el JWT de Cognito mediante el cliente HTTP común. La comprobación de rol controla la interfaz; el backend debe seguir validando permisos en cada endpoint de escritura.

Desactivar un curso lo marca como `FINALIZADO`; el endpoint de listado ya excluye ese estado, por lo que el curso deja de aparecer en el catálogo móvil sin borrar sus eventos, inscripciones ni asistencias.

## Verificación

```bash
npm test       # 20 pruebas aprobadas
npm run build  # TypeScript y build de producción correctos
npm run lint   # sin errores
```

También se comprobó en navegador que `/cursos` carga correctamente para un visitante y muestra el acceso a iniciar sesión. La integración con los endpoints requiere una sesión Cognito real y el backend disponible; las pruebas automatizadas verifican el contrato HTTP usando respuestas simuladas.
