# US-PAD-01: Dashboard General del Sistema

## Información General
- **Identificador:** US-PAD-01
- **Actor:** Administrador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema con rol de “Administrador”.
- **Historias de Usuario Relacionadas:** US-RYI-01, US-RYI-02

---

## Descripción General
**Como** Administrador  
**Quiero** visualizar un dashboard general del sistema  
**Para** monitorear los indicadores clave y el estado general de la plataforma.

---

## Descripción Funcional
El sistema proveerá un dashboard para mostrar las métricas relevantes del sistema, como: cantidad de Usuarios, itinerarios generados o POIs más visitados. El Administrador podrá visualizar las estadísticas de Usuarios, itinerarios y actividades, las cuales se actualizarán periódicamente y se visualizarán por medio de gráficos y tarjetas. Debe incluir un filtro de tiempo para los indicadores clave, por ejemplo: última semana, último mes, entre otros.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador accede a la ruta correspondiente al dashboard | Que el sistema muestre indicadores generales , métricas y gráficos | PADDashboardSistemaGUI |
| Existen métricas registradas | Que el sistema visualice un título claro de "Dashboard General" seguido de los gráficos y estadísticas actualizadas. Entre estos datos debe existir un selector de fechas (dropdown o date picker) que diga "Últimos 30 días", "Este año", etc. Al cambiar esto, toda la pantalla hace un re-fetch de datos. | - |
| El Administrador accede a la ruta correspondiente al dashboard | Que el sistema muestre las siguientes tarjetas KPIs: Total de Usuarios (filtrando por fechaAlta y sin fechaBaja), Itinerarios Activos/Generados (total con EstadoItinerario "Activo"), POIs validados (total con EstadoPOI "Aprobado"), Reseñas pendientes de moderación (total con EstadoReseña "Pendiente"). | - |
| El Administrador accede a la ruta correspondiente al dashboard | Que el sistema muestre los siguientes gráficos: Gráfico de barras para crecimiento de Usuarios (agrupado por fechaAlta), Ranking top 5 POIs más visitados/guardados (gráfico de torta). | - |
| El Administrador interactúa con gráficos | Que pueda visualizar detalles adicionales | - |
| El Administrador espera que cargue la ruta correspondiente al dashboard | Que el sistema muestre un spinner con un mensaje “Cargando…” mientras se obtienen los datos del backend | - |
| El Administrador selecciona un nuevo rango temporal en el filtro global | Que los componentes visuales (tarjetas numéricas y gráficos) se actualicen dinámicamente para reflejar los datos de ese período específico, sin necesidad de recargar la página completa. | - |
| El Administrador realiza la consulta para un período temporal en el que no hubo actividad | Que las tarjetas de KPIs muestran el valor "0" y que los gráficos muestran un diseño de estado vacío con un mensaje que indique "No hay datos registrados en este período" | - |
| Ocurre un error al intentar recuperar los datos desde el backend | Que el sistema indique un mensaje de error temporal "No se pudieron cargar las métricas. Intente nuevamente." acompañado de un botón de “Reintentar” para volver a ejecutar la petición | - |
