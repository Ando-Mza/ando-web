# US-GIT-07: Validación de Contenido

## Información General
*   **Identificador:** US-GIT-07
*   **Actor:** Administrador
*   **Puntos de Historia:** 5
*   **Precondiciones:**
    *   El Administrador debe estar autenticado con rol de Administrador.
*   **Historias de Usuario Relacionadas:** US-GIT-01, US-CYN-02, US-RYV-07

---

## Descripción General
Como Administrador del sistema,
quiero revisar, aprobar o rechazar los puntos de interés y contenidos cargados por usuarios o prestadores turísticos,
para garantizar la calidad, veracidad y consistencia de la información publicada en la plataforma.

---

## Descripción Funcional
Cuando un usuario o prestador registra un nuevo Punto de Interés (POI) o modifica información existente, el contenido no será publicado inmediatamente. El sistema lo almacenará en estado *Pendiente de Validación* y quedará disponible para revisión desde el panel administrativo.

El administrador podrá consultar el detalle del contenido enviado, visualizar la información asociada y decidir entre:
1.  **Aprobar** el contenido (lo publica en el catálogo público).
2.  **Rechazar** el contenido (solicita el motivo del rechazo y notifica al creador).
3.  **Solicitar Correcciones** (indica observaciones y permite al creador editarlo).

Una vez aprobado, el contenido pasará a formar parte del catálogo público y podrá ser utilizado por los motores de búsqueda, recomendación e itinerarios. Toda acción debe ser auditada por el sistema.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador accede al módulo de validación | Visualizar una lista de contenidos pendientes de validación con: nombre de POI, categoría, usuario o prestador que realizó la carga, fecha de creación y estado actual | Panel de Validación de Contenidos |
| El Administrador solicita ver el detalle de un contenido pendiente | El sistema muestra: nombre, descripción, categoría, ubicación, imágenes, contacto y observaciones automáticas, junto a los botones “Aceptar”, “Rechazar” y “Solicitar Corrección” | Detalle de Validación |
| El Administrador selecciona “Aprobar” | Que se cambie el estado del POI a “Aprobado”, se publique en el catálogo y se registre la fecha y el administrador que realizó la validación | Detalle de Validación |
| El Administrador selecciona “Rechazar” | Que se solicite el motivo del rechazo, se guarde como “Rechazado”, se registre la observación en el historial y se notifique al responsable | Modal de Motivo de Rechazo |
| El Administrador selecciona “Solicitar corrección” | Que el sistema permita ingresar observaciones, cambie el estado del POI a “Corrección Solicitada” y notifique al responsable para que actualice la información | Modal de Observaciones |
| El POI se encuentra en estado “Pendiente de Validación”, “Rechazado” o “Corrección Solicitada” | Que el sistema excluya el contenido de las búsquedas, mapa, recomendaciones e itinerarios generados por la IA | Toda la Aplicación |
| El Administrador aprueba, rechace o realice una solicitud de corrección | Que el sistema audite detalladamente la acción en los logs del panel de administración | Logs de Auditoría |
