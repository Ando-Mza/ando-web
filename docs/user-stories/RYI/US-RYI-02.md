# US-RYI-02: Reporte de Actividad de Usuarios

## Información General
- **Identificador:** US-RYI-02
- **Actor:** Administrador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - Usuario autenticado con rol Administrador.
  - Período de consulta definido (por defecto últimos 30 días).
- **Historias de Usuario Relacionadas:** US-RYI-06, US-RYI-07

---

## Descripción General
**Como** Administrador  
**Quiero** ver un reporte de la actividad de los Usuarios en la plataforma por período  
**Para** entender el comportamiento de uso, identificar tendencias de crecimiento y detectar caídas de engagement.

---

## Descripción Funcional
El reporte consolida métricas de actividad de la tabla Usuario, UsuarioItinerario, ConversacionIA, Valoracion y Reseña dentro del período filtrado. Las métricas presentadas son: nuevos registros por período (Usuarios con fechaAlta dentro del rango), Usuarios activos únicos (Usuarios que realizaron al menos una acción registrada en AuditoriaLog dentro del período), itinerarios creados (registros en Itinerario con fechaInicio dentro del período agrupados por creadoPorIA = true vs false), itinerarios finalizados, valoraciones registradas, reseñas aprobadas y conversaciones con el asistente iniciadas. Los datos se presentan en una vista de evolución temporal con granularidad configurable: diaria para períodos menores a 30 días, semanal para períodos entre 30 y 90 días, y mensual para períodos mayores a 90 días. Se incluye un KPI de retención calculado como el porcentaje de Usuarios que realizaron más de una sesión en el período. La información de Usuarios individuales no se expone en este reporte, solo métricas agregadas.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Accedo al reporte | Ver las métricas clave del período con su evolución temporal en un gráfico de líneas | - |
| El período seleccionado es menor a 30 días | Que la granularidad del gráfico sea diaria | - |
| El período seleccionado supera los 90 días | Que la granularidad cambie automáticamente a mensual | - |
| Comparo dos períodos consecutivos | Ver el porcentaje de variación de cada métrica respecto al período anterior | - |
| No hay actividad en el período seleccionado | Ver las métricas en cero con un mensaje indicando que no hubo actividad | - |
