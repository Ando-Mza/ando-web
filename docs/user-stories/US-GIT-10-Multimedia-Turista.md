# US-GIT-10: Gestión de Multimedia como Turista

## Información General
*   **Identificador:** US-GIT-10
*   **Actor:** Turista
*   **Puntos de Historia:** 3
*   **Precondiciones:**
    *   El Turista debe estar autenticado.
    *   Debe estar redactando o haber publicado una reseña sobre un POI.
*   **Historias de Usuario Relacionadas:** US-GIT-04

---

## Descripción General
Como turista,
quiero adjuntar imágenes a mi reseña de un POI,
para complementar mi opinión con evidencia visual y ayudar a otros turistas a conocer mejor el lugar.

---

## Descripción Funcional
Al redactar una reseña sobre un POI, el turista puede adjuntar una o más imágenes desde su dispositivo. El sistema genera una URL prefirmada mediante el backend y el cliente sube la imagen directamente al bucket de Cloudflare R2.

La imagen es procesada en background por *Sharp* antes de almacenarse. Una vez procesada, el sistema almacena la URL pública resultante asociada a la reseña. Las imágenes de la reseña se visualizan en el perfil público del POI junto al comentario del turista.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El turista presiona “subir imagen” en su reseña, adjunta una imagen válida (JPG, PNG o WEBP) y la publica | El sistema sube la imagen a Cloudflare R2, la procesa en background y la muestra junto a la reseña en el perfil del POI | Formulario de Reseña / Perfil del POI |
| El turista presiona “subir imagen” en su reseña y adjunta un archivo en formato no soportado | El sistema muestra "El archivo debe ser una imagen en formato JPG, PNG o WEBP" y bloquea el botón “guardar” | Formulario de Reseña |
| El turista presiona “subir imagen” en su reseña y adjunta una imagen que supera el tamaño máximo permitido | El sistema muestra "La imagen no puede superar los 100 GB" y bloquea el botón “guardar” | Formulario de Reseña |
| El turista presiona “eliminar imagen” antes de publicar su reseña | El sistema elimina la URL asociada y el archivo del bucket, y muestra por pantalla "Su imagen fue eliminada" | Formulario de Reseña |
| La imagen fue subida pero el procesamiento en background aún no finalizó | El sistema muestra "Procesando imagen..." y la renderiza completamente una vez finalizado el proceso | Perfil del POI |
| El turista presiona “subir imagen” pero pierde la conexión durante la subida | La operación se cancela y el sistema no almacena ningún registro parcial en la reseña ni en el bucket | Formulario de Reseña |
| El turista intenta eliminar la única imagen de su reseña presionando “eliminar imagen” | El sistema advierte "Tu reseña quedará sin imágenes. ¿Confirmás la eliminación?" y procede si el turista hace click en “confirmar” | Diálogo de Confirmación |
