# Historia de Usuario

## Identificación

**US-CYN-07**

## Actor

**Prestador**

## Descripción General

**Como** Prestador  
**Quiero** redactar una respuesta pública a las reseñas que los Turistas publican sobre mi negocio  
**Para** interactuar con la comunidad, agradecer los comentarios positivos o dar soporte ante experiencias negativas.

## Descripción Funcional

El sistema debe proveer una interfaz dentro del panel del Prestador que liste las reseñas recibidas en su POI. Al seleccionar una reseña que no tenga una respuesta previa, se habilitará un área de texto libre (máximo 1000 caracteres).

Al presionar "Publicar Respuesta", el sistema validará que el campo no esté vacío y creará un nuevo registro en la tabla ReseñaRespuesta. Una vez persistido, la respuesta se renderiza inmediatamente debajo de la reseña original en la vista pública del Turista.

## Puntos de Historia

**3**

## Precondiciones

- El Prestador debe estar autenticado y vinculado a la organización del POI correspondiente.
- Debe existir una reseña previa validada.

## US Relacionada

- US-RYV-02
- US-NYA-06
- US-PAD-04

## Criterios de Aceptación

- Cuando el Prestador ingresa a la sección de opiniones de su panel de control, Espero que el sistema liste todas las reseñas asociadas a su POI, ordenadas cronológicamente desde las más recientes hasta las más antiguas. Además se debe visualizar gráficamente las reseñas que se encuentran **"Pendientes de responder"**.
- Cuando el Prestador redacta una respuesta válida y presiona el botón **"Publicar"**, Espero que el sistema inserte el registro en la tabla ReseñaRespuesta, limpie el formulario, marque la reseña original como **"Respondida"** y muestre un aviso de éxito **"Tu respuesta se ha publicado correctamente"**.
- Cuando el Prestador intenta enviar una respuesta dejando el campo de texto vacío, Espero que el sistema mantenga el botón inhabilitado y muestre un mensaje de advertencia inline: **"La respuesta no puede estar vacía"**.
- Cuando un Turista visita el detalle del negocio o POI que recibió la respuesta, Espero que el sistema traiga la información de las tablas Reseña y ReseñaRespuesta de forma anidada, renderizando la aclaración del Prestador justo debajo del comentario del Turista, con una etiqueta que indique **"Respuesta del propietario"**.
