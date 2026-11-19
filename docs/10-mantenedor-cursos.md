# Mantenedor de cursos

## Alcance

La página `/cursos` consume el CRUD existente del backend. En SyncPass, “curso” reutiliza la entidad `Proyecto`; no se crea una entidad nueva. Más tarde el backend sumó el endpoint público `GET /api/cursos/recientes` (lo usa la portada) y la validación de fechas que repite el formulario.

## Cambios realizados

- [x] Se añadieron tipos para cursos y funciones HTTP para listar, obtener detalle, crear, editar y desactivar.
- [x] Se agregó la ruta `/cursos`. Los usuarios autenticados pueden consultar cursos activos y ver el detalle.
- [x] Los usuarios `ADMINISTRADOR` pueden crear, editar y desactivar cursos desde el panel.
- [x] El formulario aplica validaciones y límites de longitud definidos por el backend.
- [x] Las fechas se muestran en español con el mes abreviado (`15 mar 2027`) en la tabla y completo (`15 de marzo de 2027`) en el detalle, y se editan con controles de fecha. La fecha de término debe ser igual o posterior a la de inicio: el calendario no ofrece días anteriores, el formulario muestra el error y no envía, y el backend repite la regla (400).
- [x] Los estados tienen badges visuales; el detalle y la confirmación de desactivación se muestran en diálogos (`molecules/Dialogo`, `<dialog>` nativo) antes de llamar a la API.
- [x] Se muestran estados de carga, errores del backend, mensajes de éxito y lista vacía.
- [x] Se agregaron pruebas de rutas, métodos HTTP, token JWT, payloads, PATCH 204 y error 403.

## Contrato utilizado

| Acción | Método y ruta | Permiso |
|---|---|---|
| Listar cursos activos | `GET /api/cursos` | Cualquier usuario autenticado |
| Últimos cursos (portada) | `GET /api/cursos/recientes?limite=3` | Público, sin token |
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
