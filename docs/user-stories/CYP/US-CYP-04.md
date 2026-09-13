# US-CYP-04: Gestión de Estados de Validación

## Información General
- **Identificador:** US-CYP-04
- **Actor:** Administrador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar autenticado.
  - El Usuario debe poseer rol Administrador.
  - Deben existir módulos que utilicen procesos de validación de contenido.
  - Debe existir al menos un estado inicial configurado en el sistema.
- **Historias de Usuario Relacionadas:** US-CYN-01, US-CYN-02, US-CYN-05, US-PAD-05, US-AYT-01

---

## Descripción General
**Como** Administrador de la plataforma  
**Quiero** gestionar los estados de validación utilizados en el sistema  
**Para** controlar y estandarizar el ciclo de aprobación de negocios, puntos de interés, actividades y contenido generado por la comunidad.

---

## Descripción Funcional
El sistema debe permitir al Administrador crear, modificar, activar, desactivar y administrar los estados de validación utilizados durante los procesos de revisión de contenido. Estos estados serán aplicados a entidades como negocios turísticos, puntos de interés (POIs), actividades, eventos y contribuciones realizadas por Usuarios mediante mecanismos de crowdsourcing.
Entre los estados definidos podrán encontrarse, por ejemplo: "Pendiente de Validación", "En Revisión", "Aprobado", "Rechazado", "Suspendido" o cualquier otro que la administración considere necesario para la operación del sistema.
El sistema deberá permitir configurar qué acciones están habilitadas para cada estado y definir las transiciones válidas entre ellos. Asimismo, deberá impedir la eliminación de estados que estén siendo utilizados por registros activos y mantener trazabilidad sobre todos los cambios realizados. Los estados configurados serán utilizados por los módulos de Gestión de Negocios, Gestión de Información Turística, Crowdsourcing y Panel Administrativo para controlar la visibilidad y disponibilidad del contenido dentro de la plataforma. Toda modificación realizada sobre los estados deberá quedar registrada en los mecanismos de auditoría.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador accede al módulo de estados de validación | Visualizar el listado de estados configurados en el sistema | - |
| El Administrador crea un nuevo estado de validación | Que el sistema registre correctamente el nuevo estado | - |
| El Administrador intenta crear un estado con un nombre ya existente | Que el sistema informe que el estado ya se encuentra registrado | - |
| El Administrador modifica la descripción o configuración de un estado | Que el sistema actualice la información correctamente | - |
| El Administrador desactiva un estado | Que el estado deje de estar disponible para nuevas validaciones | - |
| El Administrador intenta eliminar un estado asociado a registros activos | Que el sistema impida la operación e informe el motivo | - |
| El Administrador define una transición entre estados | Que el sistema permita únicamente los cambios configurados | - |
| Un Administrador aprueba un negocio o POI | Que el sistema cambie automáticamente el estado según el flujo definido | - |
| Un Usuario consulta el estado de su negocio o propuesta | Que el sistema muestre el estado actual de validación | - |
| El sistema registra una modificación sobre un estado | Que la acción quede almacenada en los registros de auditoría | - |
| Un contenido cambia a estado "Aprobado" | Que el sistema permita su publicación y visualización en la plataforma | - |
| Un contenido cambia a estado "Rechazado" | Que el sistema informe el resultado al Usuario responsable | - |
