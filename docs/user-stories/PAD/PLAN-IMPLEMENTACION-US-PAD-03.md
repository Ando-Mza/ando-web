# Plan de Implementación: Bandeja de Moderación de Contenido (US-PAD-03)

> **Historias cubiertas:** US-PAD-03 (Moderación de Contenido) — consume los resultados de **US-MRIA-10** (Detección Automática de Contenido Inadecuado con IA), ya implementada en backend.
> **Estado de este documento:** OBSOLETO. El backend ya implementó la moderación bajo `/moderacion/*` y el front se construyó contra esa API. Ver `PRUEBAS-PAD-03-04-05.md` para el estado real y la lista de pruebas.
> **Repos involucrados:** `B-Ando` (API NestJS), `ando-web` (panel Admin Next.js).

---

## 1. Contexto — qué existe hoy

US-MRIA-10 ya está resuelta de punta a punta en el backend:

- `reviewService.crearReview()` / `crearReviewResponse()` disparan de forma asíncrona `triggerAiContentModeration()` ([B-Ando/src/review/reviewService.ts:277](../../../../B-Ando/src/review/reviewService.ts#L277), [:660](../../../../B-Ando/src/review/reviewService.ts#L660)).
- El microservicio Python (`recommendationService`) analiza el texto con Gemini/OpenAI (fallback heurístico) vía `POST /moderation/analyze`.
- Si `requiere_revision = true`, se inserta una fila en `reporte_contenidos` con estado `pendiente` y `motivo = "[IA - CATEGORIA] ..."`.

**Lo que falta —y es el objeto de este plan— es todo lo que necesita el Administrador para ver y resolver esos casos.** Hoy `reportController.ts` solo expone `POST /reportes` (crear). No hay forma de listarlos, verlos en detalle ni resolverlos, ni en la API ni en `ando-web`.

---

## 2. Gaps detectados que hay que resolver antes/durante la implementación

| # | Problema | Impacto |
|---|----------|---------|
| G1 | No existen endpoints `GET /reportes`, `GET /reportes/:id`, `PATCH /reportes/:id` | Sin esto no hay nada que construir en el front |
| G2 | `ReporteContenidoEntity` no tiene columna `origen` | No se puede filtrar "Reporte de Usuario" vs "Detectado por IA" (CA de US-PAD-03) sin parsear el string `motivo` |
| G3 | Inconsistencia en el campo `entidad`: los reportes de usuario usan `TipoContenidoReportable` (`'poi'` \| `'resena'`), pero `triggerAiContentModeration` guarda `'review'` \| `'review_response'` ([reviewService.ts:822](../../../../B-Ando/src/review/reviewService.ts#L822)) | El filtro "Solo reseñas" de US-PAD-03 no matchearía los casos de IA tal como están guardados hoy |
| G4 | `EstadoReporteEntity` solo tiene seed de `'pendiente'` | Faltan `'resuelto'`, `'desestimado'`, y posiblemente diferenciar "eliminado/oculto" del contenido en sí |
| G5 | En los casos de IA, `usuarioId` = autor del contenido, no un reportante | El front no debe mostrar "reportado por" en esos casos; hay que exponer esta distinción explícitamente |
| G6 | No existe permiso RBAC dedicado (ver `'validar-pois'`, `'gestionar-usuarios'`, etc. en otros controllers) | Hay que crear `'moderar-contenido'` y asignarlo al rol Administrador |
| G7 | No hay acción para "confirmar infracción" que efectivamente oculte la reseña/respuesta ni para "suspender usuario" desde este flujo | Falta lógica de efectos secundarios sobre `ReviewEntity` / `ReviewResponseEntity` / `UsuarioEntity` |

---

## 3. Diseño Backend (`B-Ando`)

### 3.1 Migraciones / cambios de modelo

- **`ReporteContenidoEntity`**: agregar columna `origen: 'usuario' | 'ia'` (enum), default `'usuario'` para no romper datos existentes.
- **`reviewService.triggerAiContentModeration`**: al crear el reporte, setear `origen: 'ia'` explícitamente y corregir `entidad` para usar los mismos valores que `TipoContenidoReportable` (extender el enum con un valor para respuesta de reseña, p. ej. `RESENA_RESPUESTA = 'resena_respuesta'`, o usar un campo separado `subtipo`). **Decisión a confirmar con el equipo** (ver sección 6).
- **`EstadoReporteEntity`**: ampliar el seed (`reportService.seedEstadosReporte`) para crear también `'resuelto'` y `'desestimado'`. Confirmar si "ocultar contenido" es una acción sobre la Review (cambia su propio estado a algo como "rechazada/oculta") y el reporte simplemente pasa a `'resuelto'` — así lo indica el AC de US-PAD-03.
- Nuevo permiso `'moderar-contenido'` en la tabla/seed de permisos, asignado al rol Administrador (seguir el patrón de `'validar-pois'`).

### 3.2 Nuevos endpoints en `reportController.ts`

Todos protegidos con `@UseGuards(AuthGuard, PermissionsGuard)` + `@Permissions('moderar-contenido')`, siguiendo el patrón de [poiController.ts](../../../../B-Ando/src/poi/poiController.ts) para `'validar-pois'`.

```
GET    /reportes
  Query: estado?, entidad?, origen?, page?, limit?
  → Lista paginada ordenada por fechaCreacion ASC (más antiguos sin resolver primero, según CA de US-PAD-03)
  → Incluye: id, entidad, entidadId, motivo, aclaracion, origen, estado, fechaCreacion,
             usuario (solo si origen='usuario'), extracto del contenido original

GET    /reportes/:id
  → Detalle completo: datos del reporte + contenido original (review/response/poi) para mostrar en el modal

PATCH  /reportes/:id/resolver
  Body: { accion: 'desestimar' | 'confirmar_infraccion' | 'ocultar', comentarioAdmin?: string }
  → 'desestimar': estado del reporte → 'desestimado'; contenido original NO cambia
  → 'confirmar_infraccion' | 'ocultar': estado del reporte → 'resuelto';
     cambia el estado de la Review/ReviewResponse a algo tipo "rechazada/oculta" (dejar de listarse en getReviewsByPoi)
  → Registra auditoría: accion 'MODERATE', entidad 'Reseña'|'ReviewResponse', detalle con motivo (según CA de US-PAD-03)

PATCH  /reportes/:id/suspender-usuario   (atajo opcional, CA de US-PAD-03)
  → Reutiliza la lógica de baja lógica ya existente en userService (si existe) sobre el autor del contenido
```

### 3.3 Servicio (`reportService.ts`)

- `listarReportes(filtros, paginacion)`: query con `leftJoinAndSelect` a `usuario` y `estado`; resolver el contenido original (`review` o `poi`) según `entidad` para mostrar un extracto.
- `obtenerDetalle(id)`.
- `resolverReporte(id, accion, adminId, ip)`: aplica la transición de estado, actualiza la entidad relacionada cuando corresponde, e inserta el log de auditoría vía `AuditService` (ya usado en `reviewService`).
- Reutilizar `estadoReviewRepository` para el nuevo estado de reseña oculta (verificar si ya existe algo como "rechazada" o si hay que sembrarlo).

### 3.4 Tests a agregar

- `reportService.spec.ts`: casos de listar con filtros, resolver (las 3 acciones), y verificación de que "desestimar" no toca la reseña.
- `reportController.integration.spec.ts`: verificar guard de permisos y respuesta 403 sin `'moderar-contenido'`.

---

## 4. Diseño Frontend (`ando-web`)

### 4.1 Ubicación

Nueva ruta: **`/admin/moderacion`** (carpeta `ando-web/src/app/admin/moderacion/page.tsx`).

Agregar entrada al menú en [`ando-web/src/app/admin/layout.tsx`](../../../src/app/admin/layout.tsx#L57), después de "Catálogo y Validación":

```ts
{
  name: 'Moderación de Contenido',
  path: '/admin/moderacion',
  icon: ShieldAlert, // lucide-react
  desc: 'Reseñas y reportes pendientes de revisión'
}
```

No corresponde tocar `ando-app` (móvil): no tiene panel de administración, solo `AdminSettingsScreen.tsx` para ajustes puntuales.

### 4.2 Componentes de la página

Seguir el patrón visual ya usado en `/admin/validation/page.tsx` (tabs, tabla con filtros, modal de detalle):

1. **Tabla principal**: columnas Tipo de contenido, Motivo, Origen ("Detectado por IA" con badge distintivo vs "Reporte de Usuario"), Fecha, Estado. Orden por fecha ascendente (antiguos primero).
2. **Barra de filtros**: Entidad (reseñas/imágenes), Estado (pendiente/resuelto/desestimado), Origen (IA/usuario) — actualización en tiempo real, sin recargar página (client-side fetch con query params).
3. **Modal "Ver más"**: datos completos del reporte + contenido original destacado en recuadro rojo/naranja + botones: Desestimar, Eliminar/Ocultar Contenido, Suspender Usuario (solo si origen='usuario' o si el admin decide penalizar al autor).
4. Toast de confirmación + actualización optimista de la fila tras resolver.

### 4.3 Cliente API (`ando-web/src/utils/api.ts`)

Agregar junto a `createReporteContenido` ([api.ts:221](../../../src/utils/api.ts#L221)):

```ts
getReportes: (filtros?: { estado?: string; entidad?: string; origen?: string; page?: number; limit?: number }) =>
  request<any>(`/reportes${buildQueryString(filtros)}`, 'GET'),

getReporteDetalle: (id: string) =>
  request<any>(`/reportes/${id}`, 'GET'),

resolverReporte: (id: string, body: { accion: 'desestimar' | 'confirmar_infraccion' | 'ocultar'; comentarioAdmin?: string }) =>
  request<any>(`/reportes/${id}/resolver`, 'PATCH', body),
```

---

## 5. Orden de tareas sugerido

1. Backend: migración de columna `origen` + ampliar seed de `EstadoReporteEntity` + nuevo permiso `moderar-contenido`.
2. Backend: corregir `triggerAiContentModeration` para setear `origen` y unificar `entidad` (resolver G3, ver sección 6).
3. Backend: `GET /reportes`, `GET /reportes/:id` + tests.
4. Backend: `PATCH /reportes/:id/resolver` (con efecto sobre Review/Response + auditoría) + tests.
5. Backend (opcional, CA de US-PAD-03): `PATCH /reportes/:id/suspender-usuario`.
6. Frontend: página `/admin/moderacion` con tabla + filtros (consumiendo solo `GET`).
7. Frontend: modal de detalle + acciones de resolución.
8. Frontend: entrada de menú + ícono en `layout.tsx`.
9. Pruebas manuales end-to-end: publicar una reseña con contenido sospechoso → verificar que aparece en la bandeja → resolver → verificar que la reseña se oculta/permanece según la acción.

---

## 6. Decisiones pendientes de confirmar antes de codear

- **G3**: ¿cómo diferenciar "reseña" de "respuesta a reseña" en el filtro por Entidad? Opciones: (a) extender `TipoContenidoReportable`, (b) agregar columna `subtipo`, (c) dejarlo solo en `motivo`/detalle sin filtro dedicado.
- **Nombres de estado**: confirmar si "resuelto" y "desestimado" son dos valores de `EstadoReporteEntity.nombre`, o si se prefiere un único estado `'resuelto'` con un campo adicional `resultado`.
- **Suspender usuario**: confirmar si ya existe lógica de baja lógica reutilizable en `userService` o hay que construirla.
- **Alcance de "ocultar contenido"**: ¿la reseña oculta debe seguir contando en `cantidadReviews`/promedio del POI (`recalcularPromedioPoi`), o hay que excluirla? Definir antes de tocar `getReviewsByPoi`.
