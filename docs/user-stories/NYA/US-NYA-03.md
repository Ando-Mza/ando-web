# US-NYA-03: Notificación de Evento Nuevo

## Información General
- **Identificador:** US-NYA-03
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario con rol de Turista debe estar registrado y con una sesión activa.
  - El Turista debe tener configurada al menos una preferencia activa en UsuarioPreferencia.
- **Historias de Usuario Relacionadas:** US-CYN-05, US-NYA-08, US-CYP-05

---

## Descripción General
**Como** Turista  
**Quiero** recibir una notificación sobre un nuevo evento  
**Para** descubrir experiencias y sumarlas a mi viaje

---

## Descripción Funcional
El sistema debe implementar un proceso asíncrono (Background Job) que se dispare inmediatamente después de que un Administrador cambie el estadoId de un nuevo POI a 'aprobado' (en la tabla EstadoPOI). Además, identificará las categorías del POI mediante CategoriaPOI y buscará a todos los Usuarios con rol Turista que tengan una coincidencia exacta en la tabla UsuarioPreferencia. Para cada Usuario que cumpla el criterio, se insertará un registro en la tabla Notificacion configurando el atributo tipoNotificacion como recomendacion. Los campos titulo y mensaje se estructurarán dinámicamente (ej: "¡Nuevo lugar para descubrir! [Nombre POI] acaba de unirse a Ando en [Nombre Departamento]"), leida se inicializará en false y el campo urlAccion almacenará el deep link directo a la vista detallada del POI.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador aprueba un nuevo POI | Que el sistema identifique a los Turistas interesados en esa categoría e inserte un registro por cada uno en la tabla Notificacion con tipoNotificacion = 'recomendacion' y leida = false. | - |
| El Turista con preferencias coincidentes abre la aplicación | Que el centro de notificaciones consulte la tabla Notificacion, traiga la recomendación no leída y la muestre con la marca visual de "Nueva". | - |
| El Turista selecciona la notificación del nuevo POI | Que el frontend consuma el atributo urlAccion, redirija al Usuario a la pantalla de información del POI (GUI_POI_Detalle), registre la fechaLectura del servidor y actualice leida = true en la base de datos. | - |
| El Administrador aprueba un POI cuyas categorías no coinciden con las de un Turista específico | Que el sistema no genere ningún registro en la tabla Notificacion para ese Usuario, asegurando la personalización del feed de alertas. | - |
