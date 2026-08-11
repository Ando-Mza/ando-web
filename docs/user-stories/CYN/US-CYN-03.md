# Historia de Usuario

## Identificación

**US-CYN-03**

## Actor

**Prestador**

## Descripción General

**Como** Prestador  
**Quiero** gestionar los servicios ofrecidos por mi negocio turístico  
**Para** mantener actualizada la información visible para los Turistas y permitir que el sistema recomiende mi negocio según sus intereses, presupuesto y necesidades.

## Descripción Funcional

El sistema debe permitir que el Prestador administre los servicios asociados a un negocio turístico previamente registrado. Desde el panel de gestión del negocio, el Prestador podrá crear, visualizar, modificar, activar, desactivar o eliminar servicios ofrecidos, indicando información como nombre del servicio, descripción, categoría, precio estimado, duración, capacidad máxima, condiciones de contratación y estado de disponibilidad.

Los servicios cargados quedarán vinculados al negocio correspondiente y podrán visualizarse en el perfil público del negocio una vez que la información se encuentre aprobada o validada según las reglas de la plataforma. Esta información también podrá ser utilizada por el motor de recomendación, filtros de búsqueda e itinerarios para sugerir opciones acordes al presupuesto, intereses y disponibilidad del Turista.

## Puntos de Historia

**5**

## Precondiciones

- El Prestador debe estar autenticado en el sistema.
- El Prestador debe tener una cuenta activa y validada.
- El Prestador debe tener al menos un negocio turístico registrado en el sistema.
- El negocio debe pertenecer al Prestador que intenta gestionarlo.

## US Relacionada

- US-ACC-02
- US-ACC-03
- US-CYN-02
- US-CYN-05
- US-GIT-05
- US-GIT-08
- US-MRIA-02
- US-MRIA-07
- US-MRIA-09
- US-PAD-02

## Criterios de Aceptación

- Cuando el Prestador accede al módulo **"Mis Negocios"** y selecciona un negocio, Espero que el sistema muestre la opción **"Gestionar Servicios"**.
- Cuando el Prestador ingresa a **"Gestionar Servicios"**, Espero que el sistema muestre el listado de servicios asociados al negocio, indicando nombre, precio, duración, estado y disponibilidad.
- Cuando el Prestador selecciona **"Agregar Servicio"**, Espero que el sistema muestre un formulario para cargar los datos del nuevo servicio.
- Cuando el Prestador completa correctamente los campos obligatorios del servicio, Espero que el sistema habilite el botón **"Guardar Servicio"**.
- Cuando el Prestador deja campos obligatorios vacíos, Espero que el sistema indique los campos faltantes y mantenga bloqueado el botón **"Guardar Servicio"**.
- Cuando el Prestador ingresa un precio menor a cero, Espero que el sistema muestre el mensaje **"El precio del servicio no puede ser negativo"** y no permita guardar.
- Cuando el Prestador ingresa una duración inválida o igual a cero, Espero que el sistema muestre el mensaje **"La duración del servicio debe ser mayor a cero"**.
- Cuando el Prestador guarda correctamente un nuevo servicio, Espero que el sistema registre el servicio asociado al negocio y muestre el mensaje **"Servicio guardado correctamente"**.
- Cuando el Prestador modifica la información de un servicio existente, Espero que el sistema actualice los datos y muestre el mensaje **"Servicio actualizado correctamente"**.
- Cuando el Prestador desactiva un servicio, Espero que el sistema deje de mostrar ese servicio en el perfil público del negocio y en las recomendaciones.
- Cuando el Prestador vuelve a activar un servicio desactivado, Espero que el sistema permita que el servicio vuelva a estar visible y disponible para búsquedas y recomendaciones.
- Cuando el Prestador intenta eliminar un servicio, Espero que el sistema muestre un cartel de confirmación indicando **"¿Está seguro que desea eliminar este servicio?"**.
- Cuando el Prestador confirma la eliminación del servicio, Espero que el sistema elimine o dé de baja lógicamente el servicio y muestre el mensaje **"Servicio eliminado correctamente"**.
- Cuando el Prestador cancela la eliminación del servicio, Espero que el sistema conserve el servicio sin cambios y muestre el mensaje **"Operación cancelada"**.
- Cuando un Administrador revisa el negocio desde el panel administrativo, Espero que el sistema permita visualizar los servicios cargados para tareas de control y validación.
