# US-ACC-04: Recuperación de Cuenta

## Información General
- **Identificador:** US-ACC-04
- **Actor:** Usuario (Turista/Prestador/Administrador)
- **Puntos de Historia:** 5
- **Precondiciones:** El Usuario debe estar registrado en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-01, US-ACC-02

---

## Descripción General
**Como** Usuario  
**Quiero** recuperar mi contraseña  
**Para** acceder a mi cuenta

---

## Descripción Funcional
El sistema debe permitir que los Usuarios recuperen sus credenciales de acceso. Para esto se envía un correo al mail indicado por el Usuario que lo redireccionará hacia la página de recuperación de credenciales de acceso.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario no recuerde su contraseña | Visualizar un botón “Recuperar contraseña” | - |
| El Usuario ingrese el email de su cuenta | Que el sistema envíe un correo de recuperación | - |
| El Usuario ingresa su email inválida | Espero que se muestre el mensaje “Si el correo se encuentra registrado, recibirás un enlace de recuperación” | - |
| El Usuario accede al enlace válido enviado al email dentro de los 30 minutos | Que pueda ingresar una nueva contraseña | - |
| El enlace de recuperación expiró ya que supero los 30 minutos | Que el sistema indique que expiró y que debe solicitar uno nuevo | - |
| El Usuario ingrese la nueva contraseña | Que el sistema indique que requisitos debe cumplir | - |
| El Usuario ingrese la nueva contraseña válida | Que el sistema actualice la contraseña correctamente | - |
| El cambio de contraseña se realiza exitosamente | Que las sesiones activas queden revocadas y el usuario pueda iniciar sesión con la nueva contraseña | - |
| El usuario solicita un nuevo enlace | Que los enlaces anteriores pendientes queden invalidados | - |
| El enlace ya fue utilizado | Que el sistema indique que el enlace ya no es válido | - |
