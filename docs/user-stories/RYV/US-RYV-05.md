# US-RYV-05: Promedio de Valoración por POI

## Información General
- **Identificador:** US-RYV-05
- **Actor:** Turista
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El negocio o POI debe existir en la plataforma.
  - El negocio o POI debe tener al menos una reseña válida registrada.
- **Historias de Usuario Relacionadas:** US-RYV-01, US-RYV-02, US-RYV-04, US-GIT-04

---

## Descripción General
**Como** Turista  
**Quiero** visualizar el promedio de valoración de un POI o negocio turístico  
**Para** evaluar rápidamente la calidad y experiencia general de otros Usuarios

---

## Descripción Funcional
El sistema debe calcular y mostrar automáticamente la valoración promedio de cada negocio turístico o POI a partir de las puntuaciones registradas en las reseñas realizadas por los Turistas. La valoración deberá actualizarse dinámicamente cada vez que se agregue, modifique o elimine una reseña válida. El promedio será visible tanto en el perfil detallado del lugar como en listados, búsquedas, recomendaciones y resultados del mapa. Además, el sistema deberá mostrar la cantidad total de reseñas utilizadas para el cálculo.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista accede al perfil de un negocio o POI con reseñas registradas | Que el sistema muestre la puntuación promedio visible junto a la cantidad de reseñas | - |
| Se registra una nueva reseña válida | Que el sistema recalcule automáticamente el promedio de valoración | - |
| Se elimina una reseña existente | Que el sistema actualice el promedio excluyendo dicha reseña | - |
| El negocio o POI posee una única reseña | Que el sistema muestre la puntuación exacta otorgada por el Usuario | - |
| El negocio o POI no tiene reseñas registradas | Que el sistema muestre el mensaje “Sin valoraciones disponibles” | - |
| El Turista realiza una búsqueda de lugares | Que el sistema muestre el promedio de valoración en cada resultado listado | - |
| El Turista visualiza un POI en el mapa | Que el sistema permita consultar rápidamente su puntuación promedio | - |
| El promedio de valoración cambia | Que el sistema refleje el nuevo valor inmediatamente sin necesidad de recargar manualmente la página | - |
