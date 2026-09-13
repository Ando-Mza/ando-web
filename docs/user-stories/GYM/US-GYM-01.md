# US-GYM-01: Visualización de POIs en Mapa

## Información General
- **Identificador:** US-GYM-01
- **Actor:** Usuario (Turista/Prestador/Administrador)
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe haber iniciado sesión.
  - Deben existir POIs registrados en el sistema.
  - Los POIs visibles deben estar activos y aprobados.
  - Los POIs visibles deben tener coordenadas válidas.
  - El servicio de Google Maps API / Mapbox API debe estar disponible.
- **Historias de Usuario Relacionadas:** US-ACC-03, US-CYN-01, US-CYN-02, US-GIT-07

---

## Descripción General
**Como** Usuario,  
**Quiero** visualizar los POIs activos en un mapa interactivo,  
**Para** conocer las actividades turísticas disponibles y consultar su información.

---

## Descripción Funcional
El sistema debe permitir que el Usuario acceda a una vista de mapa implementada mediante mapbox API, donde se visualicen únicamente los POIs activos y aprobados dentro del sistema. Cada POI deberá representarse mediante un pin ubicado según sus coordenadas de latitud y longitud. Al seleccionar un pin, el sistema deberá mostrar la información detallada del POI: nombre, imagen principal, descripción, categoría o tipo de actividad, horarios, ubicación, puntuación promedio y reseñas asociadas. El Usuario podrá utilizar su ubicación actual para centrar el mapa. Si no desea activar el GPS o no otorga permisos de ubicación, el sistema deberá permitirle seleccionar manualmente un punto en el mapa para usarlo como ubicación de referencia. El Usuario podrá aplicar filtros por tipo de actividad, visualizando únicamente los POIs activos que coincidan con el filtro seleccionado.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario presiona el módulo de mapa | Que el sistema muestre un mapa interactivo utilizando Mapbox API | GYMVisualizarPOIS |
| El Usuario otorga permisos de ubicación | Que el sistema centre el mapa en la ubicación actual del Usuario | - |
| El Usuario no otorga permisos de ubicación o no desea usar GPS | Que el sistema permita presionar en el mapa una ubicación de referencia. | - |
| El Usuario presiona en el mapa una ubicación | Que el sistema centre el mapa en el punto seleccionado | - |
| Existen POIs activos y aprobados en la zona visualizada | Que el sistema los muestra mediante pins ubicados según sus coordenadas en el mapa | - |
| Existen POIs en estado pendientes, rechazados, suspendidos o inactivos | Que el sistema no los muestre en el mapa | - |
| El Usuario presiona en el mapa el pin de un POI | Que el sistema muestre en un popup el detalle del POI con nombre, imagen, descripción, categoría, horarios, ubicación, puntuación y reseñas | - |
| El servicio de Mapbox API no responde | Que el sistema muestre por pantalla el mensaje “No fue posible cargar el mapa en este momento. Intentá nuevamente más tarde” | GYMErrorConexionApiGUI |
| El dispositivo pierde conexión a internet | Que el sistema muestre por pantalla el mensaje “Verificá tu conexión para cargar el mapa y los puntos de interés” | GYMErrorConexionInternetGUI |
| El Usuario aplica presionando el botón “filtro” por tipo de actividad, precio o zona | Que el sistema muestre únicamente los POIs activos asociados al tipo de filtro elegido con su correspondiente selección | - |
| El Usuario limpia los filtros aplicados presionando el botón “quitar todos los filtros” | Que el sistema vuelva a mostrar todos los POIs activos y aprobados disponibles en la zona visualizada | - |
