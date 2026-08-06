# US-GIT-03: Eliminación de días y horarios de un POI

## Información General
*   **Identificador:** US-GIT-03
*   **Actor:** Prestador
*   **Puntos de Historia:** 2
*   **Precondiciones:**
    *   El Prestador debe estar autenticado.
    *   El POI debe tener al menos un Día y Horario cargados.
*   **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-GIT-01, US-GIT-02, US-GIT-04

---

## Descripción General
Como Prestador,
quiero eliminar uno o todos los rangos de días y horarios de un POI,
para que pueda corregir información incorrecta o reflejar que el lugar ya no tiene horarios definidos en el sistema.

---

## Descripción Funcional
El Prestador de servicio accede a la gestión de horarios de un POI y puede seleccionar un rango de Día y Horario por vez para eliminarlo. El sistema solicita confirmación antes de ejecutar la eliminación.

Al confirmar, el sistema elimina el registro y actualiza el perfil público del POI. Si el rango eliminado afecta itinerarios ya generados, el sistema notifica a los turistas afectados.

Si se eliminan todos los horarios de un POI, el sistema muestra "Horario no disponible" en el perfil público del lugar y lo excluye de los filtros de disponibilidad del motor de recomendación.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador elimina un rango de días y horario y presiona el botón “aceptar” en la confirmación | El sistema elimina el registro y actualiza el perfil público del POI | Pantalla de gestión de horarios del POI |
| El prestador de servicio elimina el último rango de días y horarios disponible de un POI | El sistema muestra "Horario no disponible" en el perfil público del POI y excluye el POI de los filtros de disponibilidad | Pantalla de la vista de horarios del POI / Perfil Público |
| La eliminación afecta itinerarios ya generados | El sistema notifica a los turistas afectados que revisen su itinerario | Notificación push de la app |
| El Prestador de servicio cancela la eliminación | El sistema conserva el registro sin cambios | Pantalla de confirmación (Modal) |
