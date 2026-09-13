# US-GDI-04: Organización Inteligente de POIs por IA

## Información General
- **Identificador:** US-GDI-04
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El itinerario debe existir y tener fechas definidas (fechaInicio, fechaFin).
  - Deben existir al menos dos (2) registros en ItinerarioBacklog asociados a ese viaje.
  - Los POI asociados deben tener coordenadas y registros en la tabla Horario.
- **Historias de Usuario Relacionadas:** US-GDI-01, US-GDI-02, US-GDI-03, US-MRIA-06

---

## Descripción General
**Como** Turista planificador  
**Quiero** agregar lugares que me interesan sin definir un horario, y pedirle al sistema que los organice automáticamente  
**Para** obtener un recorrido lógico, geográficamente eficiente y que respete los horarios de apertura.

---

## Descripción Funcional
El backend recibirá el ID del itinerario y tomará todos los registros de ItinerarioBacklog que estén sin organizar. Enviará a la IA (o al motor de ruteo) las coordenadas geográficas, la duracionEstimada del POI, y los rangos de la tabla Horario. La IA devolverá una matriz ordenada que minimice el tiempoTraslado total. Finalmente, el backend actualizará transaccionalmente los campos ordenSecuencia, horaEstimadaLlegada y tiempoTraslado de cada registro en la tabla RutaPOI.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista no tiene ningún POI agregado | El botón de organizar con IA debe estar bloqueado | - |
| El Turista tiene POIs sueltos en su itinerario y presiona "Organizar con IA" | Que el sistema invoque al algoritmo pasándole las coordenadas geográficas y actualice el campo ordenSecuencia agrupando las paradas por proximidad para minimizar la suma total de tiempoTraslado. | - |
| El Turista presiona "Organizar con IA" | Que el sistema garantice que la horaEstimadaLlegada calculada para el POI se encuentre en el rango horario proporcionado. | - |
| El Turista presiona "Organizar con IA" y la suma de los tiempos supera la capacidad total del viaje | Que el sistema distribuya inteligentemente la mayor cantidad de lugares posibles a lo largo de los días, conserve los sobrantes en la tabla ItinerarioBacklog y muestre la alerta: "Hemos organizado la mayor cantidad de lugares, pero algunos quedaron en tu lista de guardados porque superan el tiempo total de tu viaje. Extiende las fechas para agregarlos." | - |
| El Turista confirma el orden propuesto por la IA presionando "Aceptar Ordenamiento" | Que el sistema confirme los valores de RutaPOI y se recalculen las rutas sumando los nuevos traslados entregando un viaje listo para iniciar. | - |
