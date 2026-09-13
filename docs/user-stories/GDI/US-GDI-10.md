# US-GDI-10: Inicio de Modo Viaje

## Información General
- **Identificador:** US-GDI-10
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - Usuario autenticado.
  - Itinerario Creado Con POIs y fechaInicio = fechaActual.
- **Historias de Usuario Relacionadas:** US-GDI-01, US-GDI-02, US-GDI-11

---

## Descripción General
**Como** Turista  
**Quiero** activar la ejecución de un itinerario en una vista simplificada  
**Para** me guiarme paso a paso durante el día usando el teléfono móvil.

---

## Descripción Funcional
Transacción de cambio de estado a EN_CURSO. La API entregará un payload reducido (Data Transfer Object optimizado) enviando únicamente al frontend los datos del día actual y las coordenadas del siguiente punto inmediato, minimizando el consumo de red en ruta.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista presiona el botón "Iniciar Viaje" en un itinerario con estado "Borrador" o "Activo" cuya fecha de inicio es igual a la fecha actual | El backend actualiza el estadoId del itinerario en la tabla Itinerario a "en_curso". La interfaz cambia al "Modo Live", bloqueando la edición masiva estructural y mostrando la primera parada del día con el botón de "Cómo llegar". | GDIIniciarModoViajeGUI |
| El Turista presiona el botón "Iniciar Viaje" pero la fecha de inicio es en el futuro | El sistema bloquea la acción y muestra un Toast/Alerta: "Aún no es la fecha de inicio de este viaje. Podrás activarlo el [fechaInicio].", manteniendo el viaje en su estado actual. | - |
| El Turista llega físicamente a un POI | El sistema, a través de geocercas (GPS), detecta que llegó al destino y actualiza el registro en la tabla RutaPOI, marcando completada = true y guardando la hora actual en horaRealLlegada. El sistema detiene instantáneamente el seguimiento GPS en segundo plano. La interfaz entra en "Vista de Experiencia". | - |
| El GPS no detecta la llegada al POI por pérdida de señal (Fallback manual) | La interfaz provee un botón secundario visible de "Ya estoy aquí / Check-in Manual". Al presionarlo, el sistema ejecuta la misma actualización en RutaPOI. | - |
| El Turista finaliza su visita en el POI actual y presiona "Ir a la siguiente parada" | El sistema detiene el tiempo de la estancia actual. Se abre un modal emergente titulado "Resumen de tu Visita" donde se muestra el tiempo real que el Usuario pasó en el lugar con secciones para costo gastado, valoración de 1-5 estrellas y reseña/fotos. | - |
| El Turista completa los datos del modal y presiona "Guardar y Continuar" | El backend ejecuta una transacción que inserta un registro en RegistroCosto, uno en Valoracion y otro en Reseña. El sistema cierra el modal, guarda los datos, reactiva el GPS en segundo plano y cambia la pantalla hacia la próxima parada. | - |
| El Turista no desea rellenar los datos y presiona el botón "Omitir" | El sistema cierra el modal inmediatamente de forma limpia sin realizar ninguna inserción en las tablas de costos o reseñas. Reactiva el GPS al instante y enfoca directamente la siguiente parada. | - |
| El Turista finaliza su visita tarde en el POI actual y presiona "Siguiente Parada" | El sistema realiza un recálculo dinámico en cascada. Si detecta conflicto de horario de cierre, despliega un modal de advertencia crítica ofreciendo dos opciones: "Saltar lugar" o "Ver de todos modos". | - |
| El Turista selecciona "Saltar lugar" en la alerta de retraso | El backend marca la RutaPOI conflictiva como cancelada/saltada, actualiza el ordenSecuencia y recalcula traslados y distancias. | - |
| El Turista selecciona "Ver de todos modos" en la alerta de retraso | Se comporta de manera normal y continua hacia el siguiente POI. | - |
| El Turista completa la ÚLTIMA parada de un día intermedio (ej. Día 1 de un viaje de 3 días) | El sistema detecta que no hay más registros en RutaPOI para el diaRelativo actual. Muestra la pantalla "¡Día completado!", apaga los servicios de ubicación y deja el viaje en "pausa activa" hasta el día siguiente. | - |
| El Turista completa la última parada del último día y presiona "Finalizar Viaje" | El backend actualiza el estadoId del itinerario a "finalizado". El sistema redirige al Usuario a una pantalla de resumen felicitándolo y habilitando la opción de dejar reseñas o registrar sus gastos finales. | - |
