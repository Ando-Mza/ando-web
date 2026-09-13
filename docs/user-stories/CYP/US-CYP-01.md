# US-CYP-01: Parámetros Generales del Sistema

## Información General
- **Identificador:** US-CYP-01
- **Actor:** Administrador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar autenticado.
  - El Usuario debe poseer rol Administrador.
  - Debe existir una configuración inicial del sistema.
- **Historias de Usuario Relacionadas:** US-AYT-01, US-CYP-03, US-CYP-04, US-CYP-07

---

## Descripción General
**Como** Administrador de la plataforma  
**Quiero** configurar los parámetros generales del sistema  
**Para** adaptar el funcionamiento de Ando a las necesidades operativas, funcionales y de negocio definidas para la plataforma.

---

## Descripción Funcional
El sistema debe proporcionar un módulo centralizado donde los Administradores puedan gestionar los parámetros globales que afectan el comportamiento general de la plataforma. Entre estos parámetros se incluyen configuraciones relacionadas con tiempos de sesión, límites de carga de archivos, cantidad máxima de resultados por búsqueda, activación o desactivación de funcionalidades, configuraciones de seguridad y parámetros operativos utilizados por otros módulos del sistema.
Toda modificación realizada deberá registrarse en los mecanismos de auditoría y entrar en vigencia inmediatamente o según la configuración establecida por el Administrador. Además, el sistema deberá validar los valores ingresados para evitar configuraciones inválidas que puedan afectar la estabilidad de la plataforma.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador accede al módulo de parámetros | Visualizar el listado de configuraciones generales disponibles | CYPGestionParametrosGUI |
| El Administrador modifica un parámetro válido | Que el sistema permita guardar los cambios | - |
| El Administrador intenta guardar un valor fuera de rango | Que el sistema muestre un mensaje de validación | - |
| El Administrador guarda una configuración correctamente | Que el sistema confirme la actualización exitosa | - |
| El Administrador consulta un parámetro previamente configurado | Que el sistema muestre el valor actual almacenado | - |
| El Administrador realiza cambios en la configuración | Que el sistema registre la acción en auditoría | - |
| El Administrador restablece una configuración a su valor predeterminado | Que el sistema recupere la configuración por defecto y confirme la operación | - |
