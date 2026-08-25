# US-GDI-12: Historial de Viajes

## Información General
- **Identificador:** US-GDI-12
- **Actor:** Turista
- **Puntos de Historia:** 2
- **Precondiciones:**
  - El Turista debe estar autenticado.
  - Deben existir itinerarios vinculados al Usuario en UsuarioItinerario cuyo estadoId en la tabla Itinerario sea igual a "finalizado".
- **Historias de Usuario Relacionadas:** US-GDI-10

---

## Descripción General
**Como** Turista  
**Quiero** visualizar una lista de mis itinerarios pasados  
**Para** recordar lugares visitados y tener un archivo de mis viajes.

---

## Descripción Funcional
Consulta SELECT simple a la tabla de itinerarios filtrando por user_id y estado = FINALIZADO. Se entregan datos agrupados (ej. cantidad de lugares visitados, fecha) en lugar de todo el árbol del itinerario, delegando al Módulo de Reportes la visualización.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista ingresa a la pestaña "Mis Viajes" | El backend ejecuta un SELECT en la tabla Itinerario unida con UsuarioItinerario, filtrando por el ID del Usuario en sesión y dividiendo los itinerarios. Tras una línea divisoria, muestra un listado cronológico (del más reciente al más antiguo) de los viajes terminados. | - |
| El sistema renderiza las tarjetas del historial con datos agregados | Cada tarjeta de viaje pasado debe mostrar únicamente: nombre del viaje, rango de fechas (fechaInicio a fechaFin), la cantidad total de paradas reales completadas (un conteo de RutaPOI donde completada = true) y el costo total final (la suma de monto en RegistroCosto). | - |
| El Turista ingresa al historial pero nunca ha completado ningún viaje en la app | El sistema detecta que la consulta devuelve un arreglo vacío y muestra una pantalla con el diseño de un pasaporte vacío y el texto: "¡Tu historial está listo para llenarse de aventuras! Comienza a planificar tu próximo viaje para verlo aquí." | - |
| El Turista selecciona un viaje específico de su historial | La interfaz redirige al Usuario a la vista de "Resumen de Viaje Pasado" (Módulo de reportes). Esta pantalla es estrictamente de Solo lectura (el backend bloqueará cualquier intento de PUT/POST/PATCH), mostrando estadísticas de los lugares que efectivamente visitó, fotos cargadas en las reseñas y gráficos del presupuesto gastado. Si no ha realizado reseñas, en la sección de reseñas aparece un mensaje: “Añade tus reseñas a los lugares que visitaste!” | - |
