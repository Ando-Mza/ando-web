# US-CYN-05: Validación Formal por Admin

## Información General
- **Identificador:** US-CYN-05
- **Actor:** Administrador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Administrador debe estar autenticado en el sistema.
  - El Administrador debe tener permisos para acceder al panel de validaciones.
  - Debe existir al menos un POI o negocio en estado “Pendiente de validación formal”, “Validado por la comunidad” u “Observado por la comunidad”.
- **Historias de Usuario Relacionadas:** US-ACC-03, US-CYN-01, US-CYN-02, US-CYN-04, US-CYN-08, US-GIT-07, US-NYA-05, US-PAD-05, US-AYT-01

---

## Descripción General
**Como** Administrador  
**Quiero** revisar y validar formalmente los POIs o negocios turísticos propuestos por la comunidad o por Prestadores  
**Para** asegurar que la información publicada en Ando sea confiable, correcta y adecuada antes de aparecer en el catálogo público.

---

## Descripción Funcional
El sistema debe permitir que el Administrador revise los POIs o negocios turísticos que se encuentren pendientes de validación formal. Estos pueden provenir de altas comunitarias realizadas por Turistas, negocios creados por Prestadores o POIs que hayan sido validados previamente por la comunidad.
Desde el panel administrativo, el Administrador podrá visualizar el listado de elementos pendientes, acceder al detalle completo de cada registro y decidir si aprueba, rechaza o solicita correcciones. Para tomar esta decisión podrá revisar datos como nombre, descripción, categoría, ubicación, imágenes, horarios, servicios asociados, reportes comunitarios y cantidad de validaciones recibidas.
Cuando el Administrador aprueba un POI o negocio, este pasa a estado “Aprobado” y queda disponible en el catálogo público, mapa, búsquedas, recomendaciones e itinerarios. Si lo rechaza, el sistema debe solicitar un motivo y notificar al Usuario o Prestador responsable. Si solicita correcciones, el registro queda pendiente de edición por parte del responsable antes de volver a revisión. Todas las acciones realizadas por el Administrador deben quedar registradas para asegurar trazabilidad.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador accede al panel de validaciones | Que el sistema muestre el listado de POIs y negocios pendientes de validación formal | - |
| El Administrador visualiza el listado de pendientes | Que el sistema muestre nombre, tipo de registro, categoría, Usuario responsable, fecha de carga, estado actual y cantidad de validaciones o reportes comunitarios | - |
| El Administrador selecciona un POI o negocio pendiente | Que el sistema muestre el detalle completo del registro | - |
| El Administrador consulta el detalle del registro | Que el sistema muestre nombre, descripción, categoría, ubicación geográfica, imágenes, horarios, servicios asociados, datos de contacto y observaciones comunitarias | - |
| El Administrador revisa un POI validado por la comunidad | Que el sistema muestre la cantidad de validaciones positivas recibidas y los Usuarios que participaron en la validación | - |
| El Administrador revisa un POI observado por la comunidad | Que el sistema muestre los reportes recibidos, sus motivos y la cantidad de Usuarios que reportaron inconsistencias | - |
| El Administrador considera que la información es correcta y selecciona “Aprobar” | Que el sistema cambie el estado del POI o negocio a “Aprobado” | - |
| El Administrador aprueba un POI o negocio | Que el sistema publique el contenido en el catálogo, mapa, búsquedas, recomendaciones e itinerarios | - |
| El Administrador aprueba un negocio cargado por un Prestador | Que el sistema notifique al Prestador que su negocio fue aprobado | - |
| El Administrador considera que la información es incorrecta y selecciona “Rechazar” | Que el sistema solicite ingresar el motivo del rechazo antes de confirmar la acción | - |
| El Administrador confirma el rechazo | Que el sistema cambie el estado del registro a “Rechazado” y notifique al Usuario o Prestador responsable | - |
| El Administrador detecta errores menores y selecciona “Solicitar corrección” | Que el sistema permita ingresar observaciones sobre los datos que deben modificarse | - |
| El Administrador confirma la solicitud de corrección | Que el sistema cambie el estado a “Corrección solicitada” y notifique al responsable | - |
| El Usuario o Prestador responsable corrige la información solicitada | Que el sistema vuelva a dejar el registro en estado “Pendiente de validación formal” | - |
| El POI o negocio se encuentra en estado “Pendiente”, “Rechazado” o “Corrección solicitada” | Que el sistema no lo muestre en el catálogo público, mapa, recomendaciones ni itinerarios | - |
| El Administrador aprueba, rechaza o solicita corrección | Que el sistema registre la acción realizada, fecha, hora, Administrador responsable y observación asociada | - |
| El Administrador intenta aprobar un registro con datos obligatorios incompletos | Que el sistema bloquee la aprobación y muestre el mensaje “No se puede aprobar un registro con información obligatoria incompleta” | - |
| El Administrador cancela una acción de aprobación, rechazo o corrección | Que el sistema conserve el estado actual del registro y muestre el mensaje “Operación cancelada” | - |
