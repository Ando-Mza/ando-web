# US-CYN-07: Respuesta a Reseñas por Prestador

## Información General
- **Identificador:** US-CYN-07
- **Actor:** Prestador
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El Prestador debe estar autenticado y vinculado a la organización del POI correspondiente.
  - Debe existir una reseña previa validada.
- **Historias de Usuario Relacionadas:** US-RYV-02, US-NYA-06, US-PAD-04

---

## Descripción General
**Como** Prestador  
**Quiero** redactar una respuesta pública a las reseñas que los Turistas publican sobre mi negocio  
**Para** interactuar con la comunidad, agradecer los comentarios positivos o dar soporte ante experiencias negativas.

---

## Descripción Funcional
El sistema debe proveer una interfaz dentro del panel del Prestador que liste las reseñas recibidas en su POI. Al seleccionar una reseña que no tenga una respuesta previa, se habilitará un área de texto libre (máximo 1000 caracteres). Al presionar "Publicar Respuesta", el sistema validará que el campo no esté vacío y creará un nuevo registro en la tabla ReseñaRespuesta. Una vez persistido, la respuesta se renderiza inmediatamente debajo de la reseña original en la vista pública del Turista.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador ingresa a la sección de opiniones de su panel de control | Que el sistema liste todas las reseñas asociadas a su POI, ordenadas cronológicamente desde las más recientes hasta las más antiguas. Además se debe visualizar gráficamente las reseñas que se encuentran “Pendientes de responder” | - |
| El Prestador redacta una respuesta válida y presiona el botón "Publicar" | Que el sistema inserte el registro en la tabla ReseñaRespuesta, limpie el formulario, marque la reseña original como "Respondida" y muestre un aviso de éxito "Tu respuesta se ha publicado correctamente" | - |
| El Prestador intenta enviar una respuesta dejando el campo de texto vacío | Que el sistema mantenga el botón inhabilitado. | - |
| Un Turista visita el detalle del negocio o POI que recibió la respuesta | Que el sistema traiga la información de las tablas Reseña y ReseñaRespuesta de forma anidada, renderizando la aclaración del Prestador justo debajo del comentario del Turista, con una etiqueta que indique "Respuesta del propietario" | - |
