# US-MRIA-04: Recomendación por Historial

## Información General
- **Identificador:** US-MRIA-04
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - Usuario autenticado.
  - Al menos un itinerario finalizado o cinco valoraciones registradas.
- **Historias de Usuario Relacionadas:** US-MRIA-01, US-MRIA-10, US-GDI-02, US-GDI-12, US-RYV-01

---

## Descripción General
**Como** Turista  
**Quiero** que el sistema aprenda de mis viajes anteriores para mejorar las sugerencias futuras  
**Para** recibir recomendaciones cada vez más ajustadas a mis gustos reales y no solo a mis preferencias declaradas.

---

## Descripción Funcional
El sistema analiza el historial del Usuario considerando tres fuentes de datos: los POIs incluidos en itinerarios con estado "finalizado" (tabla Itinerario + RutaPOI), las valoraciones positivas realizadas (tabla Valoracion con puntuacion >= 4) y los POIs marcados como favoritos (tabla FavoritoPOI). Con esos datos extrae las categorías más frecuentes y las usa para ponderar las recomendaciones, dándoles mayor peso que las preferencias declaradas estáticamente. Los POIs que el Usuario ya visitó (presentes en itinerarios finalizados) se excluyen de las recomendaciones por defecto, con opción de mostrarlos si el Usuario lo solicita explícitamente.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista tiene itinerarios finalizados | Que las categorías de esos POIs influyan en mis recomendaciones futuras | - |
| El Turista valora un POI con 5 estrellas | Que el sistema sugiera POIs similares en categoría y precio | - |
| El Turista visita un POI en un viaje anterior | Que no aparezca en recomendaciones a menos que yo active "mostrar visitados" | - |
| El Turista no tiene historial suficiente | Que el sistema use exclusivamente mis preferencias declaradas sin mostrar error | - |
