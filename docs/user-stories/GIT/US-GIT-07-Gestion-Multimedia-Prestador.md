# US-GIT-07: Gestión de Multimedia como Prestador

## Información General
*   **Identificador:** US-GIT-07
*   **Actor:** Prestador
*   **Puntos de Historia:** 8
*   **Precondiciones:**
    *   El Prestador debe estar autenticado con rol de Prestador.
    *   Debe tener al menos un POI dado de alta en el sistema.
*   **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-CYN-01, US-CYN-02.

---

## Descripción General
Como Prestador,  
Quiero subir, visualizar, reemplazar y eliminar imágenes de mi POI,  
Para que los Turistas puedan ver fotos reales y actualizadas de mi establecimiento dentro de la plataforma.

---

## Descripción Funcional
El Prestador accede a la sección de **Gestión Multimedia** del detalle de su POI en el panel de control (`GITDashboardScreen`). Al seleccionar "Subir Imagen" o "Reemplazar Imagen", el cliente solicita una URL prefirmada al backend y sube el archivo directamente al bucket de almacenamiento (Cloudflare R2).

Antes de almacenarse en el registro definitivo del POI, la imagen es procesada en background por el servicio de imágenes (redimensionado a resoluciones thumbnail, medium y full, y compresión optimizada). Una vez finalizado el procesamiento, el sistema almacena la URL pública resultante en la entidad `ImagenPOI` asociada al POI.

El Prestador puede gestionar la galería de su POI (subir, visualizar, reemplazar y eliminar). Si intenta eliminar la única imagen de su POI, el sistema solicita confirmación advirtiendo que el lugar quedará sin imágenes.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador sube una imagen en formato válido (JPG, PNG o WEBP) | El sistema genera la URL prefirmada, sube la imagen a Cloudflare R2, la procesa en background y almacena la URL pública en `ImagenPOI` | Sección Multimedia (`GITDashboardScreen`) |
| El Prestador sube un archivo en formato no soportado (ej. PDF, GIF, MP4) | El sistema muestra "El archivo debe ser una imagen en formato JPG, PNG o WEBP" y deshabilita la subida | Sección Multimedia (`GITDashboardScreen`) |
| El Prestador sube una imagen que supera el tamaño máximo permitido (30 MB) | El sistema muestra "La imagen no puede superar los 30 MB" y deshabilita el botón de guardar | Sección Multimedia (`GITDashboardScreen`) |
| El Prestador presiona el botón "Eliminar imagen" de su POI (teniendo 2 o más imágenes) | El sistema elimina el registro en `ImagenPOI` y el archivo del bucket de Cloudflare R2, mostrando el mensaje "Su imagen fue eliminada exitosamente" | Sección Multimedia (`GITDashboardScreen`) |
| El Prestador intenta eliminar la única imagen restante de su POI | El sistema muestra una advertencia "Tu POI quedará sin imágenes. ¿Confirmás la eliminación?" y procede sólo tras presionar "Confirmar" | Modal de Confirmación (`GITDashboardScreen`) |
| El Prestador reemplaza una imagen existente presionando "Reemplazar esta imagen por una nueva" | El sistema elimina la imagen anterior del bucket y almacena la nueva URL procesada, mostrando el mensaje "Ha actualizado una de las imágenes de su POI" | Sección Multimedia (`GITDashboardScreen`) |
| La imagen fue subida pero el procesamiento en background aún no finalizó | El sistema muestra el estado "Procesando imagen..." en la tarjeta de la imagen hasta que el proceso concluye | Sección Multimedia (`GITDashboardScreen`) |
| El servicio de almacenamiento Cloudflare R2 no está disponible al momento de la subida | El sistema muestra "No fue posible subir la imagen en este momento. Intentá más tarde." y no almacena datos parciales | Sección Multimedia (`GITDashboardScreen`) |
| Se pierde la conexión a internet durante el proceso de subida | La operación se cancela automáticamente y el sistema no almacena registros incompletos en `ImagenPOI` | Sección Multimedia (`GITDashboardScreen`) |
| El procesamiento en background de la imagen falla | El sistema muestra el mensaje "La imagen no pudo procesarse correctamente, intente subirla nuevamente" | Sección Multimedia (`GITDashboardScreen`) |
