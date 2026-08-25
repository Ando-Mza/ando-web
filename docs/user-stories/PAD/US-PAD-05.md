# US-PAD-05: Monitoreo de Actividad Sospechosa

## Información General
- **Identificador:** US-PAD-05
- **Actor:** Administrador
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Administrador debe tener una sesión activa en el sistema.
- **Historias de Usuario Relacionadas:** US-GDU-01, US-GDU-02

---

## Descripción General
**Como** Administrador  
**Quiero** monitorear actividades sospechosas en la plataforma  
**Para** detectar los comportamientos anómalos, prevenir fraudes y mejorar la seguridad del sistema.

---

## Descripción Funcional
El sistema debe permitir clasificar eventos como sospechosos, y fijar reglas y umbrales que generen los alerten. Esto sirve para prevenir comportamientos fraudulentos o que incumplan las políticas de la plataforma.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador ingresa a la sección de "Moderación de Contenido" en el PAD | Que el sistema despliegue una tabla o lista con los reportes pendientes, mostrando tipo de contenido, cantidad de reportes acumulados, motivo principal y una columna de acciones | - |
| El Administrador hace clic en el botón "Eliminar Contenido" | Que el sistema aplique una baja lógica al contenido (dejando de ser visible para Turistas y Prestadores), marque el reporte como Resuelto y registre la acción | - |
| El Administrador hace clic en el botón "Desestimar Reporte" | Que el sistema cambie el estado del reporte a “Desestimado”, mantenga el contenido visible en la plataforma y quite el ítem de la bandeja de pendientes | - |
| El Administrador selecciona una alerta | El sistema muestra el detalle completo de la actividad (Usuario involucrado, fecha, tipo de evento y nivel de criticidad) | - |
| El Administrador marca una alerta como “Revisada” | El sistema actualiza el estado de la alerta | - |
| El Administrador intenta cerrar una alerta | El sistema solicita confirmación de la acción con la opción de “Confirmar / Cancelar” mediante un modal | - |
| Cuando el Administrador selecciona el botón “Confirmar” | El sistema cierre la alerta y vuelva a visualizar la tabla completa | - |
| Cuando el Administrador selecciona el botón “Cancelar! | El sistema cierra el modal y se vuelven a mostrar todas las alertas | - |
| No existen alertas registradas | El sistema muestra un mensaje indicando "No hay actividades sospechosas pendientes de revisión" | - |
