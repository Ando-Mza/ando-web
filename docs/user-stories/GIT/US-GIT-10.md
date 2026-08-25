# US-GIT-10: Visualización de Ficha de POI para Turistas

## Información General
- **Identificador:** US-GIT-10
- **Actor:** Turista
- **Puntos de Historia:** 2
- **Precondiciones:**
  - El Turista debe estar autenticado en la plataforma.
  - El POI debe existir previamente en el sistema y encontrarse en estado "Aprobado".
- **Historias de Usuario Relacionadas:** US-ACC-01, US-GIT-04, US-GIT-06, US-GIT-09, US-GIT-10, US-CYN-05

---

## Descripción General
**Como** Turista  
**Quiero** visualizar la ficha de información detallada de un Punto de Interés (POI)  
**Para** informarme sobre el lugar, ver imágenes, calificaciones, horarios y decidir si agregarlo a mi itinerario o visitarlo.

---

## Descripción Funcional
Al interactuar con un POI en el mapa o en los resultados de búsqueda, el sistema debe permitir que el Turista acceda a una vista de detalle (ficha del POI).
Esta ficha deberá presentar información consolidada y formateada para el consumo público del Turista, incluyendo:
- Información general: Nombre, categoría, descripción, servicios y etiquetas asociadas (ej. "Pet Friendly").
- Ubicación: Dirección física, departamento, zona y coordenadas espaciales.
- Horarios: Estado actual (Abierto/Cerrado), horarios regulares semanales y vigencias (consumiendo lo definido en US-GIT-04).
- Multimedia: Galería de imágenes públicas asociadas al POI (cargadas por el Administrador o por el Prestador).
- Estadísticas y Reseñas: Puntuación promedio, cantidad total de opiniones y listado de reseñas con imágenes de otros turistas (según US-GIT-10).

El backend debe proveer un endpoint público para consultar estos datos y validar que el POI consultado se encuentre en estado "Aprobado". Si un Turista intenta acceder al detalle de un POI no aprobado (en estado pendiente, rechazado o en corrección), el sistema deberá retornar un error 404 (No Encontrado) por seguridad.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista selecciona un POI aprobado en el mapa o buscador | Que el sistema muestre la ficha del POI con toda su información consolidada (información de contacto, categorías, etiquetas, servicios, horarios, imágenes y opiniones). | - |
| El Turista intenta consultar un POI que no ha sido aprobado formalmente (estado pendiente, rechazado o en corrección) | Que el sistema devuelva un error "Lugar no encontrado" y no exponga ningún dato del mismo. | - |
| El Turista consulta la ficha del POI | Espero que las imágenes asociadas se visualicen en una galería deslizable y el estado operativo del negocio indique de manera dinámica si está "Abierto" o "Cerrado" respecto a la hora local actual. En el caso que este abierto debe indicar “Abierto. Cierra a las HH:MM”. De lo contrario, debe indicar “Cerrado. Próxima apertura: [Día y rango de atención]” | - |
| El Turista accede a la ficha de un POI | Que pueda escribir una reseña sobre el mismo | - |
| El Turista accede a la ficha de un POI y no tiene reseñas | Que el sistema informe mediante la puntuación de estrellas y que aparezca un mensaje que indique “Sé el primero en dejar una reseña para este lugar” | - |
| El Turista accede a la galería de fotos del POI | Que el sistema distinga entre las que fueron subidas por el prestador de las que fueron subidas por Turistas por medio de reseñas mediante las etiquetas: Prestador / Externo | - |
| El Turista acceda a una foto de la galería | Que se muestre una vista previa que permita ampliarla, ver el número de imagen y deslizar para navegar entre fotos | - |
| El Turista acceda a la sección de “Reseñas Turísticas” y seleccione “Ver todas” | Que el sistema muestre todas las reseñas del determinado POI, con sus respectivos filtros y resumen de puntuación | - |
| El Turista acceda a un punto de interés correspondiente a la sección “Mapa” del menú inferior | Que se muestre la ficha de visualización el punto de interés con las siguientes secciones: Categoría y Etiquetas, Galería de fotos, Servicios con sus respectivos precios, cantidad máxima de personas y duración, Horario de cierre y estado, Duración estimada de la actividad, Reseñas de la comunidad (Tanto el resumen como la posibilidad de leer su totalidad), Botón de “Contacto” (Solo en caso de tener, se muestra Whatsapp y Gmail), Botón de “Como llegar” que redireccione a una aplicación de mapas del dispositivo. | - |
