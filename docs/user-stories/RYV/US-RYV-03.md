# US-RYV-03: Carga de Fotos en Reseña

## Información General
- **Identificador:** US-RYV-03
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Turista debe estar autenticado en el sistema.
  - El negocio o POI debe existir.
  - El Turista debe estar creando o editando una reseña válida.
- **Historias de Usuario Relacionadas:** US-RYV-01, US-RYV-02, US-GIT-06, US-GIT-07, US-GDI-02, US-GIT-10

---

## Descripción General
**Como** Turista  
**Quiero** adjuntar fotos a mis reseñas  
**Para** compartir evidencia visual de mi experiencia y brindar información más útil a otros Usuarios

---

## Descripción Funcional
El sistema debe permitir que los Turistas autenticados carguen imágenes junto con una reseña textual sobre un negocio turístico o POI. Durante la creación de la reseña, el Usuario podrá seleccionar una o múltiples imágenes desde su dispositivo. El sistema deberá validar el formato, tamaño y cantidad máxima permitida de archivos antes de almacenarlos. Las imágenes quedarán asociadas a la reseña y visibles en el perfil público del negocio o POI. Además, el sistema podrá aplicar procesos automáticos de moderación de contenido para detectar imágenes inapropiadas o que incumplan las normas de la comunidad.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista accede al formulario de reseña | Que el sistema muestre la opción “Agregar fotos” | - |
| El Turista selecciona imágenes válidas | Que el sistema permita previsualizar las imágenes antes de publicarlas | - |
| El Turista carga imágenes en formato permitido (JPG, PNG o WEBP) | Que el sistema almacene correctamente las imágenes asociadas a la reseña | - |
| El Turista intenta cargar un archivo con formato no permitido | Que el sistema muestre el mensaje “Formato de archivo no válido” | - |
| El Turista intenta cargar imágenes que superan el tamaño máximo permitido | Que el sistema bloquee la carga y muestre un mensaje indicando el límite permitido | - |
| El Turista supera la cantidad máxima de imágenes permitidas | Que el sistema impida continuar con la carga y muestre el mensaje correspondiente | - |
| El sistema detecta contenido inapropiado en una imagen | Que la imagen sea rechazada y se notifique al Usuario sobre el incumplimiento de las normas | - |
| El Turista publica correctamente la reseña con imágenes | Que las fotos queden visibles en el perfil público del negocio o POI | - |
| El Turista elimina una imagen antes de publicar la reseña | Que el sistema quite la imagen de la vista previa sin afectar el resto de la reseña | - |
| El Turista cancela la creación de la reseña | Que el sistema descarte automáticamente las imágenes cargadas temporalmente | - |
