# US-GIT-06: Gestión de Multimedia como Administrador

## Información General
*   **Identificador:** US-GIT-06
*   **Actor:** Administrador
*   **Puntos de Historia:** 2
*   **Precondiciones:**
    *   El Administrador debe estar autenticado con rol de Administrador.
    *   El POI debe existir previamente en el sistema.
*   **Historias de Usuario Relacionadas:** US-ACC-03

---

## Descripción General
Como Administrador,
quiero cargar las URLs de imágenes de un POI obtenidas desde fuentes externas,
para que los turistas puedan visualizar imágenes representativas del lugar.

---

## Descripción Funcional
El Administrador accede al detalle de un POI existente y selecciona la opción "Gestión de imágenes". El sistema presenta un formulario donde el Administrador puede ingresar una o más URLs públicas de imágenes del POI, obtenidas de Google Places API, Mendotur u OpenStreetMap.

El sistema valida que cada URL ingresada sea accesible y corresponda a una imagen válida. Una vez guardadas, las URLs quedan almacenadas en la entidad ImagenPOI asociada al POI y las imágenes se muestran en el perfil público del lugar.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El administrador selecciona un POI en específico, presiona el botón “cargar imágenes al poi”, ingresa una URL válida y accesible de una imagen y presiona “guardar” | El sistema almacena la URL en la entidad ImagenPOI y muestra la imagen en el perfil público del POI | Pantalla de modificación de un POI |
| El administrador ingresa una URL con formato inválido | El sistema muestra "La URL ingresada no tiene un formato válido" y bloquea el guardado | Formulario de Gestión de Imágenes |
| El administrador ingresa una URL válida pero la imagen no es accesible (ej: retorna 404 o timeout) | El sistema muestra "No fue posible acceder a la imagen. Verificá que la URL sea pública y esté disponible" y no permite guardar | Formulario de Gestión de Imágenes |
| El administrador guarda correctamente varias URLs públicas de imágenes | El sistema almacena todas las imágenes asociadas al POI y las renderiza en un carrusel del perfil público | Formulario de Gestión de Imágenes / Perfil del POI |
