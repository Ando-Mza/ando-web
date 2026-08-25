# US-RYV-01: Valoración por Puntuación

## Información General
- **Identificador:** US-RYV-01
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar autenticado en el sistema.
  - El Usuario debe tener al menos un itinerario en estado "Finalizado" que contenga el POI a reseñar.
  - El Usuario debe tener los permisos de ubicación e imágenes aceptados.
- **Historias de Usuario Relacionadas:** US-RYV-02, US-RYV-03, US-RYV-04, US-RYV-05, US-GDI-01, US-GDI-02, US-GIT-04, US-GIT-07, US-GIT-10

---

## Descripción General
**Como** Turista  
**Quiero** calificar (con un sistema de puntaje simbolizado con estrellas) y dejar una reseña escrita con fotografías sobre un lugar o actividad que visité  
**Para** compartir mi experiencia con la comunidad y ayudar al algoritmo a generar mejores recomendaciones.

---

## Descripción Funcional
Permite realizar una reseña o valoración de un POI finalizado, mediante un sistema de puntaje simbolizado con 5 estrellas y aportando a la calificación promedio del mismo. La misma se verá identificada por el nombre del usuario junto con su imagen de perfil.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista tenga POIs con estado “Finalizado” | Que el sistema habilite un formulario de “Nueva Reseña” para ese POI finalizado, mediante un botón diferenciado | - |
| El Turista llene el formulario del POI | Que la app exija una descripción con calificación obligatoria de 1-5 estrellas, texto libre de hasta 500 caracteres opcional. | - |
| El Turista llene el formulario | Que la app permita adjuntar hasta 3 imágenes de la actividad. | - |
| El Turista realice una valoración | Que se muestre su nombre de usuario con su respectiva foto de perfil y fecha en la que se elaboró la reseña | - |
| El Turista envía el formulario de reseña con una calificación válida y texto | Que el sistema guarde la reseña, actualice el puntaje promedio del lugar y muestre un mensaje de éxito, reflejando el comentario inmediatamente en la vista de detalles del POI | - |
