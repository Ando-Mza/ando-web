# US-GIT-09: Gestión de Multimedia como Prestador

## Información General
*   **Identificador:** US-GIT-09
*   **Actor:** Prestador turístico
*   **Puntos de Historia:** 5
*   **Precondiciones:**
    *   El Prestador debe estar autenticado.
    *   Debe tener al menos un POI dado de alta en el sistema.
*   **Historias de Usuario Relacionadas:** US-GIT-01, US-GIT-07

---

## Descripción General
Como prestador turístico,
quiero subir imágenes propias de mi POI,
para que los turistas puedan ver fotos reales y actualizadas de mi establecimiento dentro de la plataforma.

---

## Descripción Funcional
El Prestador accede al detalle de su POI y selecciona la opción "Gestión de imágenes". El sistema genera una URL prefirmada mediante el backend y el cliente sube la imagen directamente al bucket de Cloudflare R2.

Antes de almacenarse, la imagen es procesada en background por *Sharp* (redimensionado a resoluciones thumbnail, medium y full, y compresión con pérdida aceptable). Una vez procesada, el sistema almacena la URL pública resultante en la entidad ImagenPOI asociada al POI. El prestador puede subir, visualizar, reemplazar y eliminar las imágenes de su POI.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El prestador sube una imagen en formato válido (JPG, PNG o WEBP) | El sistema genera la URL prefirmada, sube a Cloudflare R2, la procesa en background y almacena la URL pública en ImagenPOI | Pantalla de Gestión de Imágenes |
| El prestador sube una imagen en formato no soportado | El sistema muestra "El archivo debe ser una imagen en formato JPG, PNG o WEBP" y bloquea el botón “guardar” | Pantalla de Gestión de Imágenes |
| El prestador sube una imagen que supera el tamaño máximo permitido | El sistema muestra "La imagen no puede superar los 100 GB" y bloquea el botón “guardar” | Pantalla de Gestión de Imágenes |
| El prestador presiona el botón “eliminar imagen” de su POI | El sistema elimina la URL de ImagenPOI y el archivo del bucket de Cloudflare R2, mostrando el mensaje “Su imagen fue eliminada” | Pantalla de Gestión de Imágenes |
| El prestador reemplaza una imagen existente presionando “reemplazar esta imagen por una nueva” | El sistema elimina la imagen anterior del bucket y almacena la nueva URL procesada, mostrando el mensaje “ha actualizado una de las imágenes de su POI” | Pantalla de Gestión de Imágenes |
| La imagen fue subida pero el procesamiento en background aún no finalizó | El sistema muestra un mensaje de "Procesando imagen..." en la vista previa del POI y la renderiza completamente una vez que el proceso finaliza | Perfil Público del POI / Gestión |
| El prestador presiona “subir imagen” pero Cloudflare R2 no está disponible | El sistema muestra por pantalla el mensaje "No fue posible subir la imagen en este momento. Intentá más tarde." y no almacena ningún dato parcial | Pantalla de Gestión de Imágenes |
| El prestador presiona “subir imagen” pero pierde la conexión durante la subida | La operación se cancela y el sistema no almacena ningún registro parcial en ImagenPOI ni en el bucket | Pantalla de Gestión de Imágenes |
| El prestador presiona “subir imagen” pero el procesamiento de la imagen falla en background | El sistema muestra por pantalla el mensaje “la imagen no pudo procesarse correctamente, intente subirla nuevamente” | Pantalla de Gestión de Imágenes |
| El prestador intenta eliminar la única imagen de su POI presionando “eliminar imagen” | El sistema le advierte "Tu POI quedará sin imágenes. ¿Confirmás la eliminación?" y procede sólo si el prestador presiona el botón “confirmar” | Diálogo de Confirmación |
