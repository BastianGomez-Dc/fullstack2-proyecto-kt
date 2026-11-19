# Estado de avance frente a la rúbrica EVA3

> **Corte:** 2026-11-13
>
> ⚠️ **Documento histórico.** Los estados «Pendiente / No verificado» de abajo corresponden a ese corte. Estado vigente (19-11-2026): `ARQUITECTURA.md`, `ALCANCE.md` y `MOCKUPS.md` están completos y la web tiene **84 pruebas con 65,4 % de cobertura de líneas**. La app Android y la nube se verifican en sus propios repositorios.
> **Base:** [08-desarrollo-ev3.md](./08-desarrollo-ev3.md)
> **Alcance de esta revisión:** repositorio web `fullstack2-proyecto-kt`. Los componentes Android, backend, AWS y Supabase que estén en otros repositorios o cuentas no se consideran verificados por esta revisión.

## Resumen ejecutivo

El repositorio contiene una aplicación web React/TypeScript con autenticación Cognito, registro, panel de notificaciones y mantenedor web de cursos. Son avances útiles para SyncPass, pero **no demuestran por sí solos el cumplimiento de los requisitos de la app Android Kotlin, MVVM, persistencia offline ni sincronización** de la rúbrica.

La ponderación de la rúbrica se interpreta como 60% grupal (36 puntos implementación y 24 puntos documentación/testing) más 40% defensa individual. Las sumas son consistentes; los porcentajes técnicos y de ingeniería son subdivisiones del 60% grupal.

## Hecho y comprobable en este repositorio

- [x] Frontend web construido con React, TypeScript, Vite y Wouter.
- [x] Integración del inicio de sesión con Cognito y contexto de sesión con token y rol.
- [x] Flujo de registro y pruebas de sus funciones HTTP.
- [x] Panel web de notificaciones push para administradores, con envío por API e historial pendiente según el contrato disponible.
- [x] Mantenedor web de cursos: listado, detalle, creación, edición y desactivación; los cambios se envían a la API existente.
- [x] Las acciones administrativas se ocultan a otros roles en la interfaz. La autorización real debe seguir aplicándose en el backend.
- [x] Documentación de las integraciones web en [09-panel-notificaciones.md](./09-panel-notificaciones.md) y [10-mantenedor-cursos.md](./10-mantenedor-cursos.md).
- [x] Verificación del frontend: 20 pruebas automatizadas aprobadas, `npm run build` y `npm run lint` correctos.

Estos avances comprueban funcionalidades del **frontend web**; no sustituyen las evidencias de la aplicación móvil que solicita EVA3.

## Matriz de requisitos EVA3

| Requisito de la rúbrica | Estado en este repositorio | Qué falta o qué evidencia se necesita |
|---|---|---|
| Supabase conectado | No verificable aquí | Evidencia de conexión y persistencia desde el backend y/o despliegue. |
| API Spring Boot desplegada en EC2 | Referenciada en documentación externa, no verificable aquí | Confirmar estado del backend y demostrar una llamada real desde la app. |
| API Gateway | Opcional según la rúbrica | Documentar si se utiliza o no y reflejar la topología real. |
| Cognito y control de roles | Parcial | El frontend integra Cognito y distingue el rol `ADMINISTRADOR`. Verificar configuración real y autorización backend por endpoint. La rúbrica usa nombres de perfiles distintos de algunos roles del sistema (`BENEFICIARIO`, `COORDINADOR`); acordar su correspondencia. |
| Aplicación Android desarrollada en Kotlin | No presente en este repositorio | Revisar el repositorio Android y enlazarlo como parte de la entrega. |
| Uso de al menos dos APIs nativas Android | No verificable aquí | Identificar las APIs usadas en Android y mostrar sus funcionalidades implementadas. |
| Arquitectura Android MVVM y capas | No verificable aquí | Documentar y demostrar `Datasource`, `Repository`, fuentes remota/local, `ViewModel` y vistas. |
| Funcionamiento offline y sincronización | No verificable aquí | Demostrar operaciones offline, cola/persistencia local y envío de pendientes al recuperar conexión. El texto promocional de la web no constituye evidencia técnica de este requisito. |
| `ARQUITECTURA.md` con C1/C2/C3 | Pendiente en este repositorio | Crear los diagramas y explicar los flujos reales, especialmente la autenticación y comunicación con backend. |
| `ALCANCE.md` con RF/RNF/casos de uso/flujos | Pendiente en este repositorio | Consolidar los requisitos y flujos funcionales del sistema. |
| Mockups de todas las vistas y trazabilidad | Pendiente/no encontrado aquí | Incorporar mockups y marcar qué vistas están implementadas y cuáles siguen en backlog. |
| Pruebas unitarias y cobertura mínima de 30% | Parcial | Hay pruebas del frontend, pero no se ha medido ni presentado cobertura del 30%; falta reporte verificable, idealmente de la app Android con JaCoCo si corresponde a ese módulo. |
| Defensa individual: responder 2 de 3 preguntas | Pendiente de preparación | Preparar explicación y evidencia de código, offline/sync, autenticación, MVVM y decisiones de arquitectura. |

## Pendientes priorizados

1. **Reunir evidencia de los otros repositorios**: Android, backend y despliegue. Confirmar qué requisitos ya están implementados fuera de este repositorio.
2. **Completar la evidencia Android**: dos APIs nativas, MVVM, Room/SQLite/DataStore, operación offline y sincronización observable.
3. **Crear `ARQUITECTURA.md` y `ALCANCE.md`** con la arquitectura y los flujos reales; no dibujar servicios como si fueran una cadena si no lo son.
4. **Agregar mockups y trazabilidad** entre vistas, funcionalidades implementadas y backlog.
5. **Ejecutar pruebas de integración reales** con Cognito, API y base de datos. Las pruebas actuales usan respuestas simuladas y no prueban la nube.
6. **Generar y guardar el reporte de cobertura** que demuestre al menos 30%, indicando módulo y métrica utilizados.
7. **Alinear los roles** de la rúbrica con los nombres y permisos efectivos del sistema.
8. **Preparar la defensa individual** con preguntas de práctica sobre las áreas indicadas por EVA3.

## Límites de la verificación

No se ejecutaron operaciones contra Cognito, EC2, API Gateway ni Supabase. Las pruebas automatizadas verifican el comportamiento del frontend y el formato de sus llamadas HTTP, no la disponibilidad ni el contrato efectivo del backend desplegado. Los estados de trabajos realizados en otros repositorios deben actualizarse después de revisar esos repositorios o recibir evidencia del equipo.
