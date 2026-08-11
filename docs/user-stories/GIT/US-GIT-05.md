# US-GIT-05: Gestión de Categorías y Etiquetas

## Información General
*   **Identificador:** US-GIT-05
*   **Actor:** Administrador
*   **Puntos de Historia:** 5
*   **Precondiciones:**
    *   El Administrador debe estar autenticado en la plataforma.
    *   Debe existir el módulo de Gestión de Información Turística habilitado.
*   **Historias de Usuario Relacionadas:** US-CYP-03

---

## Descripción General
Como administrador de la plataforma,
quiero gestionar categorías y etiquetas para los contenidos turísticos,
para organizar correctamente la información del sistema y mejorar la experiencia de búsqueda, filtrado y recomendación de los usuarios.

---

## Descripción Funcional
El sistema debe permitir al administrador crear, modificar, activar, desactivar y eliminar categorías y etiquetas asociadas a lugares turísticos (POIs), actividades, eventos, alojamientos, gastronomía y servicios.

Las categorías funcionarán como agrupadores principales del contenido (por ejemplo: “Bodegas”, “Turismo Aventura”, “Gastronomía”, “Hospedaje”), mientras que las etiquetas permitirán describir características específicas o atributos adicionales como “Pet Friendly”, “Familiar”, “Accesible”, “Outdoor”, “Gratis” o “Nocturno”.

El sistema deberá permitir asociar múltiples etiquetas a un mismo Punto de Interés (POI) y utilizar esta información en los filtros de búsqueda, recomendaciones inteligentes, mapas interactivos y generación automática de itinerarios.
Además, el módulo deberá validar que no existan categorías duplicadas y mantener consistencia en la nomenclatura utilizada dentro de la plataforma.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador ingresa al módulo de categorías | Visualizar el listado completo de categorías y etiquetas existentes | Módulo de Categorías y Etiquetas |
| El Administrador crea una nueva categoría | Que el sistema registre correctamente la categoría en el sistema | Formulario de Creación de Categoría |
| El Administrador intenta crear una categoría ya existente | Que el sistema muestre un mensaje indicando que el nombre ya está registrado | Formulario de Creación de Categoría |
| El Administrador crea una nueva etiqueta | Que el sistema la registre y permita asociarla posteriormente a POIs y actividades | Formulario de Creación de Etiqueta |
| El Administrador modifica una categoría o etiqueta | Que el sistema actualice automáticamente los cambios relacionados y las asociaciones existentes | Formulario de Edición |
| El Administrador elimina una categoría en uso | Que el sistema solicite confirmación antes de continuar | Diálogo de Confirmación |
| El Administrador desactiva una etiqueta | Que deje de aparecer en búsquedas y filtros públicos para los turistas | Módulo de Categorías y Etiquetas |
| El Turista realiza una búsqueda filtrada | Que el sistema permita filtrar los atractivos turísticos por categorías y etiquetas disponibles | Pantalla de Búsqueda y Filtros |
| El motor de recomendación genera sugerencias | Que las categorías y etiquetas de preferencia del turista sean consideradas para personalizar los resultados | Motor de Recomendación (Servicios) |
