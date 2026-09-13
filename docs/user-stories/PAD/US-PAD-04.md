# US-PAD-04: Gestión de Validaciones

## Información General
- **Identificador:** US-PAD-04
- **Actor:** Administrador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
  - El Usuario debe tener una sesión activa con rol de “Administrador”.
- **Historias de Usuario Relacionadas:** -

---

## Descripción General
**Como** Administrador  
**Quiero** gestionar las validaciones de Usuario y su documentación  
**Para** asegurar la autenticidad y confiabilidad de la información registrada en la plataforma.

---

## Descripción Funcional
El sistema debe permitir que el Administrador defina tipos de validaciones requeridas, documentos obligatorios a subir según el tipo de Usuario, definir los posibles estados de validación (pendiente, aprobada, rechazada) y validar las políticas de vencimiento o revalidación documental.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador accede al módulo de validaciones | El sistema muestra las solicitudes pendientes | - |
| El Administrador selecciona una solicitud | El sistema muestra el detalle y la documentación adjunta | - |
| El Administrador aprueba una validación | El sistema cambia el estado a “Validado” | - |
| El Administrador rechaza una validación | El sistema solicita ingresar un motivo de rechazo | - |
| El Administrador confirma la aprobación | El sistema muestra un cartel indicando “Validación aprobada correctamente” | - |
| El Administrador rechaza la solicitud | El sistema muestra una notificación indicando “Validación rechazada” | - |
| El Usuario posee documentación incompleta | El sistema impide aprobar la validación | - |
| El Administrador realiza acciones sobre validaciones | El sistema registra la auditoría correspondiente | - |
