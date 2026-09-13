# US-NYA-06: Notificación de Actualización de Plataforma

## Información General
- **Identificador:** US-NYA-06
- **Actor:** Usuario (Administrador/Turista/Prestador)
- **Puntos de Historia:** 5
- **Precondiciones:**
  - Los Usuarios deben estar registrados en el sistema.
  - El Administrador genera el disparador del evento desde el modulo administrativo.
- **Historias de Usuario Relacionadas:** US-PAD-01, US-NYA-08

---

## Descripción General
**Como** Usuario  
**Quiero** recibir una notificación cuando se implementen nuevas actualizaciones, mejoras o mantenimientos en el sistema  
**Para** estar al tanto de las nuevas funcionalidades disponibles y optimizar mi uso de la aplicación.

---

## Descripción Funcional
El sistema debe permitir el envío masivo de alertas informativas cuando el Administrador publique un aviso de actualización desde el panel de control. El backend ejecutará un script o job asíncrono que consultará la tabla Usuario para filtrar todas las cuentas activas (fechaBaja es nulo). Por cada Usuario detectado, el sistema insertará una fila en la tabla Notificacion parametrizada con tipoNotificacion = 'recordatorio'. El Administrador definirá el título (ej: "¡Plataforma Actualizada! Versión 2.0") y el mensaje con los detalles del release. El campo leida se inicializará en false y el campo urlAccion guardará un enlace interno opcional o un deep link para forzar la recarga del cliente móvil.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador lanza globalmente un aviso de nueva versión desde el PAD | Que el sistema encole la tarea en segundo plano y genere un registro en la tabla Notificacion por cada UsuarioId activo en el sistema con leida = false | - |
| Cualquier tipo de Usuario (Turista o Prestador) accede a la aplicación luego del disparo de la notificación | Que el icono de la campana muestre el indicador de alertas pendientes y, al abrirlo, se renderice el título de la actualización con su marca visual de "No leído" | - |
| El Usuario selecciona la notificación de actualización del sistema | Que el sistema abra el detalle del mensaje informativo o consuma el urlAccion, marque la fechaLectura con el timestamp actual y actualice el registro a leida = true. | - |
| El sistema encuentra un Usuario registrado con baja lógica | Que el sistema no envíe la notificación y lo ignore | - |
