# US-CYP-03: Gestión de Categorías Turísticas

## Información General
*   **Identificador:** US-CYP-03
*   **Actor:** Administrador
*   **Puntos de Historia:** 5
*   **Precondiciones:**
    *   El usuario debe estar autenticado.
    *   El usuario debe poseer el rol Administrador.
    *   Debe existir el módulo de Gestión de Información Turística operativo.
*   **Historias de Usuario Relacionadas:** US-GIT-05, US-GIT-01, US-MRIA-01, US-MRIA-09, US-AYT-01

---

## Descripción General
Como administrador de la plataforma, quiero gestionar las categorías turísticas disponibles en el sistema, para clasificar correctamente los puntos de interés, actividades, eventos, alojamientos, servicios gastronómicos y demás contenidos turísticos, facilitando la búsqueda, filtrado y recomendación de información para los usuarios.

---

## Descripción Funcional
El sistema debe permitir al administrador crear, modificar, activar, desactivar y eliminar categorías turísticas utilizadas para organizar el contenido de la plataforma. Estas categorías serán utilizadas por distintos módulos del sistema, incluyendo Gestión de Información Turística, Motor de Recomendación Inteligente, Búsqueda Avanzada, Geolocalización y Generación de Itinerarios.

Cada categoría deberá contar como mínimo con un nombre, una descripción y un estado (Activa/Inactiva). El sistema deberá validar que no existan categorías duplicadas y deberá impedir la eliminación de categorías que se encuentren asociadas a puntos de interés, actividades o negocios activos.

Las categorías activas deberán estar disponibles para ser seleccionadas durante la carga y edición de contenido turístico. Asimismo, el motor de recomendación utilizará esta clasificación para personalizar sugerencias según los intereses y preferencias de cada usuario.

Toda acción realizada sobre una categoría deberá quedar registrada en el módulo de auditoría del sistema.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El administrador accede al módulo de categorías turísticas | Visualizar el listado completo de categorías registradas | Panel de Categorías Turísticas |
| El administrador selecciona la opción "Nueva Categoría” | Visualizar el formulario de creación de categoría | Formulario de Categoría |
| El administrador completa correctamente los datos requeridos | Que el sistema permita registrar la nueva categoría | Formulario de Categoría |
| El administrador intenta crear una categoría con un nombre ya existente | Que el sistema informe que la categoría ya se encuentra registrada | Formulario de Categoría |
| El administrador modifica una categoría existente | Que el sistema actualice la información correctamente | Formulario de Categoría |
| El administrador desactiva una categoría | Que la categoría deje de estar disponible para nuevas asignaciones | Panel de Categorías Turísticas |
| El administrador reactiva una categoría | Que vuelva a estar disponible para los módulos que la utilizan | Panel de Categorías Turísticas |
| El administrador intenta eliminar una categoría asociada a contenido activo | Que el sistema impida la eliminación e informe el motivo | Panel de Categorías Turísticas |
| El administrador elimina una categoría sin asociaciones activas | Que el sistema elimine la categoría correctamente | Panel de Categorías Turísticas |
| Un administrador realiza una alta, baja o modificación | Que el sistema registre la acción en auditoría | Panel de Categorías Turísticas / Auditoría |
| Un usuario crea o edita un POI | Que el sistema muestre únicamente las categorías activas para seleccionar | Formulario de Creación/Edición de POI |
| El motor de recomendaciones procesa información turística | Que utilice las categorías configuradas para clasificar y recomendar contenido | Motor de Recomendaciones (Servicio) |
