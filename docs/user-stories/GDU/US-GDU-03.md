# US-GDU-03: Administración de Usuarios

## Información General
- **Identificador:** US-GDU-03
- **Actor:** Administrador
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Administrador debe estar registrado en el sistema.
  - El Administrador debe tener una sesión activa en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-03

---

## Descripción General
**Como** Administrador  
**Quiero** gestionar Usuarios de la plataforma  
**Para** crear, visualizar, modificar y eliminar cuentas

---

## Descripción Funcional
El Administrador creará nuevos Usuarios, modificará los datos de las cuentas, visualizará un listado de todos los Usuarios del sistema permitiendo filtrarlos y dar de baja cuentas.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador accede al módulo | Que el sistema muestre el listado de Usuarios | - |
| El Administrador busca Usuarios por algún atributo (nombre, código, tipo de plan) | Que el sistema filtre correctamente los resultados | - |
| El Administrador selecciona el ícono de modificar Usuario | Que el sistema muestre un formulario idéntico al de creación pero con la posibilidad de modificar los campos que ya están completos | - |
| El Administrador modifica información válida de la cuenta (respetando los campos obligatorios y datos validados) | Que el sistema muestre un botón de “Guardar Cambios” habilitado | - |
| El Administrador modifica información inválida de la cuenta (sin respetando los campos obligatorios y datos validados) | Que el sistema muestre un botón de “Guardar Cambios” inhabilitado | - |
| El Administrador ingresa al formulario para modificar información del Usuario | Que el sistema muestre junto al botón de “Guardar Cambios” un botón de “Cancelar” | - |
| El Administrador selecciona el botón de “Cancelar” | Que el sistema muestre un cartel de confirmación que indique el siguiente mensaje “Al confirmar esta operación se perderán las modificaciones ¿Está seguro que desea continuar?” junto con las siguientes opciones “Confirmar / Cancelar” | - |
| El Administrador selecciona el botón de “Confirmar” | Que el sistema actualice la información del Usuario correctamente | - |
| El Administrador selecciona el botón de “Cancelar” | Que el sistema redirecciona a la página del módulo con la lista de contactos | - |
| El Administrador elimina un Usuario | Que el Usuario no pueda acceder al sistema con sus credenciales de acceso | - |
| El Administrador selecciona el ícono de eliminar Usuario | Que el sistema muestre un cartel de confirmación con las opciones de “Confirmar / Cancelar” | - |
| El Administrador selecciona “Confirmar” | Que el sistema muestre el mensaje “La cuenta fue eliminada correctamente” | - |
| El Administrador selecciona “Cancelar” | El sistema mantenga la cuenta activa y muestre un mensaje indicando "Operación cancelada" | - |
| El Administrador crea una nueva cuenta | Que el Usuario se muestre en el listado y que pueda acceder con sus respectivas credenciales | - |
| El Administrador seleccione “Nuevo Usuario” | Que el sistema muestre un formulario con los datos a completar | - |
