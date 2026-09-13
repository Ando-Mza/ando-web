# US-NYA-05: Aviso de Nueva Reseña

## Información General
- **Identificador:** US-NYA-05
- **Actor:** Prestador
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El Usuario con rol de Prestador debe estar registrado y con una sesión activa en el sistema.
  - El Prestador debe estar vinculado activamente a la organización del POI en la tabla UsuarioOrganizacion.
  - La reseña del Turista debe haberse guardado con éxito en la base de datos y contar con un estadoReseñaId aprobado.
- **Historias de Usuario Relacionadas:** US-RYV-02, US-RYV-03, US-RYV-01, CYN-07, US-PAD-02

---

## Descripción General
**Como** Prestador  
**Quiero** recibir una notificación automática cada vez que un Turista publique una nueva reseña o valoración en mi negocio  
**Para** conocer la opinión de los clientes de forma inmediata y gestionar mis respuestas a tiempo.

---

## Descripción Funcional
El sistema debe ejecutar un proceso asíncrono disparado por la inserción exitosa de un registro en la tabla Reseña. A partir del poiId de la nueva reseña, el backend consultará la tabla POI para obtener el organizacionId correspondiente. Luego, mediante la tabla intermedia UsuarioOrganizacion, identificará al UsuarioId del Prestador dueño de ese comercio. Con estos datos, el sistema insertará una nueva fila en la tabla Notificacion parametrizada con tipoNotificacion = 'recordatorio'. El campo título se estructurará como "Nueva reseña recibida", el mensaje incluirá fragmentos del comentario y la puntuación otorgada, leída se inicializará en false y en urlAccion se guardará el deep link directo a la sección de opiniones del Dashboard del Prestador.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Un Turista publica una puntuación y comentario en un POI específico | Que el sistema identifique al Prestador responsable del POI y cree un registro en la tabla de Notificación con el atributo leida = false | - |
| El Prestador ingresa a la aplicación o revisa sus alertas pendientes | Que el centro de notificaciones renderice la alerta informando el nombre del POI que recibió el comentario y mostrando un indicador visual de "Mensaje no leído" | - |
| El Prestador hace clic sobre la notificación de la nueva reseña | Que el sistema consuma el atributo urlAccion, redirija al Usuario directamente al panel de gestión de comentarios de su negocio actualice la fechaLectura y leida = true. | - |
| Un Turista publica una reseña en un POI pero la organización no tiene ningún Prestador vinculado en UsuarioOrganizacion | Que el sistema no genere una notificación | - |
