# US-NYA-04: Notificación de Validación de Negocio

## Información General
- **Identificador:** US-NYA-04
- **Actor:** Prestador
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El Prestador debe estar correctamente vinculado a la Organizacion que posee el POI mediante la tabla UsuarioOrganizacion.
  - El Administrador debe haber persistido el cambio de estadoId del POI en la base de datos desde el módulo PAD.
- **Historias de Usuario Relacionadas:** US-CYN-02, US-CYN-05, US-PAD-02, US-NYA-08

---

## Descripción General
**Como** Prestador  
**Quiero** recibir una notificación inmediata con el resultado de la validación formal de mi negocio  
**Para** saber si mi Punto de Interés (POI) ya se encuentra visible para los Turistas o si fue rechazado y requiere correcciones.

---

## Descripción Funcional
El sistema debe ejecutar un proceso automatizado cuando un Administrador procese una verificación en la historia US-CYN-05. Al actualizar el registro del POI y modificar su estadoId en la tabla EstadoPOI hacia los valores 'aprobado' o 'rechazado', el sistema buscará al dueño de la cuenta utilizando la relación intermedia UsuarioOrganizacion a partir del organizacionId del POI.
Una vez identificado el UsuarioId del Prestador, el sistema insertará una nueva fila en la tabla Notificacion parametrizada con el enum tipoNotificacion = 'recordatorio'. El título y mensaje se construirán de forma dinámica con el nombre del POI y el veredicto del Admin (incluyendo el motivo en caso de rechazo). El campo leída se inicializará en false y el atributo urlAccion guardará el deep link directo al panel de control del Prestador.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador cambia el estadoId de un POI a 'aprobado' en el panel de control | Que el sistema cambie el POI al estado visible para el motor de recomendación, e inserte una notificación en la tabla Notificacion para el Prestador con tipoNotificacion = 'recordatorio' y el mensaje "¡Felicitaciones! Tu negocio [Nombre] ha sido aprobado". | - |
| El Administrador cambia el estadoId de un POI a 'rechazado' e introduce los motivos | Que el sistema mantenga el POI oculto para los Turistas y cree un registro en la tabla Notificacion para el Prestador detallando las razones del rechazo en el campo mensaje | - |
| El Prestador inicia sesión en la plataforma tras la validación de su negocio | Que el centro de notificaciones consulte la tabla Notificacion y liste la alerta pendiente con su correspondiente estado visual de "No leída". | - |
| El Prestador selecciona la notificación de validación en la interfaz | Que el sistema lea el campo urlAccion, redirija al Usuario directamente a la edición de su perfil comercial asignando la marca de tiempo en fechaLectura y leida = true. | - |
