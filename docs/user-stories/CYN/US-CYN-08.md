# US-CYN-08: Reporte de Contenido Incorrecto

## Información General
- **Identificador:** US-CYN-08
- **Actor:** Turista/Prestador
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El Usuario debe estar autenticado en el sistema.
  - La entidad que se desea reportar (POI y Reseña) debe existir y encontrarse disponible para el Usuario en la plataforma.
- **Historias de Usuario Relacionadas:** US-RYV-02, US-PAD-03, US-PAD-03

---

## Descripción General
**Como** Usuario autenticado  
**Quiero** reportar un POI o una reseña que contenga información incorrecta, desactualizada, ofensiva o inapropiada  
**Para** contribuir a mantener la información de la plataforma confiable y una comunidad segura.

---

## Descripción Funcional
El sistema debe permitir a cualquier Usuario con sesión activa iniciar una denuncia desde las interfaces de visualización pública. Al presionar el botón "Reportar", el sistema desplegará un formulario modal flotante. El Usuario deberá seleccionar el motivo del reporte desde un menú desplegable (mapeado al atributo motivo) y opcionalmente detallar la situación en un campo de texto libre. Antes de registrar el reporte, el sistema deberá validar que el contenido indicado exista. Cuando se valida que existe el registro se guardará en la tabla ReporteContenido estableciendo la fechaCreacion como fecha actual del reporte y asignando el estado “pendiente” al reporte.
El Usuario podrá iniciar un reporte desde el contenido que desea denunciar. Si el reporte se origina desde un POI, quedará asociado a dicho POI y se mostrarán los motivos correspondientes a POIs. Si se origina desde una Reseña, quedará asociado a dicha Reseña y se mostrarán los motivos correspondientes a Reseñas.
El reporte deberá quedar asociado tambien al Usuario autenticado que realiza la denuncia. El Usuario reportante será obtenido de la sesión activa y no podrá ser indicado o modificado manualmente desde el formulario.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Un Turista hace clic en "Reportar" sobre un POI | Que el sistema abra un modal interactivo bloqueando la pantalla de fondo, mostrando las opciones de reporte ("Lugar cerrado permanentemente", "Ubicación incorrecta", "Precios desactualizados", “Información incorrecta” y “Otro” ) y un cuadro de texto para la aclaración. | - |
| Un Turista hace clic en "Reportar" sobre una reseña de un POI | Que el sistema abra un modal interactivo bloqueando la pantalla de fondo, mostrando las opciones de reporte ("Contenido ofensivo o inapropiado ", "Información falsa o engañosa ", "Spam" y “Otro” ) y un cuadro de texto para la aclaración | - |
| El Usuario completa los datos requeridos y presiona "Enviar Reporte" de un POI | Que el sistema procese la solicitud y cree el registro en la tabla ReporteContenido con estado igual a 'pendiente' asociado al POI, tambien asociado al usuario autenticado que realizo la denuncia y cierre el modal. Automáticamente se mostrará el mensaje: "Gracias por tu reporte. El equipo de soporte lo revisará a la brevedad" | - |
| El Usuario completa los datos requeridos y presiona "Enviar Reporte" de una reseña | Que el sistema procese la solicitud y cree el registro en la tabla ReporteContenido con estado igual a 'pendiente' asociado al la reseña, tambien asociado al usuario autenticado que realizo la denuncia y cierre el modal. Automáticamente se mostrará el mensaje: "Gracias por tu reporte. El equipo de soporte lo revisará a la brevedad" | - |
| El Usuario intenta enviar el formulario sin seleccionar un motivo del listado | Que el sistema bloquee el envío a la base de datos, resalte el campo en rojo advirtiendo que es obligatorio y mantenga los comentarios escritos por el Usuario para que no los pierda. | - |
| El contenido indicado no existe | Que el sistema rechace la solicitud y no cree ningún reporte | - |
| El Usuario envía una aclaración | Que la aclaración quede asociada al reporte | - |
| El Usuario no ingresa una aclaración | Que pueda registrar igualmente el reporte | - |
| Un Usuario reporta una reseña ofensiva | Que se registre el reporte pendiente sin modificar ni eliminar automáticamente la reseña | - |
| Un Usuario sin sesión intenta reportar contenido | Que el sistema rechace la operación | - |
