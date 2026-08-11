# US-GIT-04: Visualización de Días y Horarios de un POI

## Información General
*   **Identificador:** US-GIT-04
*   **Actor:** Turista
*   **Puntos de Historia:** 2
*   **Precondiciones:**
    *   El Turista debe estar autenticado.
    *   El POI debe tener al menos un rango de días y horarios cargados.
*   **Historias de Usuario Relacionadas:** US-ACC-01, US-ACC-02, US-GIT-01, US-GIT-02, US-GIT-03

---

## Descripción General
Como Turista,
quiero ver los días y horarios de atención de un POI,
para que pueda saber si estará abierto en la fecha y hora en que planea visitarlo.

---

## Descripción Funcional
Al acceder a un POI, el Turista puede visualizar los rangos de días y horarios de atención cargados en el sistema. El sistema indica además si el POI se encuentra actualmente abierto o cerrado en base a la fecha y hora del momento de la consulta, comparando con los rangos almacenados.

El motor de recomendación utiliza esta información para no incluir en los itinerarios generados POIs que estén cerrados durante el horario planificado de visita.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista consulta el perfil de un POI con horarios cargados | El sistema muestra los rangos de días y horarios y el estado actual (Abierto/Cerrado) | Pantalla de visualización del POI |
| El Turista consulta un POI que está cerrado en el momento de la consulta | El sistema muestra el estado actual "Cerrado" e indica el próximo horario de apertura disponible | Pantalla de visualización del POI |
| El motor de recomendación genera un itinerario | El sistema excluye automáticamente los POIs que estén cerrados en el horario planificado de la visita del turista | Vista de Generación de Itinerarios |
| El Turista consulta un POI que no tiene horarios cargados | El sistema muestra "Horario no disponible." | Pantalla de visualización del POI |
| El Turista tiene un itinerario generado y el horario de un POI incluido cambia | El sistema notifica al turista que su itinerario requiere revisión | Notificación de revisión de itinerario |
