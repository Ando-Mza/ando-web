# US-GDI-06: Compartir Itinerario Modo Lectura

## Información General
- **Identificador:** US-GDI-06
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El itinerario debe pertenecer al Usuario y tener al menos una (1) parada asignada.
  - El Usuario debe estar registrado y mantener una sesión activa.
- **Historias de Usuario Relacionadas:** US-GDI-08, US-GDI-05

---

## Descripción General
**Como** Turista  
**Quiero** publicar mi itinerario en la sección de "Viajes de la Comunidad" y generar un enlace de lectura  
**Para** que otros Usuarios puedan inspirarse, puntuar mi recorrido, usarlo como plantilla, y para poder mostrarlo a amigos fuera de la app.

---

## Descripción Funcional
El sistema gestionará la actualización del estado de publicación activando la bandera is_public = true e integrando el elemento en la vista comunitaria. Para el seguimiento de interacciones, el backend configurará los contadores iniciales de likes y saves en cero, además de crear un hash exclusivo que permita el acceso a través de una URL externa. Cuando se realicen consultas desde aplicaciones o sitios de terceros, el endpoint correspondiente proporcionará un DTO con sanitización estricta; este proceso asegura la eliminación de cualquier dato sensible del autor, como gastos privados, apellidos o direcciones de correo electrónico.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista presiona el botón "Publicar en la Comunidad" en la vista de detalle de su itinerario validado | El sistema actualizará el estado a público (is_public=true) e incorporará el itinerario al Feed de Rutas Comunitarias. Se creará un enlace externo de acceso exclusivo para lectura que se añadirá automáticamente al portapapeles. | - |
| El Turista de la comunidad entra al detalle de este viaje publicado | Que el sistema muestre únicamente: nombre del creador, título del viaje, días, lugares, tiempos de traslado y la puntuación actual comunitaria. | - |
| El Turista intenta presionar "Publicar" en un itinerario que no tiene nombre asignado o que no posee ningún POI en su recorrido | Que el sistema mantenga el botón deshabilitado y muestre un Toast indicando: "Debes asignar un nombre y agregar al menos un lugar a tu viaje antes de poder publicarlo en la comunidad", bloqueando la llamada a la API. | - |
| El Administrador da de baja (is_active = false) un Lugar Turístico que forma parte de un itinerario publicado | El sistema deberá suministrar un objeto JSON que preserve los registros pero incorporando un indicador de estado "Lugar Cerrado / No Disponible" en tono grisáceo. | - |
| El Turista creador decide volver su viaje privado y desactiva el switch de "Acceso Público" | Que el sistema actualice is_public = false, oculte inmediatamente el itinerario del Feed comunitario, desactive el enlace URL externo (HTTP 404) y conserve las métricas históricas de likes y saves. | - |
