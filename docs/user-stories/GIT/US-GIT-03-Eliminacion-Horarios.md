# US-GIT-03: Eliminación de días y horarios de un POI

## Información General
*   **Identificador:** US-GIT-03
*   **Actor:** Prestador
*   **Puntos de Historia:** 2
*   **Precondiciones:**
    *   El Prestador debe estar autenticado con rol de Prestador.
    *   El POI debe tener al menos un Día y Horario cargado previamente.
*   **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-GIT-01, US-GIT-02, US-GIT-04.

---

## Descripción General
Como Prestador,  
Quiero eliminar uno o todos los rangos de días y horarios de un POI,  
Para poder corregir información incorrecta o reflejar que el lugar ya no cuenta con horarios definidos en el sistema.

---

## Descripción Funcional
El Prestador accede a la gestión de horarios de un POI existente (`GITDashboardScreen`) y visualiza los horarios configurados. Al tocar la acción de eliminar sobre un horario específico, el sistema despliega un diálogo/modal de confirmación antes de proceder.

Al presionar "Aceptar" / "Eliminar", el sistema remueve el registro seleccionado y actualiza el perfil público del POI. Si el horario eliminado afecta itinerarios previamente planificados por Turistas, el sistema notifica a los usuarios afectados y marca la parada como "requiere revisión".

Si se elimina el último horario disponible del POI, el perfil público muestra "Horario no disponible" y excluye el lugar de los filtros de disponibilidad del motor de recomendación de itinerarios.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador elimina un rango de días y horario y presiona el botón "Aceptar" en la confirmación | El sistema elimina el registro, actualiza la lista y refleja el cambio en el perfil público del POI | Modal de Confirmación (`GITDashboardScreen`) |
| El Prestador elimina el último horario disponible del POI | El sistema muestra "Horario no disponible" en el perfil público y excluye el POI de los filtros de disponibilidad del motor de recomendación | Perfil Público de POI / Motor de Itinerarios |
| La eliminación de horario afecta a itinerarios ya generados | El sistema notifica a los Turistas afectados que revisen su itinerario y marca la parada afectada como "requiere revisión" | Pantalla de Notificaciones / Detalle de Itinerario |
| El Prestador cancela la eliminación de un horario | El sistema cierra el cuadro de diálogo y conserva el registro sin ningún cambio | Modal de Confirmación (`GITDashboardScreen`) |
