# US-GIT-11: Eliminación de imágenes de un POI por el Administrador

## Información General
*   **Identificador:** US-GIT-11
*   **Actor:** Administrador
*   **Puntos de Historia:** 2
*   **Precondiciones:**
    *   El Administrador debe estar autenticado con rol de Administrador.
    *   El POI debe tener al menos una imagen (cargada por prestador, admin o reseña).
*   **Historias de Usuario Relacionadas:** US-GIT-06, US-GIT-09, US-GIT-10

---

## Descripción General
Como administrador,
quiero poder eliminar cualquier imagen de un POI,
para retirar contenido inapropiado, desactualizado o que no cumpla con las políticas de la plataforma.

---

## Descripción Funcional
El Administrador tiene la potestad de auditar y moderar el contenido gráfico del perfil público de los POIs. Al acceder al visor de un POI desde el panel administrativo, se despliega el listado completo de imágenes asociadas (tanto URLs externas agregadas por administradores, imágenes subidas por prestadores o fotos adjuntas a reseñas por turistas).

El Administrador puede seleccionar cualquier imagen para eliminarla permanentemente. El sistema solicita confirmación antes de la eliminación y, tras confirmarse, la da de baja en la base de datos y borra el archivo del bucket Cloudflare R2 (si corresponde), registrando el evento en la bitácora de auditoría.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El administrador selecciona una imagen de un POI, presiona el botón “eliminar imagen” y confirma la acción | El sistema elimina la imagen de ImagenPOI (y del bucket R2 si corresponde), y muestra el popup "Imagen eliminada exitosamente" | Panel de Moderación de Imágenes / Detalle de POI |
| El administrador confirma la eliminación de una imagen | La imagen deja de estar visible de inmediato en el perfil público del POI para turistas | Perfil Público del POI |
| El administrador ejecuta la eliminación de una imagen | El sistema registra en la bitácora de auditoría la acción (quién eliminó, a qué POI pertenecía y en qué fecha/hora) | Logs de Auditoría del Admin |
| El administrador cancela la eliminación | La imagen se conserva en el POI sin alterarse | Diálogo de Confirmación |
