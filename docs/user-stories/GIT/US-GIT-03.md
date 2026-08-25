# US-GIT-03: Eliminación de días y horarios de un POI

## Información General
- **Identificador:** US-GIT-03
- **Actor:** Prestador
- **Puntos de Historia:** 2
- **Precondiciones:**
  - El Prestador debe estar autenticado.
  - El POI debe tener al menos un Dia y Horario cargados.
- **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-GIT-01, US-GIT-02, US-GIT-04

---

## Descripción General
**Como** Prestador  
**Quiero** eliminar uno o todos los rangos de días y horarios de un POI  
**Para** que pueda corregir información incorrecta o reflejar que el lugar ya no tiene horarios definidos en el sistema.

---

## Descripción Funcional
El Prestador accede a la gestión de horarios de un POI y puede seleccionar un rango de Dia y Horario por vez para eliminarlo. El sistema solicita confirmación antes de ejecutar la eliminación. Al confirmar, el sistema elimina el registro y actualiza el perfil público del POI. Si el rango eliminado afecta itinerarios ya generados, el sistema notifica a los Turistas afectados. Si se eliminan todos los horarios de un POI, el sistema muestra "Horario no disponible" en el perfil público del lugar y lo excluye de los filtros de disponibilidad del motor de recomendación.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador ingresa a “Días y Horarios de Atención” y selecciona el ícono de eliminar horario | Que el sistema muestre una confirmación con el siguiente mensaje previo a la eliminación: “¿Confirmás la eliminación del rango de atención seleccionado? [Día y horario seleccionado]” | - |
| El Prestador elimina un rango de días y horario y presiona el botón “aceptar” | El sistema elimina el registro y actualiza el perfil público del POI | - |
| El Prestador elimina el último rango de días y horarios disponible de un POI | El sistema muestra "Horario no disponible" en el perfil público y excluye el POI de los filtros de disponibilidad | - |
| El Prestador cancela la eliminación | El sistema conserva el registro sin cambios | - |
| La eliminación afecta itinerarios ya generados | Que el sistema notifica a los Turistas afectados que revisen su itinerario. | - |
| El Prestador ingresa a “Días y Horarios de Atención” | Que el sistema permita la eliminación de todos los horarios configurados mediante el botón “Eliminar todos los horarios” | - |
| El Prestador confirma la eliminación de un horario | Que el sistema muestre el siguiente mensaje “Horario eliminado exitosamente” | - |
| El Prestador quiere eliminar todos los horarios | Que el sistema muestre el siguiente mensaje de confirmación que indique: “Estas por eliminar TODOS los rangos de atención de este punto de interés. El lugar quedará marcado como Horario no disponible y el motor de recomendación no sugerirá este POI para itinerarios automáticos” | - |
