# US-GIT-01: Carga de días y horarios de un POI

## Información General
*   **Identificador:** US-GIT-01
*   **Actor:** Prestador
*   **Puntos de Historia:** 3
*   **Precondiciones:**
    *   El Prestador debe estar autenticado con rol de Prestador.
    *   El POI debe existir previamente en el sistema.
*   **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-CYN-01, US-CYN-02

---

## Descripción General
Como Prestador,
quiero cargar los días y horarios de atención de un POI,
para que los turistas puedan conocer cuándo pueden visitarlo y el sistema pueda incluirlo en itinerarios viables.

---

## Descripción Funcional
El Prestador accede al detalle de un POI existente y selecciona la opción de gestión de horarios. El sistema presenta un formulario donde puede definir un rango de días (diasDesde - diasHasta) y para ese rango, un horario de atención (horaDesde - horaHasta).

El sistema debe validar que `horaHasta` sea posterior a `horaDesde`. El Prestador de servicio puede agregar múltiples combinaciones de rango de días y horario para un mismo POI, permitiendo modelar distintas configuraciones según el día o la temporada.

Una vez guardados, los horarios quedan disponibles para ser consultados por los turistas y utilizados por el motor de recomendación para filtrar POIs disponibles según la fecha y hora del itinerario.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador de servicio carga correctamente un rango de días y horario y presiona el botón “guardar” | El sistema almacena el rango de Días y Horarios asociados al POI y muestra un popup "Horario guardado exitosamente" | Pantalla de modificación de un POI |
| El Prestador de servicio ingresa una horaHasta anterior o igual a horaDesde | El sistema muestra "El horario de cierre debe ser posterior al de apertura" y no permite hacer click en el botón “guardar” | Pantalla con el mensaje y el botón bloqueado |
| El Prestador de servicio guardó el horario y rango de días correctamente | Los horarios quedan visibles en el perfil público del POI para los turistas | Pantalla de visualización del POI con sus horarios y días |
| El Prestador de servicio intenta cargar un rango de días que se superpone con uno ya existente | El sistema detecta el conflicto y muestra "El rango de días se superpone con un rango de días ya definido para este POI" y no permite hacer click en el botón “guardar” | Pantalla con mensaje y botón bloqueado |
