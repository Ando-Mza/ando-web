# US-PAD-02: Dashboard del Prestador

## Información General
- **Identificador:** US-PAD-02
- **Actor:** Prestador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
  - El Usuario debe tener una sesión activa con rol de “Prestador”.
- **Historias de Usuario Relacionadas:** US-CYN-02, US-CYN-03

---

## Descripción General
**Como** Prestador  
**Quiero** visualizar el dashboard de mi negocio  
**Para** monitorear las métricas de rendimiento, interacciones y alcance de mi negocio en la plataforma Ando.

---

## Descripción Funcional
El sistema mostrará un panel de control donde el Prestador podrá ver tarjetas de KPIs y gráficos sobre su negocio. Lo que le permitirá monitorear el rendimiento en la plataforma de todos los POIs a los que se encuentre relacionado.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador accede a la ruta donde se encuentra el dashboard | Que el sistema visualice un título claro de "Dashboard" seguido de los gráficos y estadísticas actualizadas. Entre estos datos debe existir un selector de fechas ("Últimos 30 días", "Este año") y un selector de “Mis Puntos de Interés”. | PADDashboardNegocioGUI |
| El Prestador accede a la ruta donde se encuentra el dashboard | Que el sistema muestre indicadores de su negocio: Cantidad de visitas exitosas, Cantidad de guardados (favoritos), Puntuación promedio y cantidad de reseñas. Gráficos: Distribución de calificaciones (torta), Últimas reseñas (lista rápida de 3-5), Visitas en el tiempo (líneas). | - |
| Existen estadísticas registradas | Que el sistema visualice métricas actualizadas | - |
| El Prestador interactúa con gráficos | Que pueda visualizar información detallada | - |
| El Prestador accede a la ruta donde se encuentra el dashboard | Que el sistema le permita visualizar las métricas de todos los negocios. Debe existir un selector o filtro bajo el nombre “Mis Puntos de Interés” que muestre por defecto el de mayor reputación y permite cambiar la vista tras seleccionar otro. | - |
| El Prestador tiene múltiples negocios y selecciona uno específico desde el desplegable | Que las tarjetas y gráficos se actualicen sin recargar la página para mostrar únicamente las métricas de ese POI en particular. | - |
| El Prestador acaba de dar de alta un POI y aún no tiene visitas, reseñas o favoritos | Que el dashboard no muestre errores. Las tarjetas deben marcar "0" y los gráficos deben mostrar el mensaje "¡Tu negocio ya está visible! Pronto empezarás a ver estadísticas de los Turistas aquí" | - |
| El Prestador selecciona el desplegable | Que el sistema muestre como opciones solo los POI que tiene asociado | - |
