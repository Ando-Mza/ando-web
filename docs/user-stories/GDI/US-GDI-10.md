# US-GDI-10: Ejecución de Itinerario (Modo Live)

## Identificación
* **ID:** US-GDI-10
* **Título:** Ejecución de Itinerario (Modo Live)
* **Puntos de Historia:** 5
* **Actor:** Turista
* **US Relacionadas:** US-GDI-01, US-GDI-02, US-GDI-11

---

## Descripción General
Como **Turista**  
Quiero **activar la ejecución de un itinerario en una vista simplificada**  
Para **guiarme paso a paso durante el día usando el teléfono móvil.**

---

## Descripción Funcional
El sistema debe permitir activar el "Modo Live" para la ejecución de un itinerario. 
Al realizar el cambio de estado a `EN_CURSO` mediante una transacción, la API entregará un payload reducido (Data Transfer Object optimizado) enviando únicamente al frontend los datos del día actual y las coordenadas del siguiente punto inmediato, minimizando el consumo de red en ruta.

---

## Precondiciones
1. El Turista debe estar autenticado en el sistema.
2. Debe existir un itinerario previamente creado con POIs y con `fechaInicio` igual a la fecha actual (`fechaActual`).

---

## Criterios de Aceptación

| Escenario / Acción (Cuando) | Comportamiento Esperado (Espero) | Componente / Pantalla |
| :--- | :--- | :--- |
| El Turista presiona el botón "Iniciar Viaje" en un itinerario con estado "Borrador" o "Activo" cuya fecha de inicio es igual a la fecha actual. | El backend actualiza el `estadoId` del itinerario en la tabla `Itinerario` a `"en_curso"`. La interfaz cambia al "Modo Live", bloqueando la edición masiva estructural y mostrando la primera parada del día con el botón de "Cómo llegar" (conexión con Google Maps/Waze). | Modo Live / Detalle de Itinerario |
| El Turista presiona el botón "Iniciar Viaje" pero la fecha de inicio es en el futuro. | El sistema bloquea la acción y muestra un Toast/Alerta: *"Aún no es la fecha de inicio de este viaje. Podrás activarlo el [fechaInicio]"*, manteniendo el viaje en su estado actual. | Detalle de Itinerario / Alerta |
| El Turista llega físicamente a un POI. | El sistema, a través de geocercas (GPS), detecta que llegó al destino y actualiza el registro en la tabla `RutaPOI`, marcando `completada = true` y guardando la hora actual en `horaRealLlegada`. El sistema detiene instantáneamente el seguimiento GPS en segundo plano (para ahorrar batería/datos). La interfaz abandona la vista de mapa/ruta y entra en "Vista de Experiencia", priorizando en pantalla la información del POI (notas del creador, precios, horarios, botón para registrar gastos en `RegistroCosto`). | Modo Live (Geocercas) / Vista de Experiencia |
| El GPS no detecta la llegada al POI por pérdida de señal (Fallback manual). | La interfaz provee un botón secundario visible de "Ya estoy aquí / Check-in Manual". Al presionarlo, el sistema ejecuta la misma actualización en `RutaPOI` del criterio anterior, permitiendo al turista avanzar en su viaje sin quedar bloqueado por fallas de hardware. | Vista de Experiencia (Fallback) |
| El Turista finaliza su visita en el POI actual y presiona "Ir a la siguiente parada". | El sistema detiene el tiempo de la estancia actual. Se abre un modal emergente titulado "Resumen de tu Visita" donde se muestra el tiempo real que el usuario pasó en el lugar (calculado automáticamente restando la `horaRealLlegada` de la hora actual del dispositivo). | Vista de Experiencia / Modal Resumen |
| El sistema muestra los campos de llenado opcionales dentro del modal de resumen. | El modal habilita de forma clara tres secciones opcionales:<br>1. Un campo numérico para colocar el monto total que gastó en esa parada.<br>2. Un selector de 1 a 5 estrellas para la puntuación.<br>3. Un cuadro de texto para escribir una breve reseña/comentario sobre el lugar y agregar fotos.<br>En la parte inferior se muestran dos botones: "Guardar y Continuar" y "Omitir". | Modal Resumen (Campos Opcionales) |
| El Turista completa los datos del modal y presiona "Guardar y Continuar". | El backend ejecuta una transacción que inserta un registro en `RegistroCosto` (asociado a esa `paradaId`), un registro en `Valoracion` y otro en `Reseña` (con el estado inicial correspondiente). El sistema cierra el modal, guarda los datos con éxito, reactiva el GPS en segundo plano y cambia la pantalla para enfocar la ruta hacia la próxima parada del día. | Modal Resumen / Persistencia |
| El Turista no desea rellenar los datos y presiona el botón "Omitir" (o cierra el modal). | El sistema cierra el modal inmediatamente de forma limpia sin realizar ninguna inserción en las tablas de costos o reseñas. Reactiva el GPS al instante y enfoca directamente la siguiente parada cronológica, garantizando que el usuario no sufra ninguna interrupción molesta en su viaje si prefiere avanzar rápido. | Modal Resumen / Navegación |
| El Turista finaliza su visita tarde en el POI actual y presiona "Siguiente Parada" (o en el modal de Resumen). | El sistema toma la hora actual del dispositivo y realiza un recálculo dinámico en cascada para el resto del día: `NuevaHoraLlegada = HoraActual + tiempoTraslado`. Si el sistema detecta que la nueva hora de llegada sumada a la `duracionEstimada` del próximo POI supera la `horaHasta` registrada en su tabla `Horario` (es decir, el lugar ya habrá cerrado), detecta el conflicto de horario de cierre y despliega un modal de advertencia destacando el problema: *"¡Alerta de Tiempo! Debido al retraso, si vas a [Nombre_POI_Siguiente] llegarás muy tarde y el lugar ya se encontrará cerrado (Cierra a las XX:XX hs)."* | Recálculo Dinámico / Alerta de Horario |
| El sistema ofrece opciones de resolución rápida dentro de la alerta de retraso. | El modal le presenta al turista 2 acciones claras para que el viaje no se rompa:<br>1. "Saltar lugar": El sistema salta ese POI, lo devuelve al Backlog en la base de datos con `asignado = false` (para que no lo pierda si quiere ir otro día), y traza la ruta directo hacia el subsiguiente lugar que sí esté abierto.<br>2. "Ver de todos modos": El usuario decide ir igual bajo su propio riesgo, activando el GPS hacia ese lugar. | Alerta de Horario / Opciones |
| El Turista selecciona "Saltar lugar" en la alerta de retraso. | El backend marca la `RutaPOI` conflictiva como cancelada/saltada, actualiza el `ordenSecuencia` de las paradas restantes del día, recalcula los traslados y distancias en la tabla `RutaDiaria` padre, y enfoca la interfaz en el nuevo destino de forma fluida. | Alerta de Horario / Saltar Lugar |
| El Turista selecciona "Ver de todos modos" en la alerta de retraso. | Se comporta de manera normal y continúa la navegación hacia el siguiente POI. | Alerta de Horario / Continuar |
| El Turista completa la ÚLTIMA parada de un día intermedio (ej. Día 1 de un viaje de 3 días). | El sistema detecta que no hay más registros en `RutaPOI` para el `diaRelativo` actual. La interfaz muestra una pantalla de *"¡Día completado!"*, apaga los servicios de ubicación, y deja el viaje en "pausa activa". El sistema no mostrará las paradas del Día 2 hasta que cronológicamente el reloj del dispositivo marque el día siguiente, momento en el que habilitará el botón "Iniciar Día 2". | Fin de Día / Transición |
| El Turista completa la última parada del último día y presiona "Finalizar Viaje". | El backend actualiza el `estadoId` del itinerario a `"finalizado"`. El sistema redirige al usuario a una pantalla de resumen felicitándolo y habilitando la opción de dejar Reseñas o registrar sus gastos (`RegistroCosto`) finales. | Fin de Viaje / Pantalla de Resumen |
