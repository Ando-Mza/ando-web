# US-RYV-04: Consulta de Reseñas

## Información General
- **Identificador:** US-RYV-04
- **Actor:** Turista
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El negocio o POI debe existir en la plataforma.
  - El negocio o POI debe tener al menos una reseña registrada.
- **Historias de Usuario Relacionadas:** US-RYV-01, US-RYV-02, US-RYV-03, US-GIT-04

---

## Descripción General
**Como** Turista  
**Quiero** consultar las reseñas y valoraciones de un negocio o punto de interés  
**Para** conocer las experiencias de otros Usuarios antes de visitarlo

---

## Descripción Funcional
El sistema debe permitir que los Turistas visualicen las reseñas textuales, puntuaciones y contenido multimedia asociados a un negocio turístico o POI. Al ingresar al perfil público de un lugar, el sistema mostrará el listado de reseñas registradas, incluyendo autor, fecha de publicación, puntuación otorgada y fotografías asociadas. Además, el Usuario podrá ordenar y filtrar las reseñas según distintos criterios, como puntuación, fecha o relevancia. El sistema también deberá mostrar el promedio general de valoraciones y la cantidad total de reseñas registradas para el lugar consultado.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista accede al perfil de un negocio o POI | Que el sistema muestre la sección de reseñas y valoraciones | - |
| El negocio o POI posee reseñas registradas | Que el sistema liste las reseñas mostrando comentario, puntuación, autor y fecha | - |
| El Turista selecciona una reseña con imágenes asociadas | Que el sistema permita visualizar las fotografías adjuntas | - |
| El Turista consulta las valoraciones del lugar | Que el sistema muestre la puntuación promedio y la cantidad total de reseñas | - |
| El Turista selecciona el ícono de “filtrar” y elige la opción ordenar reseñas por fecha | Que el sistema reorganice las reseñas desde la más reciente a la más antigua | - |
| El Turista selecciona el ícono de “filtrar” y elige la opción ordenar reseñas por puntuación seleccionada | Que el sistema reorganice las reseñas según la calificación otorgada | - |
| El Turista selecciona el ícono de “filtrar” y elige la opción ordenar reseñas por puntuación seleccionada y no hay reseñas con esa valoración | Que el sistema indique con un mensaje “No hay reseñas con esa valoración” | - |
| El Turista aplica filtros de búsqueda sobre las reseñas (por cantidad de estrellas, más recientes y más antiguas) | Que el sistema muestre únicamente las reseñas que cumplen los criterios seleccionados | - |
| El negocio o POI no posee reseñas registradas | Que el sistema muestre el mensaje “Este lugar aún no tiene reseñas” | - |
| El Turista accede desde un dispositivo móvil | Que el sistema adapte correctamente la visualización de reseñas e imágenes | - |
