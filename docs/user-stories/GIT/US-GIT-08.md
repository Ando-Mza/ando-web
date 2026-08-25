# US-GIT-08: Gestión de Multimedia como Turista

## Información General
- **Identificador:** US-GIT-08
- **Actor:** Turista
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El Turista debe estar autenticado.
  - Debe estar redactando o haber publicado una reseña sobre un POI.
- **Historias de Usuario Relacionadas:** US-ACC-01, US-ACC-03, US-RYV-01, US-RYV-02

---

## Descripción General
**Como** Turista  
**Quiero** adjuntar imágenes a mi reseña de un POI  
**Para** complementar mi opinión con evidencia visual y ayudar a otros Turistas a conocer mejor el lugar.

---

## Descripción Funcional
Al redactar una reseña sobre un POI, el Turista puede adjuntar una o más imágenes desde su dispositivo. El sistema genera una URL prefirmada mediante el backend y el cliente sube la imagen directamente al bucket de Cloudflare R2. La imagen es procesada en background por Sharp antes de almacenarse. Una vez procesada, el sistema almacena la URL pública resultante asociada a la reseña. Las imágenes de la reseña se visualizan en el perfil público del POI junto al comentario del Turista.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista presiona el botón “subir imagen” en su reseña y adjunta una imagen válida (JPG, PNG o WEBP) a su reseña | El sistema sube la imagen a Cloudflare R2, la procesa en background y la muestra junto a la reseña en el perfil del POI | - |
| El Turista presiona el botón “subir imagen” en su reseña y adjunta un archivo en formato no soportado | El sistema muestra por pantalla el mensaje "El archivo debe ser una imagen en formato JPG, PNG o WEBP" y bloquea el botón “guardar” | - |
| El Turista presiona el botón “subir imagen” en su reseña y adjunta una imagen que supera el tamaño máximo permitido | El sistema muestra "La imagen no puede superar los 30 MB" y bloquea el botón “guardar” | - |
| El Turista presiona el botón “eliminar imagen” antes de publicar su reseña | El sistema elimina la URL asociada a la reseña y el archivo del bucket de Cloudflare R2. Se muestra por pantalla el mensaje “Su imagen fue eliminada” | - |
| La imagen fue subida pero el procesamiento en background aún no finalizó | El sistema muestra un mensaje de "Procesando imagen..." y la imagen se visualiza una vez que el proceso finaliza | - |
| El Turista presiona el botón “subir imagen ”en su reseña, pero al selecciona la misma pero pierde la conexión durante la subida | La operación se cancela y el sistema no almacena ningún registro parcial en ImagenPOI ni de la reseña. | - |
| El Turista intenta eliminar la única imagen de su reseña presionando el botón “eliminar imagen” | El sistema le advierte "Tu reseña quedará sin imágenes. ¿Confirmás la eliminación?" y procede sólo si el Turista presiona el botón “confirmar” | - |
