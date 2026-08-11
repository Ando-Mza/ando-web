# US-GDI-03: Modificación de Itinerario

## Identificación
* **ID:** US-GDI-03
* **Título:** Modificación de Itinerario
* **Puntos de Historia:** 5
* **Actor:** Turista
* **US Relacionadas:** US-GDI-01, US-GDI-02

---

## Descripción General
Como **Turista**  
Quiero **modificar los detalles de un itinerario ya creado**  
Para **ajustar mis planes según nuevos intereses o imprevistos.**

---

## Descripción Funcional
El sistema debe permitir abrir un itinerario guardado en modo edición. El usuario podrá:
1. Cambiar el orden de las paradas (mediante drag & drop).
2. Modificar las fechas generales del viaje.
3. Editar los horarios de inicio y fin de cada parada.
4. Eliminar puntos de interés (POIs) que ya no desee visitar.

Al finalizar, se debe permitir guardar las modificaciones directamente sobre el mismo itinerario (actualización) o como un nuevo itinerario (crear una copia / nueva versión).

---

## Precondiciones
1. El Turista debe tener una sesión activa en el sistema.
2. Debe existir al menos un itinerario guardado previamente por el Turista.

---

## Criterios de Aceptación

| Escenario / Acción (Cuando) | Comportamiento Esperado (Espero) | Componente / Pantalla |
| :--- | :--- | :--- |
| El Turista arrastra un POI (Punto de Interés) de una posición A a la posición B dentro del mismo día, o lo mueve hacia otro día válido del itinerario. | El sistema actualiza el índice secuencial en la memoria temporal, solicita al motor de geoposicionamiento el recálculo de los nuevos tiempos de traslado (entre la nueva parada anterior y la siguiente), y desplace automáticamente en cascada los horarios de inicio/fin de todas las paradas subsecuentes de ese día. | Editor de Itinerario (Timeline) |
| El Turista intenta agregar un POI a un día que ya tiene actividades y con la suma de este POI excede el límite de las 23:59 hrs cronológicas. | El sistema bloquea la inserción de forma inmediata, no envía la actualización a la base de datos, y despliega un modal de error crítico indicando: *"La duración de este lugar más los tiempos de traslado superan el límite del día. Por favor, añádelo a otro día de tu viaje"*. | Editor de Itinerario / Modal de Error |
| El turista presiona la acción "Eliminar" sobre el POI "B" que se encuentra cronológicamente entre el POI "A" y el POI "C". | El sistema borre visualmente el POI "B", trace una nueva ruta directa desde "A" hasta "C" recalculando la distancia, reste el tiempo de duración de "B" del total diario, y quite el marcador de ese lugar en el mapa interactivo asociado. | Editor de Itinerario / Vista de Mapa |
| El Turista edita manualmente la "Hora de Salida" de una parada retrasándola varias horas, provocando que el horario de llegada a la siguiente parada choque con la hora de cierre de ese lugar (ej. la bodega cierra a las 18:00 y llegaría a las 18:30). | El sistema resalta en color rojo la parada afectada subsecuente y bloquee el botón de "Guardar Cambios", mostrando un mensaje de error: *"El nuevo horario genera que llegues a [Nombre del Lugar] fuera de su horario de atención. Ajusta el tiempo para continuar."* | Editor de Itinerario (Horarios) |
| El Turista edita la configuración general del viaje reduciendo la fecha de fin (ej. un viaje de 5 días lo acorta a 3 días), y existen POIs ya programados en esos días 4 y 5 que se están eliminando. | El sistema despliega un modal de confirmación crítico advirtiendo: *"Al reducir los días de tu viaje, las actividades programadas para los días eliminados pasarán a la lista de 'Paradas sin asignar'. ¿Deseas continuar?"*; si el usuario acepta, los POIs perderán su fecha y volverán al listado atemporal para ser reubicados. | Configuración de Viaje / Modal de Confirmación |
| El Turista finaliza sus modificaciones y presiona el botón "Guardar Cambios". | El backend guarda la actualización sobre el mismo registro en la tabla Itinerarios, actualizando los campos como `updated_at` y de `rutaparada`, confirmando con un mensaje: *"Tu itinerario ha sido actualizado."* | Editor de Itinerario (Persistencia) |
| El Turista finaliza sus modificaciones y selecciona la opción "Guardar como una copia". | Que el backend cree un nuevo registro padre en la base de datos (generando un nuevo ID), copie toda la estructura de paradas con los nuevos cambios asociados a este ID, deje el itinerario original intacto en la base de datos, y redirija al turista a la vista del nuevo viaje. | Editor de Itinerario (Duplicación) |
| El Turista elimina la última actividad programada para el Día 3 (ej. una cena a las 21:00 hs). | El sistema elimine el nodo, reste la duración de esa actividad del tiempo total acumulado del Día 3, pero **NO** intente adelantar actividades del Día 4 hacia el Día 3 (los días son compartimentos estancos). | Editor de Itinerario (Timeline) |
| El Turista elimina el único lugar que estaba planificado para todo el Día 2 del itinerario. | El sistema borre el registro, pero mantenga el contenedor del "Día 2" en la interfaz mostrando un mensaje de Empty State: *"No tienes actividades planificadas para este día. Usa el buscador para agregar lugares."*, asegurando que la cronología general del viaje (Día 1, Día 2, Día 3) no se rompa. | Editor de Itinerario (Empty State) |
| El Turista intenta agregar una Bodega al final de su día, pero el cálculo automático determina que llegará a las 18:30 hs y el horario de cierre de la bodega en la base de datos es a las 18:00 hs. | El sistema permita agregar la parada (ya que el turista tiene control total), pero la resalte en rojo con un ícono de advertencia indicando: *"Atención: Llegarás fuera del horario comercial de este lugar (Cierra 18:00 hs)."* | Editor de Itinerario (Alertas) |
