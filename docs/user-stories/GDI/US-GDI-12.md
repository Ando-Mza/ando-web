# US-GDI-12: Historial de Viajes

## Identificación
* **ID:** US-GDI-12
* **Título:** Historial de Viajes
* **Puntos de Historia:** 2
* **Actor:** Turista
* **US Relacionadas:** US-GDI-10 (Modo Viaje)

---

## Descripción General
Como **Turista**  
Quiero **visualizar una lista de mis itinerarios pasados**  
Para **recordar lugares visitados y tener un archivo de mis viajes.**

---

## Descripción Funcional
Consulta `SELECT` simple a la tabla de itinerarios filtrando por `user_id` y `estado = FINALIZADO`. Se entregan datos agrupados (ej. cantidad de lugares visitados, fecha) en lugar de todo el árbol del itinerario, delegando la visualización detallada al Módulo de Reportes.

---

## Precondiciones
1. El Turista debe estar autenticado.
2. Deben existir itinerarios vinculados al usuario en `UsuarioItinerario` cuyo `estadoId` en la tabla `Itinerario` sea igual a `"finalizado"`.

---

## Criterios de Aceptación

| Escenario / Acción (Cuando) | Comportamiento Esperado (Espero) | Componente / Pantalla |
| :--- | :--- | :--- |
| El Turista ingresa a la pestaña "Mis Viajes". | El backend ejecuta un `SELECT` en la tabla `Itinerario` unida con `UsuarioItinerario`, filtrando por el ID del usuario en sesión y dividiendo los itinerarios. Tras una línea divisoria, muestra un listado cronológico (del más reciente al más antiguo) de los viajes terminados. | Mis Viajes / Historial |
| El sistema renderiza las tarjetas del historial con datos agregados. | Cada tarjeta de viaje pasado debe mostrar únicamente: nombre del viaje, rango de fechas (`fechaInicio` a `fechaFin`), la cantidad total de paradas reales completadas (un conteo de `RutaParada` donde `completada = true`) y el costo total final (la suma de `monto` en `RegistroCosto`). | Mis Viajes / Tarjeta de Historial |
| El Turista ingresa a "Mis Viajes" pero nunca ha completado ningún viaje en la app. | El sistema detecta que la consulta de viajes finalizados devuelve un arreglo vacío `[]` y muestra en la sección de historial un contenedor con el diseño de un pasaporte vacío y el texto: *"¡Tu historial está listo para llenarse de aventuras! Comienza a planificar tu próximo viaje para verlo aquí."* | Mis Viajes / Historial (Empty State) |
| El Turista selecciona un viaje específico de su historial. | La interfaz redirige al usuario a la vista de "Resumen de Viaje Pasado" (Módulo de Reportes). Esta pantalla es estrictamente de Solo Lectura (sin botón de edición, el backend bloqueará cualquier intento de `PUT`/`POST`/`PATCH`), mostrando estadísticas de los lugares que efectivamente visitó, fotos cargadas en las reseñas y gráficos del presupuesto gastado. | Historial -> Resumen de Viaje Pasado |
