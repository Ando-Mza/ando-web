# US-GYM-02: Clustering de POIs

## Información General
- **Identificador:** US-GYM-02
- **Actor:** Usuario(Turista/Prestador/Administrador)
- **Puntos de Historia:** 3
- **Precondiciones:**
  - Deben existir POIs activos y aprobados con coordenadas válidas registradas en el sistema.
  - El servicio de Mapbox debe estar disponible.
  - Deben existir al menos 2 POIs en la zona visualizada para que se forme un cluster.
- **Historias de Usuario Relacionadas:** US-GYM-01, US-GYM-03

---

## Descripción General
**Como** Usuario,  
**quiero** que los puntos de interés se agrupen visualmente en el mapa cuando hay muchos cercanos entre sí,  
**para** poder explorar zonas turísticas de forma clara y sin saturación visual, especialmente a niveles de zoom alejados.

---

## Descripción Funcional
Cuando el Usuario accede al mapa, el sistema debe aplicar automáticamente un algoritmo de clustering sobre los POIs activos y aprobados visibles en el área del mapa. Los clusters se representan mediante un ícono agrupador que muestra la cantidad de POIs contenidos. Al acercarse el zoom, los clusters se descomponen progresivamente hasta mostrar los pins individuales de cada POI. Al presionar sobre un cluster, el mapa hace zoom automático hacia esa zona. Cuando el zoom es suficiente para distinguir POIs individuales, el sistema muestra los pins normales. El clustering se recalcula dinámicamente ante cualquier cambio de zoom o desplazamiento del mapa.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario accede al mapa con muchos POIs en la zona visible | Que el sistema agrupe automáticamente los POIs cercanos en clusters representados por un ícono con el número de POIs contenidos | - |
| El Usuario reduce el nivel de zoom deslizando con los dedos (se aleja) | Que los clusters se consoliden agrupando más POIs y el número del ícono aumente en consecuencia | - |
| El Usuario aumenta el nivel de zoom deslizando con los dedos (se acerca) | Que los clusters se descompongan progresivamente, separando los POIs hasta mostrar los pins individuales cuando el zoom lo permita | - |
| El Usuario hace click sobre un ícono de cluster | Que el mapa realice un zoom automático hacia esa zona, descomponiendo el cluster para mostrar los POIs que lo conforman | - |
| El Usuario desplaza el mapa con su dedo hacia una nueva zona | Que el sistema recalcule dinámicamente los clusters según los POIs visibles en el área nueva, sin necesidad de recargar la pantalla | - |
| En la zona visualizada solo existe un único POI activo y aprobado | Que el sistema muestre directamente el pin individual del POI sin aplicar clustering | - |
| Existen POIs en estado pendiente, rechazado, suspendido o inactivo dentro del área visualizada | Que el sistema los excluya completamente del cálculo de clusters y no los represente en el mapa | - |
| El Usuario aplica un filtro por categoría o tipo de actividad | Que los clusters se recalculen considerando únicamente los POIs que coincidan con el filtro aplicado | - |
| El Usuario aplica un filtro y ningún POI coincide con el criterio seleccionado en la zona visible | Que el mapa se muestre sin clusters ni pins | - |
| El servicio de Mapbox API no responde | Que el sistema muestre por pantalla el mensaje “No fue posible cargar el mapa en este momento. Intentá nuevamente más tarde” | - |
| El dispositivo pierde conexión a internet | Que el sistema muestre por pantalla el mensaje “Verificá tu conexión para cargar el mapa y los puntos de interés” | - |
