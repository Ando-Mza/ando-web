# US-GIT-08: Gestión de Horarios y Temporadas

## Información General
*   **Identificador:** US-GIT-08
*   **Actor:** Prestador / Administrador
*   **Puntos de Historia:** 5
*   **Precondiciones:**
    *   El Prestador/Administrador debe encontrarse autenticado.
    *   El negocio o POI debe estar registrado en el sistema.
    *   El usuario debe poseer permisos de edición sobre dicho negocio o POI.
*   **Historias de Usuario Relacionadas:** US-CYN-02, US-GIT-01, US-GIT-07

---

## Descripción General
Como Prestador o Administrador,
quiero gestionar los horarios de atención y temporadas de funcionamiento de un Punto de Interés o negocio turístico,
para brindar información actualizada a los turistas y evitar recomendaciones hacia lugares que no se encuentren disponibles.

---

## Descripción Funcional
El sistema deberá permitir registrar, modificar y consultar los horarios de atención y los períodos de apertura de un negocio o POI turístico. El Prestador podrá definir horarios regulares por día de la semana, así como temporadas especiales (alta, baja o eventos específicos) con fechas de vigencia determinadas.

Esta información será utilizada por los módulos de búsqueda, recomendaciones e itinerarios para mostrar únicamente opciones disponibles en la fecha seleccionada por el usuario.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El prestador accede a la gestión de horarios de un negocio | El sistema muestra los horarios actualmente registrados | Formulario de Gestión de Horarios |
| El prestador registra horarios de atención para cada día de la semana | El sistema valida y almacena correctamente la información ingresada | Formulario de Gestión de Horarios |
| El prestador define una temporada especial indicando fecha de inicio y fin | El sistema registra la temporada y la asocia al negocio o punto de interés | Formulario de Gestión de Horarios / Temporadas |
| El prestador modifica horarios o temporadas existentes | El sistema actualiza la información y conserva la nueva configuración | Formulario de Gestión de Horarios |
| El prestador intenta ingresar una fecha de fin anterior a la fecha de inicio de la temporada | El sistema muestra un mensaje de validación ("La fecha de fin debe ser posterior o igual a la de inicio") y no permite guardar la información | Formulario de Gestión de Horarios |
| Un turista consulta un negocio o punto de interés | El sistema muestra los horarios vigentes correspondientes a la fecha seleccionada, teniendo en cuenta la temporada | Pantalla de detalle de POI |
| El motor de recomendaciones genera sugerencias para una fecha determinada | El sistema considera únicamente lugares abiertos y disponibles en esa fecha de acuerdo a su horario y temporada | Motor de Recomendaciones (Servicio) |
| Un administrador consulta la información de un negocio | El sistema permite visualizar las temporadas y horarios registrados para tareas de control y validación | Panel de Administración |
