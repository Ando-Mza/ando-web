# US-RYI-01: Reporte de POIs más Visitados

## Información General
- **Identificador:** US-RYI-01
- **Actor:** Administrador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - Usuario autenticado con rol Administrador.
  - Al menos un itinerario en estado "finalizado" o "en_curso" en el período seleccionado.
- **Historias de Usuario Relacionadas:** US-RYI-06, US-RYI-07, US-RYI-05

---

## Descripción General
**Como** Administrador  
**Quiero** ver un reporte de los POIs más frecuentemente incluidos en itinerarios y visitados por los Turistas  
**Para** identificar los destinos más populares y tomar decisiones sobre promoción y distribución del flujo turístico.

---

## Descripción Funcional
El sistema genera un reporte consultando la tabla RutaPOI y contando la frecuencia con que cada poiId aparece en itinerarios con estado "finalizado" o "en_curso" dentro del período filtrado. Se hace join con POI para obtener nombre, categoría (via CategoriaPOI) y ubicación (via LocalidadPOI o equivalente geográfico). El reporte presenta dos métricas por POI: cantidad de apariciones en itinerarios (planificados) y cantidad de veces marcado como completada = true en RutaPOI (efectivamente visitados). La diferencia entre ambas métricas indica la tasa de abandono de ese POI durante el viaje real. Los resultados se presentan en una tabla paginada de 20 registros con ordenamiento por cualquier columna, y en un gráfico de barras con los top 10. El reporte respeta los filtros globales de período y categoría definidos en US-RYI-07.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Accedo al reporte | Ver una tabla con POI, categoría, cantidad de apariciones en itinerarios y cantidad de visitas efectivas ordenada por visitas efectivas descendente por defecto | - |
| Un POI tiene alta aparición en itinerarios pero baja visita efectiva | Poder identificarlo visualmente como POI con alta tasa de abandono | - |
| Seleccione un POI de la tabla | Ver un detalle con su distribución de visitas por mes dentro del período filtrado | - |
| Aplico un filtro de categoría | Que la tabla y el gráfico se actualicen mostrando solo POIs de esa categoría | - |
| No hay datos para el período seleccionado | Un mensaje claro indicando que no hay itinerarios finalizados en ese rango | - |
