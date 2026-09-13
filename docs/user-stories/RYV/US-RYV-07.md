# US-RYV-07: Detección de Anomalías en Valoraciones

## Información General
- **Identificador:** US-RYV-07
- **Actor:** Administrador
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Administrador debe estar autenticado con rol de Administrador.
  - Deben existir valoraciones registradas en la tabla Valoracion.
  - Deben existir reseñas registradas en la tabla Reseña con al menos un EstadoReseña configurado.
  - Deben existir reglas de detección de anomalías configuradas en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-03, US-RYV-01, US-RYV-02, US-RYV-05, US-PAD-03, US-PAD-06, US-AYT-01

---

## Descripción General
**Como** Administrador  
**Quiero** que el sistema detecte automáticamente patrones anómalos en las valoraciones de los POIs  
**Para** identificar posibles casos de manipulación, fraude o comportamiento inusual que afecten la confiabilidad de las puntuaciones publicadas en la plataforma.

---

## Descripción Funcional
El sistema monitorea de forma continua las valoraciones registradas en las tablas Valoracion y Reseña, aplicando reglas de detección configurables que identifican comportamientos sospechosos. Entre los patrones monitoreados se incluyen: múltiples valoraciones de un mismo Usuario sobre el mismo POI en un período corto, incrementos o caídas abruptas en el puntuacionPromedio de un POI en un intervalo de tiempo reducido, concentración inusual de valoraciones máximas o mínimas (1 o 5 estrellas) provenientes de Usuarios con poca actividad en la plataforma, y valoraciones realizadas por Usuarios sin itinerarios finalizados que incluyan el POI valorado.
Cuando el sistema detecta una anomalía, genera un registro en la tabla AuditoriaLog con el detalle del patrón identificado, actualiza el campo estadoReseñaId de los registros involucrados a "Pendiente de revisión" y genera una notificación en la tabla Notificacion dirigida al Administrador. Desde el panel administrativo, el Administrador puede visualizar el listado de anomalías detectadas, revisar el detalle de cada caso y decidir entre aprobar las valoraciones como legítimas, eliminarlas por considerarlas fraudulentas o escalar el caso para una revisión más profunda. Toda acción realizada por el Administrador queda registrada en AuditoriaLog.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Un mismo Usuario registra más de una valoración sobre el mismo POI en un período de tiempo inferior al umbral configurado | Que el sistema detecte el patrón, marque las valoraciones involucradas con estado "Pendiente de revisión" en EstadoReseña, registre el evento en AuditoriaLog con el detalle del patrón identificado y genere una notificación al Administrador | - |
| El puntuacionPromedio de un POI incrementa o cae de forma abrupta en un intervalo de tiempo reducido | Que el sistema identifique el cambio como anómalo, registre el evento en AuditoriaLog indicando el valor anterior, el valor nuevo y el intervalo de tiempo en que ocurrió el cambio, y notifique al Administrador para su revisión | - |
| Se detecta una concentración inusual de valoraciones de 1 o 5 estrellas provenientes de Usuarios con escasa actividad en la plataforma sobre un mismo POI | Que el sistema marque el conjunto de valoraciones como sospechoso, las establezca en estado "Pendiente de revisión" y registre el patrón en AuditoriaLog con el detalle de los Usuarios y valoraciones involucrados | - |
| Se registra una valoración sobre un POI por parte de un Usuario que no tiene ningún itinerario finalizado que incluya dicho POI | Que el sistema marque la valoración como sospechosa, la establezca en estado "Pendiente de revisión" y la incluya en el listado de anomalías para revisión del Administrador | - |
| El Administrador accede al módulo de detección de anomalías | Que el sistema muestre el listado de anomalías detectadas ordenadas por fecha de detección descendente, incluyendo para cada caso el POI afectado, el tipo de patrón detectado, la cantidad de valoraciones involucradas y el estado actual de revisión | - |
| El Administrador selecciona una anomalía del listado para revisar su detalle | Que el sistema muestre el detalle completo del caso incluyendo las valoraciones y reseñas involucradas, los Usuarios responsables, el historial de actividad de esos Usuarios en la plataforma y el patrón específico que activó la detección | - |
| El Administrador decide aprobar las valoraciones involucradas en una anomalía como legítimas | Que el sistema actualice el estadoReseñaId de los registros afectados a su estado aprobado correspondiente, recalcule el puntuacionPromedio del POI en la tabla POI incluyendo dichas valoraciones, registre la acción en AuditoriaLog con fecha y Administrador responsable, y retire el caso del listado de anomalías pendientes | - |
| El Administrador decide eliminar las valoraciones involucradas por considerarlas fraudulentas | Que el sistema elimine los registros de Valoracion y Reseña afectados, recalcule el puntuacionPromedio y cantidadReseñas del POI en la tabla POI excluyendo dichas valoraciones, notifique a los Usuarios responsables indicando el motivo de la eliminación mediante un registro en Notificacion, y registre la acción completa en AuditoriaLog | - |
| El Administrador elimina valoraciones fraudulentas y el POI queda sin ninguna valoración vigente | Que el sistema establezca puntuacionPromedio en null y cantidadReseñas en 0 en la tabla POI, y muestre el mensaje "Sin valoraciones disponibles" en el perfil público del lugar | - |
| El sistema detecta una anomalía pero el POI afectado fue dado de baja | Que el sistema mantenga el caso en el listado de anomalías indicando que el POI ya no se encuentra activo, permitiendo al Administrador igualmente revisar y resolver el caso para mantener la trazabilidad | - |
| Un Usuario sin rol de Administrador intenta acceder al módulo de detección de anomalías | Que el sistema deniegue el acceso y redirija al inicio con el mensaje "No tenés permisos para acceder a esta sección" | - |
