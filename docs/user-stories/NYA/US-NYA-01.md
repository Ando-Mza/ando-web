# US-NYA-01: Recordatorio de Actividad Planificada

## Información General
- **Identificador:** US-NYA-01
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Usuario debe estar autenticado y tener la aplicación abierta.
  - El Usuario debe tener un itinerario en estado "En curso" con actividades programadas a futuro.
- **Historias de Usuario Relacionadas:** -

---

## Descripción General
**Como** Turista con un itinerario en curso,  
**Quiero** recibir una alerta proactiva en el sistema antes de mi próxima actividad programada,  
**Para** recordar mi compromiso, gestionar mis tiempos de traslado y cumplir con el recorrido optimizado.

---

## Descripción Funcional
El sistema notifica 30 minutos antes, el inicio de una actividad. Permitiendo acceder al Turista rápidamente al inicio de la misma.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista ingrese a la aplicación por primera vez en el día | Que el sistema valide en segundo plano el tiempo restante para el inicio de la actividad. | - |
| Faltan exactamente 30 minutos para el inicio de una actividad programada en un viaje activo. | Que el contador de notificaciones de la barra de navegación se incremente y, al abrir el panel, se visualice la tarjeta de alerta en el botón “Ver en Mapa” | - |
| Se muestre la notificación. | Que contenga nombre de actividad, hora de inicio, enlace directo hacia el mapa interactivo | - |
