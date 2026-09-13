# US-GIT-05: Gestión de Categorías y Etiquetas

## Información General
- **Identificador:** US-GIT-05
- **Actor:** Administrador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Administrador debe estar autenticado en la plataforma.
  - Debe existir el módulo de Gestión de Información Turística habilitado.
- **Historias de Usuario Relacionadas:** US-CYP-03

---

## Descripción General
**Como** Administrador  
**Quiero** gestionar categorías y etiquetas para los contenidos turísticos  
**Para** organizar correctamente la información del sistema y mejorar la experiencia de búsqueda, filtrado y recomendación de los Usuarios.

---

## Descripción Funcional
El sistema debe permitir al Administrador crear, modificar, activar, desactivar y eliminar categorías y etiquetas asociadas a lugares turísticos, actividades, eventos, alojamientos, gastronomía y servicios.
Las categorías funcionarán como agrupadores principales del contenido (por ejemplo: “Bodegas”, “Turismo Aventura”, “Gastronomía”, “Hospedaje”), mientras que las etiquetas permitirán describir características específicas o atributos adicionales como “Pet Friendly”, “Familiar”, “Accesible”, “Outdoor”, “Gratis” o “Nocturno”.
El sistema deberá permitir asociar múltiples etiquetas a un mismo Punto de Interés (POI) y utilizar esta información en los filtros de búsqueda, recomendaciones inteligentes, mapas interactivos y generación automática de itinerarios.
Además, el módulo deberá validar que no existan categorías duplicadas y mantener consistencia en la nomenclatura utilizada dentro de la plataforma.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador ingresa al módulo de categorías | Visualizar el listado completo de categorías y etiquetas existentes | - |
| El Administrador crea una nueva categoría | Que el sistema registre correctamente la categoría en el sistema | - |
| El Administrador intenta crear una categoría ya existente | Que el sistema muestre un mensaje indicando que el nombre ya está registrado | - |
| El Administrador crea una nueva etiqueta | Que el sistema permite asociarla posteriormente a POIs y actividades | - |
| El Administrador modifica una categoría o etiqueta | Que el sistema actualice automáticamente los cambios relacionados | - |
| El Administrador elimina una categoría en uso | Que el sistema solicita confirmación antes de continuar | - |
| El Administrador desactiva una etiqueta | Que deje de aparecer en búsquedas y filtros públicos | - |
| El Turista realiza una búsqueda filtrada | Que el sistema permite filtrar por categorías y etiquetas disponibles | - |
| El motor de recomendación genera sugerencias | Que las categorías y etiquetas sean consideradas para personalizar resultados | - |
