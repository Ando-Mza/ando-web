# US-GDI-07: Administración Colaborativa

## Información General
- **Identificador:** US-GDI-07
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Usuario creador (Owner) debe estar autenticado.
  - El itinerario no debe estar en estado "Finalizado".
  - El Usuario a invitar debe estar registrado previamente en "Ando".
- **Historias de Usuario Relacionadas:** US-GDI-03, US-GDI-04

---

## Descripción General
**Como** Turista  
**Quiero** invitar a otros Usuarios registrados a que editen mi itinerario  
**Para** organizar un viaje grupal de manera conjunta.

---

## Descripción Funcional
Implica crear una tabla pivote Itinerario_Colaboradores con estados (Pendiente, Activo). A nivel de arquitectura, el backend implementará Control de Concurrencia Optimista usando un campo versión (entero) en la tabla Itinerarios. Cada vez que alguien guarda un cambio, el backend verificará que la versión que envía el cliente coincida con la de la base de datos; si coincide, guarda y suma +1 a la versión. Si no coincide, rechaza la petición (HTTP 409) para evitar que dos Usuarios sobrescriban sus datos mutuamente.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario creador (Owner) ingresa el email o Nickname de un amigo y presiona "Invitar colaborador"... | El backend verifique que el Usuario existe en el sistema, inserte un registro en Itinerario_Colaboradores con estado "Pendiente", y envíe una notificación al amigo invitado. Si no existe, muestre error: "Usuario no encontrado". | - |
| El Usuario invitado ingresa a su centro de notificaciones, visualiza la solicitud y presiona "Aceptar"... | El backend actualice el estado en la tabla Itinerario_Colaboradores a "Activo", otorgándole permisos transaccionales y el viaje aparezca en su lista de "Mis Viajes" con etiqueta "Colaborativo". | - |
| Un colaborador (que ya aceptó la invitación) intenta presionar "Eliminar Viaje Completo" o intenta invitar a un tercer Usuario | El backend bloquee la acción validando su rol en la tabla pivote, responda con HTTP 403 Forbidden, y el frontend muestre: "Solo el creador original del viaje puede realizar esta acción." | - |
| El Colaborador A y B tienen el viaje abierto en versión "1". A guarda una parada (pasa a v2). Segundos después, B guarda cambios enviando payload con versión "1"... | El backend detecte que las versiones no coinciden (1 != 2), frene la transacción y responda a B con un error HTTP 409 Conflict: "El itinerario fue modificado por otro colaborador hace un instante. Por favor, actualiza la vista." | - |
| El Colaborador B recibe la alerta de conflicto del criterio anterior y presiona "Actualizar y ver cambios"... | El frontend realice una nueva petición GET, descargue la versión "2" del itinerario y le permita al Colaborador B volver a aplicar sus propias ediciones sobre información fresca. | - |
| El creador (Owner) decide quitar a un amigo del viaje y presiona eliminar junto a su nombre... | El backend revoque el acceso en Itinerario_Colaboradores, ejecute una clonación profunda oculta del viaje capturando el estado exacto de ese milisegundo, y envíe una notificación preguntando si desea conservar una copia. | - |
| El Usuario expulsado recibe la notificación y presiona "Sí, guardar copia" | El backend cambie el estado de la copia oculta a BORRADOR asignándola a su perfil. | - |
| El Usuario expulsado presiona "No, gracias", o ignora por más de 7 días | El backend ejecute un borrado físico (HARD DELETE) de esa copia oculta liberando espacio. | - |
| El creador intenta invitar su propio correo o un amigo ya existente en la lista | El sistema mantenga deshabilitado el botón de envío y muestre un Toast: "Este Usuario ya es parte del viaje o no puedes invitarte a ti mismo". | - |
