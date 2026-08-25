# US-GDI-03: Modificación de Itinerario

## Información General
- **Identificador:** US-GDI-03
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Turista debe tener una sesión activa en el sistema.
  - Debe existir al menos un itinerario guardado previamente por el Turista.
- **Historias de Usuario Relacionadas:** US-GDI-01, US-GDI-02, US-GDI-04, US-GDI-07, US-ACIA-04

---

## Descripción General
**Como** Turista  
**Quiero** modificar los detalles de un itinerario ya creado  
**Para** ajustar mis planes según nuevos intereses o imprevistos.

---

## Descripción Funcional
El sistema debe permitir abrir un itinerario guardado en modo edición. El Usuario podrá cambiar el orden de las paradas (drag & drop), modificar las fechas generales del viaje, editar los horarios de cada parada o eliminar puntos de interés que ya no desee visitar. Al finalizar, se debe permitir guardar los cambios como una actualización o como una nueva versión.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista arrastra un POI (Punto de Interés) de una posición A a la posición B dentro del mismo día, o lo mueve hacia otro día válido del itinerario | Que el sistema actualice el índice secuencial en la memoria temporal, solicite al motor de geoposicionamiento el recálculo de los nuevos tiempos de traslado, y desplace automáticamente en cascada los horarios de inicio/fin de todas las paradas subsecuentes de ese día. | GDIModificarItinerarioGUI |
| El Turista intenta agregar un POI a un día que ya tiene actividades y con la suma de este POI excede el límite de las 23:59 hrs | Que el sistema bloquee la inserción de forma inmediata y despliegue un modal de error crítico indicando: "La duración de este lugar más los tiempos de traslado superan el límite del día. Por favor, añádelo a otro día de tu viaje". | - |
| El Turista presiona la acción "Eliminar" sobre el POI "B" que se encuentra entre "A" y "C" | Que el sistema borre visualmente el POI "B", trace una nueva ruta directa desde "A" hasta "C" recalculando la distancia y tiempo total. | - |
| El Turista edita manualmente la "Hora de Salida" de una parada retrasándola varias horas, provocando que el horario de llegada a la siguiente parada choque con la hora de cierre de ese lugar | Que el sistema resalte en color rojo la parada afectada subsecuente y bloquee el botón de "Guardar Cambios", mostrando el mensaje: "El nuevo horario genera que llegues a [Nombre del Lugar] fuera de su horario de atención. Ajusta el tiempo para continuar." | - |
| El Turista edita la configuración general del viaje reduciendo la fecha de fin y existen POIs programados en los días eliminados | Que el sistema despliegue un modal de confirmación crítico advirtiendo: "Al reducir los días de tu viaje, las actividades programadas para los días eliminados pasarán a la lista de 'Paradas sin asignar'. ¿Deseas continuar?" | - |
| El Turista finaliza sus modificaciones y presiona el botón "Guardar cambios" | El backend guarda la actualización transaccional sobre el mismo registro en la tabla Itinerario y confirma con el mensaje: "Tu itinerario ha sido actualizado." | - |
| El Turista finaliza sus modificaciones y selecciona la opción "Guardar como una copia" | Que el backend cree un nuevo registro padre en la base de datos (generando un nuevo ID), copie toda la estructura de paradas asociadas a este ID y deje el itinerario original intacto. | - |
| El Turista elimina la última actividad programada para el Día 3 | Que el sistema elimine el nodo y reste la duración del tiempo acumulado del Día 3, sin intentar adelantar actividades del Día 4 hacia el Día 3. | - |
| El Turista elimina el único lugar planificado para todo el Día 2 | Que el sistema borre el registro pero mantenga el contenedor del "Día 2" mostrando un mensaje de Empty State: "No tienes actividades planificadas para este día." | - |
| El Turista intenta agregar una Bodega al final de su día, pero el cálculo automático determina que llegará fuera de su horario comercial | Que el sistema permita agregar la parada pero la resalte en rojo con un ícono de advertencia indicando: "Atención: Llegarás fuera del horario comercial de este lugar (Cierra 18:00 hs)." | - |
