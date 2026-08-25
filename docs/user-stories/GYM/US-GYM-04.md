# US-GYM-04: Visualización de Ruta

## Información General
- **Identificador:** US-GYM-04
- **Actor:** Usuario(Turista/Prestador/Administrador)
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Turista debe haber iniciado sesión. Debe existir al menos un itinerario con estado "Borrador", "Activo" o "En curso" asociado al Turista.
  - El itinerario debe tener al menos una parada asignada con coordenadas válidas en la Ruta.
  - El servicio de Google Maps / Mapbox API debe estar disponible.
- **Historias de Usuario Relacionadas:** US-GYM-01, US-GYM-02, US-GYM-05, US-GYM-06, US-GYM-07, US-GYM-08, US-GDI-10, US-GYM-03, US-ACC-01, US-ACC-03

---

## Descripción General
**Como** Turista,  
**quiero** visualizar sobre el mapa interactivo la ruta trazada entre las paradas de mi itinerario,  
**para** comprender el recorrido planificado, estimar los tiempos de traslado entre cada punto de interés y orientarse espacialmente durante mi viaje.

---

## Descripción Funcional
Cuando el Turista accede al detalle de un itinerario con al menos una parada asignada, el sistema traza y muestra sobre el mapa interactivo la ruta que conecta secuencialmente todos los POIs del día seleccionado, siguiendo el orden cronológico definido en la tabla RutaDiaria. La ruta se representa mediante una polyline generada con mapbox, respetando el trazado real de calles y caminos. Cada parada se indica con un pin numerado según su orden secuencial dentro del día. El sistema muestra además, entre cada par de paradas consecutivas, el tiempo de traslado estimado y la distancia calculada, tomando los valores almacenados en los campos tiempo y distancia de la Ruta. Cuando el Turista tiene el Modo Viaje activo, la ruta se actualiza en tiempo real integrando la ubicación actual del Usuario en tiempo real, resaltando la parada en curso y el tramo activo del recorrido. Si la mapbox Directions no responde, el sistema renderiza la ruta como línea recta entre coordenadas como fallback, informando al Usuario.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista accede al detalle de un itinerario con al menos una parada asignada y hace click en "Ver en mapa" | Que el sistema renderice el mapa mostrando la ruta trazada mediante polyline entre todas las paradas del día activo, con cada POI representado por un pin numerado según su orden secuencial | - |
| El Turista selecciona un día diferente mediante el selector | Que el mapa actualice la ruta visualizada mostrando únicamente las paradas y el trazado correspondiente al día elegido, sin mezclar paradas de otros días | - |
| El Turista visualiza el tramo entre dos paradas consecutivas | Que el sistema muestre junto al tramo de ruta el tiempo de traslado estimado y la distancia entre ambas paradas, tomados de los campos tiempo y distancia de la tabla Ruta | - |
| El Turista tiene el Modo Viaje activo y visualiza la ruta | Que el sistema integre la ubicación en tiempo real del Usuario sobre el mapa, resalte visualmente la parada en curso y el tramo activo del recorrido diferenciándolos del resto de la ruta | - |
| El Turista completa una parada durante el Modo Viaje | Que el sistema marque visualmente esa parada como completada en el mapa, actualice el tramo activo hacia la siguiente parada y recalcule el trazado desde la posición actual del Usuario | - |
| El itinerario no tiene ninguna parada asignada en el día seleccionado | Que el sistema muestre el mapa sin pins ni polyline, con el mensaje "No tenés actividades planificadas para este día" | - |
| Un POI del itinerario fue dado de baja (estado inactivo) luego de haberse asignado al itinerario | Que el sistema mantenga el pin de esa parada en el mapa pero lo muestre grisado y con la etiqueta "Lugar no disponible", sin eliminar el tramo de ruta asociado | - |
| Mapbox no responde al intentar generar la polyline | Que el sistema renderice la ruta como líneas rectas entre las coordenadas de las paradas como fallback, y muestre en un popup el aviso "La ruta se está mostrando en modo simplificado. Verificá tu conexión para ver el trazado real" | - |
| Mapbox se recupera luego de la perdida de conexión | Que el sistema actualice automáticamente la ruta reemplazando las líneas rectas por la polyline real sin necesidad de intervención del Usuario | - |
