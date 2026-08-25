# US-GIT-07: Gestión de Multimedia como Prestador

## Información General
- **Identificador:** US-GIT-07
- **Actor:** Prestador
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Prestador debe estar autenticado.
  - Debe tener al menos un POI dado de alta en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-CYN-01, US-CYN-02

---

## Descripción General
**Como** Prestador  
**Quiero** subir imágenes propias de mi POI  
**Para** que los Turistas puedan ver fotos reales y actualizadas de mi establecimiento dentro de la plataforma.

---

## Descripción Funcional
El Prestador accede al detalle de su POI y selecciona la opción "Gestión de imágenes". El sistema genera una URL prefirmada mediante el backend y el cliente sube la imagen directamente al bucket de Cloudflare R2. Antes de almacenarse, la imagen es procesada en background por Sharp (redimensionado a resoluciones thumbnail, medium y full, y compresión con pérdida aceptable). Una vez procesada, el sistema almacena la URL pública resultante en la entidad ImagenPOI asociada al POI. El Prestador puede subir, visualizar, reemplazar y eliminar las imágenes de su POI.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador sube una imagen en formato válido (JPG, PNG o WEBP) | El sistema genera la URL prefirmada, sube la imagen a Cloudflare R2, la procesa en background y almacena la URL pública en ImagenPOI | - |
| El Prestador sube una imagen en formato no soportado | El sistema muestra "El archivo debe ser una imagen en formato JPG, PNG o WEBP" y bloquea el botón “guardar” | - |
| El Prestador sube una imagen que supera el tamaño máximo permitido | El sistema muestra "La imagen no puede superar los 30 MB" y bloquea el botón “guardar” | - |
| El Prestador presiona el botón “eliminar imagen” de su POI | El sistema elimina la URL de ImagenPOI y el archivo del bucket de Cloudflare R2. Muestra un mensaje “Su imagen fue eliminada” | - |
| La imagen fue subida pero el procesamiento en background aún no finalizó | El sistema muestra un mensaje de "Procesando imagen..." y la imagen se visualiza una vez que el proceso finaliza | - |
| El Prestador presiona el botón de “Subir Fotos” y adjunta la misma pero el servicio de Cloudflare R2 no está disponible | El sistema muestra por pantalla el mensaje "No fue posible subir la imagen en este momento. Intentá más tarde." y no almacena ningún dato parcial. | - |
| El Prestador presiona el botón “Subir Fotos”, selecciona la misma pero pierde la conexión durante la subida | La operación se cancela y el sistema no almacena ningún registro parcial en ImagenPOI. | - |
| El Prestador presiona el botón “Subir Fotos” , selecciona la misma pero el procesamiento de la imagen falla en background | El sistema muestra por pantalla el mensaje “ La imagen no pudo procesarse correctamente, intente subirla nuevamente". | - |
| El Prestador intenta eliminar la única imagen de su POI presionando el ícono del botón “eliminar imagen” | El sistema le advierte "Tu POI quedará sin imágenes. ¿Confirmás la eliminación?" y procede sólo si el Prestador presiona el botón “confirmar” . | - |
| El Prestador selecciona más de una imagen y presiona “Eliminar” | El sistema elimine todas las imágenes seleccionadas del POI en simultáneo | - |
| El Prestador quiere trabajar sobre más de una imagen | El sistema permita la selección de más de una para aplicar acciones indicándose con un check las que se encuentran seleccionadas | - |
