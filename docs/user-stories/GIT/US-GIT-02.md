# US-GIT-02: Modificación de días y horarios de un POI

## Información General
- **Identificador:** US-GIT-02
- **Actor:** Prestador
- **Puntos de Historia:** 2
- **Precondiciones:**
  - El Prestador debe estar autenticado.
  - El POI debe tener al menos un Dia y Horario del POI previamente cargados.
- **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-GIT-01

---

## Descripción General
**Como** Prestador  
**Quiero** modificar los días y horarios de atención de un POI  
**Para** que la información disponible para los Turistas siempre esté actualizada ante cualquier cambio operativo.

---

## Descripción Funcional
El Prestador accede a la gestión de horarios de un POI existente y visualiza los rangos de días y horarios ya cargados. Puede seleccionar cualquiera de ellos para editarlo. El sistema precarga los valores actuales en el formulario de edición. Al guardar, el sistema valida los mismos criterios que en la carga inicial y actualiza inmediatamente la información pública del POI. Si el cambio afecta itinerarios ya generados que incluían ese POI en el horario modificado, el sistema los marca como "requiere revisión" al POI del itinerario y notifica a los Turistas afectados.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador modifica un rango de días u horario y guarda correctamente | El sistema actualiza el dato y muestra un popup "Cambios guardados exitosamente" | - |
| El Prestador intenta guardar datos inválidos | El sistema aplica las mismas validaciones que en la carga y muestra el error correspondiente | - |
| El Prestador cierra la pantalla sin guardar | El sistema muestra "¿Salir sin guardar los cambios?" y descarta las modificaciones si hace clic en “aceptar” | - |
| El cambio de horario afecta un itinerario ya generado por un Turista | Que el sistema notifique a los Turistas afectados que revisen su itinerario. | - |
