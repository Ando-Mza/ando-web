# US-PAD-03: Moderación de Contenido

## Información General
- **Identificador:** US-PAD-03
- **Actor:** Administrador
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema con rol de Administrador.
  - Debe existir al menos un reporte de contenido o un caso generado automáticamente pendiente de revisión.
  - El módulo de Inteligencia Artificial debe encontrarse disponible para la generación automática de casos de moderación.
- **Historias de Usuario Relacionadas:** US-CYN-08, US-RYV-02, US-CYN-07, US-GDU-03, US-AYT-01

---

## Descripción General
**Como** Administrador  
**Quiero** revisar y moderar contenido reportado por los turistas o detectado automáticamente por Inteligencia Artificial  
**Para** garantizar que el contenido publicado en la plataforma cumpla con las políticas de uso y mantenga un entorno apropiado, confiable y respetuoso.

---

## Descripción Funcional
El sistema proveerá al Administrador una “bandeja de entrada” de Moderación de Contenido que centralizará los casos pendientes de revisión. Los casos de moderación podrán generarse mediante dos mecanismos:
- Reporte de Usuario: generado cuando un Usuario denuncia contenido
- Detección automática: generado cuando el módulo de Inteligencia Artificial detecta contenido potencialmente inapropiado en una reseña o en un comentario/respuesta asociado a una reseña.

Para los casos originados mediante un Reporte de Usuario, el sistema mostrará al Administrador quién realizó el reporte, qué contenido fue reportado, el motivo indicado, la fecha de creación y el estado actual del reporte.
Para los casos generados automáticamente, el sistema deberá indicar como origen “Detectado por IA”, sin asociar un Usuario reportante.
Desde la bandeja de moderación, el Administrador podrá visualizar el contenido original y resolver cada caso mediante: desestimar (el contenido permanece), confirmar infracción (deja de ser visible), u ocultar/eliminar notificando al Usuario responsable.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador ingresa a la sección de Moderación de Contenido | Que el sistema muestre una tabla ordenada por fecha (las más antiguas sin resolver primero) que muestre: Tipo de contenido, Motivo del reporte, Fecha del reporte y Estado actual ("Pendiente"). | - |
| El Administrador revisa un contenido reportado, verifica que infringe las normas, hace clic en "Eliminar Contenido" y confirma la acción | Que el sistema actualice el estado del reporte a "Resuelto", modifique el estado del contenido original (ej. pase la Reseña a estado "Rechazada/Oculta"), y que dicho contenido deje de ser visible inmediatamente para los Turistas en la plataforma. | - |
| El Administrador determina que el contenido no infringe las normas y selecciona "Desestimar Reporte" | Que el estado del reporte cambie a "Resuelto/Desestimado", pero que el contenido original mantenga su estado "Aprobado" y siga visible en la plataforma, sin afectar al Usuario que lo creó. | - |
| El Administrador resuelve un reporte grave (ej. spam recurrente) y decide penalizar al autor | Que desde la misma vista de moderación exista un atajo ("Suspender Usuario autor") que ejecute la lógica de baja lógica de la cuenta, sin obligar al Admin a navegar hasta la pantalla de Gestión de Usuarios. | - |
| La cantidad de reportes es muy alta y el Administrador utiliza los filtros de la barra superior | Que el sistema filtre la vista por: "Entidad" (Solo reseñas, Solo imágenes) y por "Estado del reporte" (Pendientes, Resueltos), actualizando la lista en tiempo real según el filtro utilizado. | - |
| El Administrador selecciona “Ver más” en una fila de reporte | Que el sistema muestre en un modal los datos del reporte (fechaCreación, Usuario, Entidad Reportada, código) y botones de acción: Desestimar Reporte, Eliminar Reporte, Verificar Reporte. | - |
| El Administrador filtre por Estado Reseña (Pendiente/Resuelto) | Que el sistema actualice dinámicamente la tabla. | - |
| El Administrador confirme el contenido de la reseña | Que se actualice el estado de la reseña pasando de "pendiente" a "resuelto". | - |
| El Administrador aprueba la eliminación de una reseña | Que el sistema cambie el estado de la misma "rechazado/oculto" y se actualice la información dinámicamente en la tabla. | - |
| El Administrador modifique una tarjeta de reporte | Que se inserte un LOG detallando: acción: 'MODERATE', entidad: 'Reseña', entidad Id: id, detalle: 'Reporte válido, contenido oculto'. | - |
| El Administrador selecciona una tarjeta de reporte | Que el sistema muestre un modal con la toda la información del reporte. | - |
| El Administrador selecciona un registro de la tabla de reportes | Que el sistema muestre un recuadro rojo/naranja destacando el motivo de la denuncia y quién la hizo. | - |
| El Administrador filtra por origen | Que el sistema permita visualizar únicamente casos provenientes de “Reporte de Usuario” o “Detectado por IA”. | - |
