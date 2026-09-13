# US-GYM-06: Cálculo de Distancias y Tiempos

## Información General
- **Identificador:** US-GYM-06
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Turista debe haber iniciado sesión. Debe existir al menos un itinerario con estado "Borrador" o "Activo" asociado al Turista.
  - El itinerario debe tener al menos dos paradas asignadas en el mismo día con coordenadas válidas (latitud, longitud) en la tabla RutaPOI.
  - Los POIs involucrados deben tener el campo duracionEstimada definido en la tabla POI.
  - El servicio de Mapbox debe estar disponible.
- **Historias de Usuario Relacionadas:** US-ACC-01, US-ACC-03, US-GYM-04, US-GYM-05, US-GYM-07, US-GDI-01, US-GDI-03, US-GDI-04, US-MRIA-06

---

## Descripción General
**Como** Turista,  
**quiero** que el sistema calcule automáticamente las distancias y tiempos de traslado entre las paradas de mi itinerario,  
**para** conocer con precisión cuánto tiempo necesito desplazarme entre cada punto de interés y poder planificar mi día de forma realista.

---

## Descripción Funcional
Cada vez que el Turista agrega, elimina, reordena o modifica una parada en su itinerario, el backend invoca la API de Mapbox Directions pasando las coordenadas de latitud y longitud de los POIs involucrados en el cambio. Con la respuesta obtenida, el sistema calcula el tiempoTraslado en minutos hacia la parada siguiente y la horaEstimadaLlegada para cada registro en la tabla RutaPOI, sumando el offsetHoraInicio del primer POI del día más la duracionEstimada de cada parada y el tiempoTraslado acumulado.
Una vez procesados todos los tramos del día, el sistema actualiza en la tabla RutaDiaria los campos distanciaTotal (suma de distancias de todos los tramos), tiempoTotal (suma de tiempoTraslado más suma de duracionEstimada de todas las paradas del día) y polylineEncode (trazado completo del día generado por Mapbox). El cálculo se ejecuta como proceso en segundo plano mostrando al Usuario el indicador "Calculando tiempos..." con polling hasta recibir el resultado. Si la API de Mapbox no responde, el sistema aplica un fallback calculando la distancia en línea recta entre coordenadas, marcando el resultado como estimación aproximada.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista agrega una nueva parada a un día que ya tiene al menos una parada asignada | Que el sistema invoque la API de Mapbox Directions con las coordenadas del POI nuevo y el anterior, calcule el tiempoTraslado en minutos y actualice el campo correspondiente en RutaPOI, mostrando un popup con el mensaje "Calculando tiempos..." durante el proceso | - |
| El backend recibe la respuesta de Mapbox Directions correctamente | Que el sistema actualice los campos horaEstimadaLlegada y tiempoTraslado en RutaPOI para los tramos afectados, y recalcule distanciaTotal y tiempoTotal en la tabla RutaDiaria del día correspondiente | - |
| El Turista elimina una parada intermedia entre dos POIs existentes | Que el sistema recalcule el tiempoTraslado entre el POI anterior y el siguiente al eliminado, actualice horaEstimadaLlegada en cascada para todas las paradas posteriores del día y actualice distanciaTotal y tiempoTotal en RutaDiaria | - |
| El Turista reordena paradas deslizando el pin en el mapa | Que el sistema recalcule los tiemposTraslado de todos los tramos afectados por el reordenamiento, actualice en cascada las horasEstimadasLlegada de las paradas subsecuentes del día y persista los nuevos valores en RutaPOI y RutaDiaria al confirmar el guardado | - |
| El Turista visualiza el detalle de un día de su itinerario con paradas asignadas | Que el sistema muestre entre cada par de paradas consecutivas el tiempoTraslado en minutos y la distancia en kilómetros correspondiente al tramo, junto con la horaEstimadaLlegada de cada parada | - |
| Un POI del itinerario no tiene el campo duracionEstimada definido en la tabla POI | Que el sistema muestre el aviso "La duración estimada de {{Nombre_POI}} no está disponible. El tiempo total del día puede no ser preciso" y continúe el cálculo usando un valor de duración de 0 minutos para ese POI sin bloquear la operación | - |
| El Turista tiene solo una parada asignada en un día del itinerario | Que el sistema no intente calcular ningún tramo, establezca distanciaTotal y tiempoTotal de RutaDiaria en 0 para ese día, y no muestre valores de traslado | - |
