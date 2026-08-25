# US-CYN-03: Gestión de Servicios del Negocio

## Información General
- **Identificador:** US-CYN-03
- **Actor:** Prestador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Prestador debe estar autenticado en el sistema.
  - El Prestador debe tener una cuenta activa y validada.
  - El Prestador debe tener al menos un negocio turístico registrado en el sistema.
  - El negocio debe pertenecer al Prestador que intenta gestionarlo.
- **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-CYN-02, US-CYN-05, US-GIT-05, US-GIT-08, US-MRIA-02, US-MRIA-07, US-MRIA-09, US-PAD-02

---

## Descripción General
**Como** Prestador  
**Quiero** gestionar los servicios ofrecidos por mi negocio turístico  
**Para** mantener actualizada la información visible para los Turistas y permitir que el sistema recomiende mi negocio según sus intereses, presupuesto y necesidades.

---

## Descripción Funcional
El sistema debe permitir que el Prestador administre los servicios asociados a un negocio turístico previamente registrado. Desde el panel de gestión del negocio, el Prestador podrá crear, visualizar, modificar, activar, desactivar o eliminar servicios ofrecidos, indicando información como nombre del servicio, descripción, categoría, precio estimado, duración, capacidad máxima, condiciones de contratación y estado de disponibilidad.
Los servicios cargados quedarán vinculados al negocio correspondiente y podrán visualizarse en el perfil público del negocio una vez que la información se encuentre aprobada o validada según las reglas de la plataforma. Esta información también podrá ser utilizada por el motor de recomendación, filtros de búsqueda e itinerarios para sugerir opciones acordes al presupuesto, intereses y disponibilidad del Turista.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador accede al módulo “Mis Negocios” y selecciona un negocio | Que el sistema muestre la opción “Gestionar Servicios” | - |
| El Prestador ingresa a “Gestionar Servicios” | Que el sistema muestre el listado de servicios asociados al negocio, indicando nombre, precio, duración, estado y disponibilidad | - |
| El Prestador selecciona “Agregar Servicio” | Que el sistema muestre un formulario para cargar los datos del nuevo servicio | - |
| El Prestador completa correctamente los campos obligatorios del servicio | Que el sistema habilite el botón “Guardar Servicio” | - |
| El Prestador deja campos obligatorios vacíos | Que el sistema indique los campos faltantes y mantenga bloqueado el botón “Guardar Servicio” | - |
| El Prestador ingresa un precio menor a cero | Que el sistema muestre el mensaje “El precio del servicio no puede ser negativo” y no permita guardar | - |
| El Prestador ingresa una duración inválida o igual a cero | Que el sistema muestre el mensaje “La duración del servicio debe ser mayor a cero” | - |
| El Prestador guarda correctamente un nuevo servicio | Que el sistema registre el servicio asociado al negocio y muestre el mensaje “Servicio guardado correctamente” | - |
| El Prestador modifica la información de un servicio existente | Que el sistema actualice los datos y muestre el mensaje “Servicio actualizado correctamente” | - |
| El Prestador desactiva un servicio | Que el sistema deje de mostrar ese servicio en el perfil público del negocio y en las recomendaciones | - |
| El Prestador vuelve a activar un servicio desactivado | Que el sistema permita que el servicio vuelva a estar visible y disponible para búsquedas y recomendaciones | - |
| El Prestador intenta eliminar un servicio | Que el sistema muestre un cartel de confirmación indicando “¿Está seguro que desea eliminar este servicio?” | - |
| El Prestador confirma la eliminación del servicio | Que el sistema elimine o dé de baja lógicamente el servicio y muestre el mensaje “Servicio eliminado correctamente” | - |
| El Prestador cancela la eliminación del servicio | Que el sistema conserve el servicio sin cambios y muestre el mensaje “Operación cancelada” | - |
| Un Administrador revisa el negocio desde el panel administrativo | Que el sistema permita visualizar los servicios cargados para tareas de control y validación | - |
