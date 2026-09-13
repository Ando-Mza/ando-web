# US-GIT-09: Eliminación de imágenes de un POI por el Administrador

## Información General
- **Identificador:** US-GIT-09
- **Actor:** Administrador
- **Puntos de Historia:** 2
- **Precondiciones:**
  - El Administrador debe estar autenticado con rol de Administrador.
  - El POI debe tener al menos una imagen cargada.
- **Historias de Usuario Relacionadas:** US-ACC-03, US-PAD-03, US-PAD-04

---

## Descripción General
**Como** Administrador  
**Quiero** poder eliminar cualquier imagen de un POI  
**Para** retirar contenido inapropiado, desactualizado o que no cumpla con las políticas de la plataforma.

---

## Descripción Funcional
El Administrador accede al detalle de cualquier POI y puede visualizar todas las imágenes asociadas al mismo, independientemente de si fueron cargadas por el equipo en la carga inicial o por un Prestador. Puede seleccionar una o varias imágenes para eliminar. El sistema solicita confirmación antes de ejecutar la eliminación. Al confirmar, el sistema elimina la URL de ImagenPOI y el archivo correspondiente del bucket de Cloudflare R2. Cualquier eliminación queda registrada en el log del sistema con fecha, hora y Administrador responsable.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador presiona el botón “eliminar imagen” | El sistema elimina la URL de ImagenPOI, borra el archivo de Cloudflare R2 y registra la acción en el log | - |
| El Administrador intenta eliminar la única imagen de un POI presionando el botón “eliminar imagen” | El sistema le advierte "El POI quedará sin imágenes. ¿Confirmás la eliminación?" y procede sólo si el Turista presiona el botón “confirmar”. | - |
| El Administrador presiona el botón “cancelar” la eliminación de la única imagen | El sistema conserva la imagen sin cambios | - |
| La eliminación del archivo en Cloudflare R2 falla | El sistema muestra por pantalla "No fue posible eliminar la imagen en este momento. Intentá más tarde." y no elimina la URL de ImagenPOI para mantener consistencia | - |
| Si el Administrador presiona el botón “eliminar imagen” que ya no existe en el bucket de Cloudflare R2 (por ejemplo por una eliminación previa inconsistente) | El sistema elimina igualmente la URL de ImagenPOI para limpiar el registro huérfano. | - |
