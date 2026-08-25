# US-MRIA-05: Optimización de Rutas

## Información General
- **Identificador:** US-MRIA-05
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - Usuario autenticado.
  - Itinerario con al menos 2 POIs asignados.
  - Fecha de inicio del itinerario definida.
- **Historias de Usuario Relacionadas:** US-MRIA-04, US-GDI-04, US-GDI-02, US-GDI-01, US-GYM-04

---

## Descripción General
**Como** Turista  
**Quiero** que el sistema ordene automáticamente las paradas de mi itinerario minimizando tiempos y distancias de traslado  
**Para** aprovechar mejor mi tiempo disponible sin tener que calcular el orden óptimo manualmente.

---

## Descripción Funcional
Una vez que el Usuario tiene un conjunto de POIs seleccionados para un itinerario (ya sea por selección manual o por recomendación de la IA), el backend invoca el servicio Python con OR-Tools pasando las coordenadas de cada POI, la duración estimada en cada parada y los horarios de atención. OR-Tools resuelve el problema de ruteo considerando estas restricciones y devuelve el orden óptimo de visita. El backend calcula las horaEstimadaLlegada de cada RutaPOI sumando la hora de inicio del día + tiempos de traslado + duraciones. El proceso se ejecuta como background job dado que puede demorar varios segundos, devolviendo al Usuario un estado "calculando" con polling hasta recibir el resultado. La polylineEncode de la RutaDiaria se genera con la API de Google Maps Directions con el orden resultante.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista solicita optimizar la ruta | Recibir las paradas ordenadas minimizando el tiempo total de traslado | - |
| Un POI del itinerario está cerrado en el horario calculado | Que el sistema me informe el conflicto y proponga una alternativa de horario | - |
| El proceso tarda más de 3 segundos | Ver un indicador de carga en lugar de una pantalla congelada | - |
| El Turista tiene solo 2 POIs | Que el sistema calcule igualmente el orden y los tiempos de traslado entre ellos | - |
| La API de Google Maps no responde para generar la polyline | Que el itinerario se guarde igual con la ruta en línea recta como fallback | - |
