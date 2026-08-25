# US-NYA-02: Alerta de Cambio de POI

## Información General
- **Identificador:** US-NYA-02
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario con rol Turista debe estar registrado en el sistema.
  - El itinerario debe contener al menos un registro en RutaPOI vinculado al POI modificado.
  - Las modificaciones en el POI deben haber sido confirmadas y persistidas por un Prestador o Administrador.
- **Historias de Usuario Relacionadas:** US-NYA-01, US-NYA-08

---

## Descripción General
**Como** Turista  
**Quiero** recibir una alerta inmediata si un Punto de Interés (POI) de mi itinerario sufre cambios en su disponibilidad, horarios o estado  
**Para** reorganizar mi ruta a tiempo y evitar contratiempos durante mi viaje.

---

## Descripción Funcional
El sistema debe implementar un mecanismo automatizado (Listener / Trigger) que se ejecute de manera asincrónica ante modificaciones críticas en la tabla POI (cambios en dirección, latitud, longitud o si su estadoId cambia en EstadoPOI a 'suspendido' o 'rechazado') o en su tabla dependiente Horario.
Al detectar el cambio, el sistema identificará mediante la tabla RutaPOI y RutaDiaria todos los Itinerario con fechas futuras (fechaInicio mayor o igual a la fecha actual) que incluyan dicho poiId. Posteriormente, para cada Usuario vinculado en UsuarioItinerario (cuyo tipoInteraccion sea 'creador' o 'editor'), el sistema insertará un registro en la tabla Notificacion. Se utilizará el valor recordatorio para el atributo tipoNotificacion, se redactará un titulo y mensaje dinámico con el nombre del POI, se inicializará leida en false y se guardará en urlAccion el deep link hacia la ruta afectada.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Un Prestador modifica y guarda un rango en la tabla Horario de su POI, afectando a un itinerario futuro de un Turista | Que el sistema cree en segundo plano un registro en la tabla Notificacion asociado al UsuarioId del Turista, con leida = false y el mensaje detallando el cambio. | - |
| El Turista ingresa a la aplicación o navega a su centro de alertas | Que la interfaz consulte la tabla Notificacion, renderice el registro pendiente mostrando el título descriptivo y cambie el estado visual para indicar que no ha sido leída. | - |
| El Turista hace clic en la notificación de alerta de cambio | Que el sistema consuma el atributo urlAccion, redirija al Usuario a la pantalla detallada de su ruta actualice en la base de datos la fechaLectura con la marca de tiempo actual y configure leida = true. | - |
| Un Administrador cambia el estadoId de un POI a 'suspendido' (Baja temporal por sanción o cierre) | Que el sistema genere alertas automáticas con máxima prioridad a todos los Usuarios con interacciones de tipo creador en itinerarios que contengan ese POI dentro de las fechas de suspensión. | - |
