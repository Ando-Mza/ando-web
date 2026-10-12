# Pruebas manuales: US-PAD-03, US-PAD-04 y US-PAD-05 (ando-web)

> **Fuente de verdad:** el backend (`B-Ando`). El front se construyó contra los controllers reales, no contra los planes viejos.
> **Estado:** implementado y verificado solo estáticamente (`tsc --noEmit` y ESLint limpios sobre los archivos nuevos). **Nada se probó contra un backend en ejecución**: todo lo de abajo está pendiente.

## Qué se implementó

| US | Ruta web | Endpoints consumidos | Archivos |
|---|---|---|---|
| PAD-03 Moderación | `/admin/moderacion` | `GET /moderacion`, `GET /moderacion/:id`, `PATCH /moderacion/:id/desestimar`, `PATCH /moderacion/:id/eliminar-contenido`, `POST /moderacion/:id/suspender-autor` | `src/app/admin/moderacion/page.tsx`, `src/types/moderation.ts` |
| PAD-04 Validaciones | `/admin/validaciones` | `GET /validaciones`, `GET /validaciones/:id`, `PATCH /validaciones/:id/aprobar`, `PATCH /validaciones/:id/rechazar` | `src/app/admin/validaciones/page.tsx`, `src/types/validations.ts` |
| PAD-05 Actividad sospechosa | `/admin/actividad-sospechosa` | `GET /actividades-sospechosas`, `/metricas`, `/reglas`, `/:id`, `PATCH /:id/revisar`, `PATCH /:id/cerrar` | `src/app/admin/actividad-sospechosa/page.tsx`, `src/types/suspicious.ts` |
| Común | Menú lateral admin | — | `src/app/admin/layout.tsx`, `src/utils/api.ts` |

Notas de diseño:
- `/admin/validaciones` es una pantalla **nueva**. La pestaña de prestadores de `/admin/validation` sigue usando el flujo viejo (aprobación de cuenta/POI) y no se tocó.
- Las pantallas derivan "cargando" de la clave de la consulta; los filtros re-consultan sin recargar la página.

## Preparación de datos (hacer antes de probar)

Levantar `B-Ando` (y el microservicio de recomendación/moderación para los casos de IA) y loguearse en `ando-web` como **Administrador**.

- [ ] **Moderación:** dos turistas con reseñas en un POI. Crear reportes con `POST /reportes` (`tipoContenido: "resena"` y otro `"poi"`, `motivo` del enum, `contenidoId` UUID).
- [ ] **Moderación IA:** publicar una reseña con lenguaje ofensivo y esperar el caso "Detectado por IA".
- [ ] **Validaciones:** **ninguna pantalla de la app ni de la web crea solicitudes hoy**. Hay que crearlas con `POST /validaciones` autenticado como el usuario solicitante, p. ej. `{ "tipoValidacion": "prestador_comercial", "documentos": [{ "tipoDocumento": "dni_frente", "nombreArchivo": "dni.jpg", "archivoUrl": "https://..." }] }`. Preparar:
  - una solicitud **completa** (los 4 documentos de `prestador_comercial`: `dni_frente`, `dni_dorso`, `cuit_constancia`, `habilitacion_comercial`),
  - una **incompleta**,
  - una de otro tipo (`identidad_turista` requiere `dni_frente` + `dni_dorso`).
- [ ] **Alertas:** `POST /actividades-sospechosas` (manual) y/o `POST /actividades-sospechosas/evaluar`; cubrir las 4 criticidades y los 3 estados, con y sin `usuarioId`.

---

## 0. Transversal

- [ ] Los tres ítems nuevos aparecen en el menú lateral y resaltan al estar activos.
- [ ] Un turista/prestador logueado no puede entrar a ninguna de las 3 rutas (redirige) y la API responde 403.
- [ ] Sin sesión, redirige al login.
- [ ] Con el backend apagado: mensaje de error + botón "Reintentar" que funciona al volver el backend.
- [ ] Layout usable en pantalla angosta (tabla con scroll horizontal, modales con scroll).

## 1. US-PAD-03: `/admin/moderacion`

### Bandeja
- [ ] Por defecto: solo **Pendientes**, de más antiguos a más nuevos.
- [ ] Columnas: Tipo de contenido, Motivo, Origen, Fecha, Estado, Acciones.
- [ ] Badge "Detectado por IA" distinto de "Reporte de Usuario".
- [ ] Spinner "Cargando..." y estado vacío con filtros sin resultados.
- [ ] Paginación (20 por página); al cambiar un filtro vuelve a la página 1.

### Filtros (en tiempo real)
- [ ] Entidad "Solo reseñas": incluye también respuestas de prestador a reseñas.
- [ ] Entidad "Solo puntos de interés".
- [ ] Entidad "Solo imágenes": ver O-3, esperable que venga vacío.
- [ ] Estado: Pendientes / Resueltos / Desestimados / Todos.
- [ ] Origen: Reporte de Usuario / Detectado por IA.
- [ ] Combinación de los tres.

### Modal "Ver más"
- [ ] Fecha, entidad reportada, código (id) y reportante.
- [ ] Caso de IA: dice "Detectado por IA (sin usuario reportante)" y no muestra nombre de reportante.
- [ ] Recuadro naranja/rojo con motivo, aclaración y quién denunció.
- [ ] Contenido original, autor y POI asociado.
- [ ] Contenido ya inexistente: aviso, sin romper el modal.
- [ ] Cierra con la X y haciendo clic fuera.

### Acciones
- [ ] **Desestimar Reporte** (con confirmación): pasa a "Desestimado", la reseña sigue visible para turistas, sale de Pendientes.
- [ ] **Eliminar Contenido** (con confirmación + motivo opcional): reporte "Resuelto"; la reseña deja de verse; promedio y cantidad de reseñas del POI se recalculan.
- [ ] Eliminar una **respuesta de prestador**: desaparece la respuesta, queda la reseña.
- [ ] Eliminar sobre un **POI**: queda en estado "Rechazado".
- [ ] El autor recibe notificación "Contenido Moderado" con el motivo.
- [ ] **Suspender Usuario autor** (con confirmación): badge "Suspendido", el botón desaparece, notificación "Cuenta Suspendida".
- [ ] El usuario suspendido **no puede iniciar sesión**.
- [ ] Orden: suspender y **después** eliminar funciona; eliminar y después suspender ya no se ofrece (O-1).
- [ ] Auditoría: log `MODERATE` ("Reporte válido, contenido oculto") al eliminar, `MODERATE` ("Reporte desestimado...") al desestimar, `SUSPEND_USER` al suspender.
- [ ] Caso ya resuelto: sin botones, texto "Este caso ya fue resuelto".
- [ ] Error del backend (p. ej. 404 por caso eliminado) se ve dentro del modal.

## 2. US-PAD-04: `/admin/validaciones`

### Listado
- [ ] Por defecto: solo **Pendientes**, de más antiguas a más nuevas.
- [ ] Columnas: Solicitante (nombre + email), Tipo, Documentación (Completa / Incompleta n/m), Fecha, Estado.
- [ ] Filtro de Estado: Pendientes / Validadas / Rechazadas / Todas.
- [ ] Filtro de Tipo: identidad de turista, prestador comercial, guía de turismo, agencia de viajes.
- [ ] Estado vacío y paginación.

### Detalle
- [ ] Datos del solicitante (nombre, email, teléfono, cuenta verificada) y fechas.
- [ ] Lista de documentos adjuntos con nombre legible por tipo y enlace "Abrir" (nueva pestaña).
- [ ] Un `archivoUrl` que no sea `http(s)` no genera enlace ("Sin enlace").
- [ ] Solicitud **incompleta**: aviso rojo con los documentos faltantes y botón **Aprobar deshabilitado**.
- [ ] Solicitud sin ningún documento: mensaje "no adjuntó documentos" y aprobar deshabilitado.

### Acciones
- [ ] **Aprobar** (solicitud completa): toast "Validación aprobada correctamente"; estado "Validado"; el usuario queda `verificado = true`; sale de Pendientes.
- [ ] El usuario recibe la notificación "Validación Aprobada" (categoría validaciones).
- [ ] **Rechazar**: abre campo de motivo obligatorio; "Confirmar rechazo" deshabilitado con menos de 5 caracteres.
- [ ] Rechazo confirmado: toast "Validación rechazada"; estado "Rechazada" y el motivo queda visible al reabrir desde "Rechazadas".
- [ ] El usuario recibe "Validación Rechazada" con el motivo.
- [ ] Cancelar el rechazo vuelve a los botones sin cambios.
- [ ] Auditoría: `APROBAR_VALIDACION_USUARIO` y `RECHAZAR_VALIDACION_USUARIO` con el motivo.
- [ ] Solicitud ya revisada: sin botones, "Esta solicitud ya fue revisada".
- [ ] Forzar un error (p. ej. aprobar una incompleta por API) muestra el mensaje del backend en el modal.

## 3. US-PAD-05: `/admin/actividad-sospechosa`

### Métricas y listado
- [ ] Tarjetas Pendientes / Revisadas / Cerradas / Críticas / Altas / Medias / Bajas coinciden con `GET /metricas`.
- [ ] Las tarjetas se actualizan solas después de revisar o cerrar.
- [ ] Por defecto muestra **pendientes**. Columnas: Fecha, Usuario involucrado, Tipo de evento, Criticidad, Estado.
- [ ] Filtros: estado, criticidad, tipo de evento, desde/hasta, y combinaciones. El día "hasta" se incluye completo (ver O-11).
- [ ] Sin pendientes: texto exacto "No hay actividades sospechosas pendientes de revisión".
- [ ] Alerta sin usuario: "Sistema / sin usuario".
- [ ] Paginación y reset a página 1 al cambiar filtros.

### Detalle y acciones
- [ ] Modal con usuario (nombre y email), fecha, tipo de evento, criticidad, IP, descripción, detalles técnicos (JSON), revisor y comentarios.
- [ ] **Marcar como Revisada** (con y sin comentario): estado "Revisada", se guarda revisor y fecha; sale de Pendientes.
- [ ] **Cerrar alerta** abre modal **Confirmar / Cancelar**:
  - [ ] Cancelar: cierra solo la confirmación, la alerta queda igual.
  - [ ] Confirmar: alerta "Cerrada", se cierra el detalle y se ve la tabla.
- [ ] Cerrar una alerta "Revisada" conserva el revisor original.
- [ ] Alerta cerrada: sin acciones.
- [ ] Auditoría: `ALERTA_SOSPECHOSA_REVISADA` y `ALERTA_SOSPECHOSA_CERRADA`.

### Reglas y umbrales
- [ ] "Ver reglas" muestra nombre, descripción, umbral / ventana y criticidad (solo lectura).
- [ ] Sin reglas en BD: se ven las predeterminadas que devuelve el backend.

---

## Observaciones sobre el backend (leídas del código, sin ejecutar)

| # | Observación | Impacto |
|---|---|---|
| O-1 | `eliminarContenido` borra físicamente la reseña. Después, `suspenderAutor` no encuentra al autor y responde 400. | El front ofrece suspender solo con el caso pendiente. Para penalizar y eliminar: suspender primero. |
| O-2 | `desestimar`, `eliminar-contenido`, `aprobar`, `rechazar` y `cerrar` no validan el estado actual; se puede re-resolver por API. | El front oculta las acciones en casos ya cerrados; el backend debería rechazar la transición. |
| O-3 | Ningún flujo crea reportes con entidad `imagen`. | "Solo imágenes" no devolverá resultados hoy. |
| O-4 | La US-PAD-03 pide "Eliminar Reporte" y "Verificar Reporte". `/verificar` es alias exacto de `eliminar-contenido` y no hay endpoint para borrar un reporte. | Hay un único botón "Eliminar Contenido". |
| O-5 | Solo se valida rol admin, no un permiso RBAC (`moderar-contenido`, etc.). | Cualquier admin puede moderar/validar. Decisión de producto. |
| O-6 | `marcarRevisada` registra `estadoAnterior` después de pisar el estado: siempre "revisada". | Dato de auditoría incorrecto. |
| O-7 | `cerrarAlerta` no rechaza alertas ya cerradas. | Un doble cierre pisa `comentariosCierre` y `fechaCerrada`. |
| O-8 | `GET /actividades-sospechosas` devuelve `mensaje` "...pendientes de revisión" aunque el filtro no sea pendiente. | El front solo usa ese texto con el filtro "Pendientes". |
| O-9 | `api.createReporteContenido` (en `provider/help`) envía `{poiId, reviewId, motivo, descripcion}`, pero el DTO espera `{tipoContenido, contenidoId, motivo (enum), aclaracion}`. | Probable 400 al reportar desde el panel del prestador. Alimenta la bandeja de PAD-03. |
| O-10 | Moderar un POI lo pone en `RECHAZADO` sin revertir ni notificar a nadie más que al `creadoPor`. | Confirmar comportamiento esperado. |
| O-11 | `fechaHasta` se envía como `YYYY-MM-DD`; si el backend lo compara contra un timestamp, podría excluir el último día. | Probar con una alerta creada el día "hasta". |
| O-12 | `POST /validaciones` no se usa en ninguna pantalla: no hay flujo para que turistas/prestadores suban su documentación. | PAD-04 solo tiene datos si se cargan por API. Falta el lado solicitante. |
| O-13 | No existen endpoints de configuración: tipos de validación y documentos obligatorios están hardcodeados en `REQUISITOS_DOCUMENTALES`; `fechaVencimientoDocumentacion` existe en la entidad pero nada la usa. | Lo que la US describe como "definir tipos, documentos y políticas de vencimiento" **no está implementado en el backend**, por lo tanto tampoco en el front. Los CA de la tabla sí están cubiertos. |
| O-14 | Con `PAD-05`, la US habla de "fijar reglas y umbrales"; el backend solo expone lectura (`GET /reglas`). | La web muestra las reglas pero no permite editarlas. |

## Fuera de alcance / pendiente
- Edición de reglas/umbrales (O-14) y configuración de tipos de validación (O-13): requieren endpoints nuevos en el backend.
- Flujo del solicitante para enviar documentación (O-12).
- Tests automatizados: `ando-web` no tiene runner de tests configurado.
- `PLAN-IMPLEMENTACION-US-PAD-03.md` quedó marcado como obsoleto.
