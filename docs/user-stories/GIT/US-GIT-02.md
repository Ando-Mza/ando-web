# US-GIT-02: Modificación de días y horarios de un POI

## Información General
*   **Identificador:** US-GIT-02
*   **Actor:** Prestador
*   **Puntos de Historia:** 2
*   **Precondiciones:**
    *   El Prestador de servicio debe estar autenticado.
    *   El POI debe tener al menos un Día y Horario del POI previamente cargados.
*   **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-GIT-01

---

## Descripción General
Como Prestador,
quiero modificar los días y horarios de atención de un POI,
para que la información disponible para los turistas siempre esté actualizada ante cualquier cambio operativo.

---

## Descripción Funcional
El Prestador de servicio accede a la gestión de horarios de un POI existente y visualiza los rangos de días y horarios ya cargados. Puede seleccionar cualquiera de ellos para editarlo. El sistema precarga los valores actuales en el formulario de edición.

Al guardar, el sistema valida los mismos criterios que en la carga inicial (horaDesde < horaHasta, no superposición de días) y actualiza inmediatamente la información pública del POI.

Si el cambio afecta itinerarios ya generados que incluían ese POI en el horario modificado, el sistema los marca como "requiere revisión" al POI del itinerario y notifica a los turistas afectados.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador de servicio modifica un rango de días u horario y guarda correctamente | El sistema actualiza el dato y muestra un popup "Cambios guardados exitosamente" | Pantalla de modificación de un POI (Popup) |
| El cambio de horario afecta un itinerario ya generado por un turista | El sistema notifica a los turistas afectados que revisen su itinerario y marca el POI en el itinerario como "requiere revisión" | Pantalla de Notificación / Alerta de Itinerario |
| El Prestador de servicio intenta guardar datos inválidos | El sistema aplica las mismas validaciones que en la carga y muestra el error correspondiente | Pantalla de edición con errores |
| El Prestador de servicio cierra la pantalla sin guardar | El sistema muestra un diálogo "¿Salir sin guardar los cambios?" y descarta las modificaciones si hace click en “aceptar” | Pantalla de confirmación de descarte |
