# US-AYT-01: Visualización de LOGs

## Información General
- **Identificador:** US-AYT-01
- **Actor:** Administrador
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El Administrador debe estar autenticado con rol de Administrador.
  - El servidor debe haber generado al menos un archivo de log.
- **Historias de Usuario Relacionadas:** US-ACC-03, US-GDU-03, US-PAD-01, US-PAD-03, US-GIT-07, US-PAD-03, US-CYP-01, US-CYP-03, US-CYP-04, US-CYP-07

---

## Descripción General
**Como** Administrador  
**Quiero** visualizar y filtrar los logs de actividad del sistema  
**Para** poder auditar el comportamiento del sistema, detectar errores, rastrear acciones de Usuarios y garantizar la trazabilidad de los eventos ocurridos en la plataforma.

---

## Descripción Funcional
El Administrador accede a la sección "Auditoría y Trazabilidad" dentro del panel de administración. El sistema consulta los archivos de log generados por el servidor Nest.js los cuales están persistidos en la clase AuditoriaLog en nuestra base de datos y los presenta en una vista estructurada y paginada, ordenados por defecto del más reciente al más antiguo. Cada registro de log muestra: fecha y hora del evento, tipo de evento (acción de Usuario, error del sistema, cambio en POI o login fallido), descripción del evento, y el Usuario involucrado si aplica. El Administrador puede aplicar filtros combinables para acotar los resultados: por rango de fechas, por tipo de evento y por Usuario. Al aplicar los filtros, el sistema actualiza la lista mostrando únicamente los registros que cumplan con los criterios seleccionados. Los logs son de solo lectura: el Administrador no puede editarlos ni eliminarlos desde la interfaz.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador accede a la sección de auditoría sin aplicar filtros | El sistema muestra todos los logs disponibles ordenados del más reciente al más antiguo, paginados de a 50 registros | - |
| El Administrador filtra por rango de fechas | El sistema muestra únicamente los logs generados dentro del rango seleccionado | - |
| El Administrador filtra por tipo de evento (ej: "login fallido") | El sistema muestra únicamente los registros correspondientes a ese tipo de evento | - |
| El Administrador filtra por Usuario | El sistema muestra únicamente los logs asociados a ese Usuario | - |
| El Administrador aplica múltiples filtros simultáneamente | El sistema combina todos los filtros activos y muestra solo los registros que cumplen con todos ellos | - |
| No existen logs para los filtros aplicados | El sistema muestra el mensaje "No se encontraron registros para los filtros seleccionados" | - |
| El servidor no tiene archivos de log disponibles | El sistema muestra el mensaje "No hay registros de actividad disponibles en este momento" | - |
| Un Usuario sin rol de Administrador intenta acceder a la sección de auditoría | El sistema deniega el acceso y redirige al inicio con el mensaje "No tenés permisos para acceder a esta sección" | - |
