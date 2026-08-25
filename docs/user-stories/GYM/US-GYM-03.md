# US-GYM-03: Ubicación en Tiempo Real

## Información General
- **Identificador:** US-GYM-03
- **Actor:** Usuario(Turista/Prestador/Administrador)
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El servicio de mapbox debe estar disponible.
  - El dispositivo debe contar con GPS o servicio de localización disponible.
- **Historias de Usuario Relacionadas:** US-GYM-01, US-GYM-02

---

## Descripción General
**Como** Usuario,  
**quiero** ver mi ubicación actual en tiempo real sobre el mapa interactivo,  
**para** orientarse dentro de la plataforma, conocer qué puntos de interés tengo cerca y facilitar la navegación durante mi recorrido.

---

## Descripción Funcional
Cuando el Usuario accede al mapa y otorga permisos de ubicación, el sistema obtiene las coordenadas actuales del dispositivo mediante GPS y las refleja en el mapa con un indicador visual diferenciado (distinto a los pins de POIs). La posición se actualiza de forma continua en segundo plano mientras el Usuario permanece en la vista del mapa, de modo que el indicador se desplace en tiempo real a medida que el Usuario se mueve. El sistema centra el mapa automáticamente sobre la ubicación del Usuario al ingresar al mapa, con la opción de volver a centrarlo manualmente mediante un botón dedicado. La ubicación del Usuario no se persiste en la base de datos; solo se utiliza en memoria para la visualización y como referencia para funciones dependientes como el filtrado por proximidad y la navegación. Si el Usuario deniega los permisos de ubicación, el sistema no muestra el indicador y permite la navegación manual del mapa sin esta funcionalidad activa.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario accede al mapa por primera vez | Que el sistema muestre un pop up en pantalla con el mensaje “Se solicita permiso de acceso a la ubicación del dispositivo” con la opción “Aceptar” y “Rechazar” antes de activar el seguimiento en tiempo real | - |
| El Usuario otorga permiso de ubicación | Que el sistema obtenga las coordenadas actuales del dispositivo, centre el mapa sobre esa posición y muestre un indicador visual diferenciado que represente la ubicación del Turista | - |
| El Usuario se desplaza físicamente mientras tiene el mapa abierto | Que el indicador de ubicación se mueva en tiempo real sobre el mapa siguiendo el recorrido del Usuario sin necesidad de recargar la vista | - |
| El Usuario desplaza manualmente el mapa alejándose de su posición actual | Que el indicador de ubicación permanezca visible en el mapa en su posición correcta y que aparezca un botón para recentrar el mapa | - |
| El Usuario presiona el botón para volver a centrar | Que el mapa se centre nuevamente sobre la posición actual del Usuario con la última coordenada obtenida | - |
| El Usuarios deniega el permiso de ubicación | Que el sistema no muestre el indicador de posición, oculte el botón para volver a centrar y permita la navegación manual del mapa, informando en un popup con el mensaje "Activá los permisos de ubicación para ver tu posición en el mapa" | - |
| El Usuario deniega el permiso de ubicación pero luego lo habilita desde la configuración del dispositivo y regresa al mapa | Que el sistema detecte el nuevo permiso otorgado, active el seguimiento en tiempo real y muestre el indicador de posición sin necesidad de reiniciar la aplicación | - |
| El GPS del dispositivo pierde señal temporalmente mientras el Usuarios tiene el mapa abierto | Que el indicador de ubicación permanezca en la última posición conocida y se muestre un popup con el mensaje "Señal GPS perdida. Mostrando última ubicación registrada" hasta que la señal se recupere | - |
| El GPS del dispositivo recupera señal luego de una pérdida | Que el sistema actualice automáticamente el indicador a la posición actual sin intervención del Usuario y retire el popup con el mensaje de señal perdida | - |
| El Usuario permanece en el mapa con el GPS activo durante un período prolongado sin moverse | Que el sistema mantenga el seguimiento activo y el indicador estático en la posición actual sin generar errores ni cerrar el servicio de localización | - |
| El Usuario sale del módulo de mapa y regresa | Que el sistema reactive el seguimiento de ubicación automáticamente si el permiso sigue otorgado y centre el mapa sobre la posición actual | - |
