# US-GDI-01: Creación Manual de Itinerario

## Información General
- **Identificador:** US-GDI-01
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Turista debe estar autenticado en la plataforma.
  - Los POIs deben estar previamente cargados en la base de datos del sistema.
- **Historias de Usuario Relacionadas:** US-GDI-02, US-GDI-03, US-GDI-04, US-GDI-05, US-MRIA-06

---

## Descripción General
**Como** Turista  
**Quiero** crear un itinerario seleccionando manualmente puntos de interés, fechas y horarios  
**Para** tener un control total sobre la planificación de mi viaje.

---

## Descripción Funcional
El sistema debe permitir al Usuario buscar y seleccionar POIs (Puntos de Interés) existentes. Para cada POI seleccionado, el Usuario debe poder asignar una fecha específica y un rango horario de visita. El sistema debe validar que no existan solapamientos horarios críticos, calcular automáticamente el tiempo de traslado estimado entre paradas y persistir la relación de pertenencia geográfica en la tabla ItinerarioZona impactando los nodos de RutaDiaria y RutaPOI.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista presiona el botón global "+" | Se abre un modal diciendo que si quiere crear un itinerario manual o con IA | - |
| Se oprime crear manual | Se abre el formulario de creación de itinerario solicitando nombre, fechaInicio y fechaFin. El nombre no puede estar vacío. fechaInicio y fechaFin son obligatorias. fechaInicio debe ser mayor o igual a la fecha actual y fechaFin debe ser mayor o igual a fechaInicio. | - |
| El Turista está viendo el detalle de un lugar en el catálogo, presiona "Añadir a mi viaje" | Se abre un modal con un selector de Itinerarios ya creados y un botón para crear un nuevo itinerario | - |
| Si presiona Crear un Nuevo Itinerario | Que se pidan los mismos datos que el criterio de aceptación 1 | - |
| El Turista completa los datos y le da a guardar itinerario | Se crea Itinerario con estado "Borrador", y se vincula al Usuario con el rol "Creador", y redirija al Usuario a la vista vacía del viaje lista para agregar lugares. | - |
| El Turista se encuentra en la pantalla de edición de su itinerario y oprime buscar lugares | Se muestra un buscador y el listado de POIs disponibles en el sistema. El Usuario puede seleccionar un POI y presionar "Agregar". El sistema guarda el lugar en la lista de "Lugares sin asignar" (Backlog del itinerario) con el estado asignado = false en la base de datos, mostrándolo visualmente en una bandeja temporal dentro de la pantalla para que el Usuario sepa que ya está guardado en ese viaje. | - |
| El Turista selecciona un POI de su lista para asignarle día y horario | Se abre un selector donde el Usuario debe elegir un día y un horario de inicio (fechainicio <= Dia <= fechafin). El horario de fin se calculará dinámicamente a partir de la hora de inicio y la duración asociada a la parada. | - |
| El Turista guarda el día y horario válido para el POI | El backend ejecuta una transacción única que asigna el POI en RutaPOI, calcula tiempos de traslado (usando Google Maps / Mapbox), actualiza distanciaTotal y tiempoTotal en RutaDiaria y ordena cronológicamente la parada. | - |
| El Turista asigna un POI en un horario que se solapa con otra actividad ya programada | El sistema valida conflictos y bloquea el guardado lanzando la alerta: "Existe un conflicto de horarios con otra actividad planificada para ese momento. Por favor, selecciona otro rango o modifica la actividad [nombre_POI]." | - |
| El Turista intenta agregar a un itinerario un POI que ya se encuentra agregado en el backlog del mismo itinerario | Que el sistema no cree un registro duplicado y muestre el mensaje “El lugar ya fue agregado a este itinerario.” | - |
| El Turista busca lugares para agregar a su itinerario | Que el sistema muestre únicamente POIs disponibles y en estado “Aprobado” | - |
