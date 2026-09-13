# US-GYM-05: Modificación Visual de Ruta

## Información General
- **Identificador:** US-GYM-05
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Turista debe haber iniciado sesión. Debe existir al menos un itinerario con estado "Borrador" o "Activo" asociado al Turista.
  - El itinerario debe tener al menos dos paradas asignadas en el mismo día con coordenadas válidas en la tabla RutaDiaria.
  - El itinerario no debe encontrarse en estado "En curso" (Modo Viaje activo).
  - El servicio de Mapbox debe estar disponible. El servicio Python de OR-Tools debe estar disponible.
- **Historias de Usuario Relacionadas:** US-ACC-01, US-ACC-03, US-GYM-04, US-GYM-06, US-GDI-03, US-GDI-10, US-MRIA-06

---

## Descripción General
**Como** Turista,  
**quiero** poder modificar visualmente la ruta de mi itinerario directamente desde el mapa,  
**para** me ajustar el orden de mis paradas de forma intuitiva y ver reflejados los cambios en los tiempos y distancias de traslado sin necesidad de salir de la vista del mapa.

---

## Descripción Funcional
Desde la vista de mapa del itinerario , el Turista puede reordenar las paradas de un día mediante una interacción de arrastre sobre los pins numerados renderizados con Mapbox. Al soltar un pin en una nueva posición, el sistema recalcula el orden secuencial en memoria y envía las coordenadas actualizadas al servicio Python de OR-Tools, que resuelve el orden óptimo considerando las restricciones de horario de atención de cada POI y los tiempos de traslado. Con el orden resultante, el backend genera la nueva polyline mediante la API de Mapbox Directions y la renderiza sobre el mapa, actualizando los valores de tiempoTraslado entre los pares de paradas afectados. Los nuevos valores de distanciaTotal y tiempoTotal de la tabla Ruta padre del día se actualizan en consecuencia. El proceso de recálculo con OR-Tools se ejecuta como background job devolviendo al Usuario un indicador de "Recalculando ruta..." con polling hasta recibir el resultado. Los cambios realizados visualmente se consideran no persistidos hasta que el Turista presione el botón "Guardar cambios", momento en el que el backend ejecuta el UPDATE sobre los registros correspondientes en RutaDiaria y Ruta. Si el Turista sale de la vista sin guardar, el sistema solicita confirmación antes de descartar los cambios. Durante el Modo Viaje activo, la modificación visual de ruta se encuentra bloqueada para evitar alteraciones estructurales del itinerario en curso.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista accede a la vista de mapa de un itinerario con al menos dos paradas asignadas en el mismo día | Que el sistema habilite la interacción de arrastre sobre los pins numerados renderizados con Mapbox, indicando visualmente que son reordenables mediante un ícono o animación diferenciada | - |
| El Turista arrastra un pin numerado de una posición a otra dentro del mismo día | Que el sistema actualice el orden en memoria, renumere los pins afectados y muestre un popup con el mensaje "Recalculando ruta..." mientras envía las coordenadas actualizadas al servicio Python de OR-Tools | - |
| OR-Tools devuelve el orden óptimo recalculado | Que el backend genere la nueva polyline mediante Mapbox Directions, la redibuje sobre el mapa con el trazado actualizado y muestre los nuevos valores de tiempo de traslado y distancia sobre cada tramo afectado | - |
| El Turista presiona el botón "Guardar cambios" luego de reordenar paradas | Que el backend ejecute el UPDATE sobre los campos ordenSecuencia y tiempoTraslado de la ruta, actualice los campos distanciaTotal y tiempoTotal en la tabla Ruta padre, y muestre un popup con el mensaje "Tu itinerario ha sido actualizado" | - |
| El Turista intenta salir de la vista de mapa sin haber guardado los cambios realizados | Que el sistema muestre el popup de confirmación "¿Salir sin guardar los cambios? Los reordenamientos realizados se perderán" con las opciones "Guardar y salir" y "Salir sin guardar" | - |
| El Turista selecciona el botón "Guardar y salir" | Que el sistema persista los cambios en la base de datos y redirija al Turista a la pantalla anterior | - |
| El Turista selecciona el botón "Salir sin guardar" | Que el sistema descarte todos los reordenamientos realizados en memoria, restaure el orden original de las paradas y redirija al Turista sin modificar ningún registro en la base de datos | - |
| OR-Tools devuelve un orden en el que una parada queda fuera de su horario de atención | Que el sistema resalte en rojo el pin de la parada afectada y muestre el aviso "Atención: con este orden llegarás fuera del horario de atención del POI" sin bloquear el guardado, permitiendo que el Turista decida | - |
| OR-Tools devuelve un orden en el que la suma de tiempos supera el límite de las 23:59 hs cronológicas del día | Que el sistema bloquee el guardado, resalte el conflicto visualmente y muestre en un popup el mensaje "La duración total de las actividades y traslados con este orden supera el límite del día. Reorganiza las paradas para continuar" | - |
| El itinerario tiene solo una parada asignada en el día visualizado | Que el sistema deshabilite la funcionalidad de arrastre sobre el pin y muestre un popup con el mensaje "Necesitás al menos dos paradas en el mismo día para reordenar la ruta" | - |
| El Turista intenta modificar visualmente la ruta con el Modo Viaje activo | Que el sistema bloquee la interacción de arrastre sobre los pins y muestre un popup con el mensaje "No podés modificar la ruta mientras el Modo Viaje está activo" | - |
