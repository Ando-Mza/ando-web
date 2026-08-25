# US-NYA-07: Centro de Notificaciones

## Información General
- **Identificador:** US-NYA-07
- **Actor:** Usuario (Turista/Prestador/Administrador)
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El Usuario debe haber iniciado sesión de forma correcta en la aplicación.
- **Historias de Usuario Relacionadas:** US-NYA-02, US-NYA-03, US-NYA-05, US-NYA-06

---

## Descripción General
**Como** Usuario  
**Quiero** disponer de un centro de notificaciones centralizado  
**Para** revisar el historial de mis alertas, identificar novedades no leídas y acceder rápidamente a las secciones asociadas.

---

## Descripción Funcional
El sistema debe proveer un panel desplegable que liste de manera cronológica, visualizando primero las más recientes según fechaCreacion, las notificaciones asociadas al UsuarioId en sesión. Cada elemento muestra visualmente si está leida o no y se consume el valor de urlAccion para redirigir al Usuario al hacer clic en la correspondiente.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario selecciona un icono de campana | Que el sistema consulte la tabla Notificacion por su UsuarioId y renderice la lista ordenada de forma descendente por fechaCreacion. Las que tengan leida = false deben tener un fondo o indicador de color resaltado. | - |
| El Usuario selecciona una notificación no leída del listado | Que el sistema cambie el registro en la base de datos a leida = true, registre la fechaLectura, actualice la interfaz quitando el resaltado visual y redirija al Usuario a la ruta guardada en urlAccion. | - |
| El Usuario presiona el botón "Marcar todas como leídas" | Que el sistema ejecute una actualización masiva sobre todas las filas del centro que tengan el atributo leida inicializado en false, y que guarde su fechaLectura con la fecha actual | - |
| Un Usuario ingresa al centro de notificaciones y no posee ninguna | Que el sistema muestre un mensaje "Por aca todo tranquilo. No tenés notificaciones pendientes". | - |
