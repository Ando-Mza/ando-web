# US-GIT-01: Carga de días y horarios de un POI

## Información General
*   **Identificador:** US-GIT-01
*   **Actor:** Prestador
*   **Puntos de Historia:** 3
*   **Precondiciones:**
    *   El Prestador debe estar autenticado con rol de Prestador.
    *   El POI debe existir previamente en el sistema.
*   **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-CYN-02, US-GIT-02, US-GIT-03, US-GIT-04, US-GIT-08, US-GDI-01, US-GDI-02, US-MRIA-04, US-MRIA-06, US-NYA-02.

---

## Descripción General
Como Prestador,
Quiero cargar los días y horarios de atención de un POI,
Para que los Turistas puedan conocer cuándo pueden visitarlo y el sistema pueda incluirlo en itinerarios viables.

---

## Descripción Funcional
El Prestador accede al detalle de un POI existente y selecciona la opción de gestión de horarios. El sistema presenta un modal emergente donde puede seleccionar los días mediante un selector horizontal con scroll responsivo y definir el horario de atención (horaDesde - horaHasta) utilizando un selector híbrido de hora (`HybridTimePicker` con rueda cilíndrica táctil y teclado numérico) o accesos rápidos a turnos habituales (Mañana 09:00-13:30, Tarde 16:00-20:00, Noche 20:00-00:00, Corrido 09:00-18:00).

El sistema valida en tiempo real que horaHasta sea posterior a horaDesde (admitiendo turnos nocturnos) y que no existan superposiciones con horarios preexistentes para el mismo día. Una vez guardados, los horarios quedan disponibles para los Turistas y para el motor de recomendación.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador selecciona un día en el selector horizontal y configura horaDesde y horaHasta (vía rueda/teclado o accesos rápidos de turnos habituales) y presiona "Guardar" | El sistema almacena el Día y Horario asociado al POI y muestra el mensaje "Horario guardado exitosamente" | Modal Cargar Horarios (`GITDashboardScreen`) |
| El Prestador ingresa una horaDesde posterior o igual a horaHasta | El sistema muestra "El horario de apertura (XX:XX) no puede ser posterior o igual al horario de cierre (YY:YY)." y deshabilita el botón "Guardar" | Modal Cargar Horarios (`GITDashboardScreen`) |
| El Prestador intenta cargar un horario que se superpone con otro ya existente del mismo día | El sistema detecta el conflicto y muestra "El rango XX:XX - YY:YY para el [Día] se superpone con un horario ya definido para este POI." y deshabilita el botón "Guardar" | Modal Cargar Horarios (`GITDashboardScreen`) |
| El Prestador presiona cualquiera de los botones de acceso rápido (Mañana, Noche, Tarde, Corrido) | El sistema completa automáticamente los campos horaDesde y horaHasta con los rangos configurados (Mañana: 09:00-13:30, Tarde: 16:00-20:00, Noche: 20:00-00:00, Corrido: 09:00-18:00) | Modal Cargar Horarios (`GITDashboardScreen`) |
| El Prestador guarda correctamente un horario | Los horarios quedan visibles inmediatamente en el perfil público del POI para los Turistas | Perfil de POI / Vista Turista |
