# US-RYV-02: Registro de Reseña Textual

## Información General
- **Identificador:** US-RYV-02
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Turista debe estar autenticado en el sistema.
  - El negocio o POI debe existir en la plataforma.
  - El Turista debe haber visitado o agregado previamente el lugar en un itinerario.
- **Historias de Usuario Relacionadas:** US-GDI-01, US-GDI-02, US-GIT-04, US-RYV-01, US-GIT-07, US-RYV-03, US-RYV-04, US-RYV-05

---

## Descripción General
**Como** Turista  
**Quiero** registrar una reseña textual sobre un negocio o punto de interés visitado  
**Para** compartir mi experiencia y ayudar a otros Usuarios en la toma de decisiones.

---

## Descripción Funcional
El sistema debe permitir que los Turistas autenticados publiquen reseñas textuales sobre negocios turísticos, servicios o POIs registrados en la plataforma. Para ello, el Usuario podrá acceder al perfil del lugar y completar un formulario de reseña ingresando un comentario y una puntuación asociada. El sistema deberá validar que la reseña cumpla con los requisitos mínimos de contenido y moderar automáticamente contenido ofensivo o inapropiado mediante reglas de validación. Una vez publicada, la reseña quedará visible en el perfil público del negocio o POI y será utilizada por el sistema para calcular valoraciones generales y alimentar recomendaciones futuras.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista accede a la tarjeta de un negocio o POI | Que el sistema muestre la opción “Escribir reseña” | - |
| El Turista selecciona “Escribir reseña” | Que el sistema muestre un formulario con campo de comentario y puntuación con estrellas, teniendo como campo opcional “Agregar fotos o videos” | - |
| El Turista completa correctamente la reseña y presiona “Publicar” | Que el sistema registre la reseña exitosamente | - |
| El Turista deja el comentario vacío | Que el sistema deshabilite el botón “Publicar” | - |
| El Turista ingresa una reseña con contenido ofensivo o prohibido | Que el sistema detecte el contenido y muestre un mensaje indicando que la reseña incumple las normas de la comunidad: “Tu reseña incumple las normas de la comunidad” | - |
| La reseña se publica correctamente | Que la reseña aparezca visible en el perfil público del negocio o POI | - |
| El Turista intenta publicar múltiples reseñas sobre el mismo lugar en un período restringido | Que el sistema bloquee la acción y muestre el mensaje “Ya has realizado una reseña recientemente sobre este lugar” | - |
| El Turista cancela la publicación antes de guardar | Que el sistema solicite confirmación antes de descartar el comentario ingresado abriendo un modal que indique “Descartar Reseña. ¿Estas seguro que deseas cancelar la publicación? Se perderá el contenido ingresado” y permita al usuario decidir entre “Seguir editando” y “Descartar” | - |
| La reseña es registrada exitosamente | Que el sistema actualice automáticamente la valoración promedio del negocio o POI | - |
