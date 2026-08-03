
# US-ACC-04: Recuperación de Cuenta

## Información General
*   **Identificador:** US-ACC-04
*   **Actor:** Usuario (Turista / Prestador / Administrador)
*   **Puntos de Historia:** 5
*   **Precondiciones:**
	*   El usuario debe estar registrado en el sistema y contar con un correo válido asociado a su cuenta.
*   **Historias de Usuario Relacionadas:** US-ACC-01, US-ACC-02

---

## Descripción General
Como usuario quiero recuperar mi contraseña para poder volver a acceder a mi cuenta en caso de olvido.

---

## Descripción Funcional
El sistema debe ofrecer un flujo de recuperación de contraseña seguro que incluya:
- Un enlace o botón “Olvidé mi contraseña” en la pantalla de login.
- Un formulario para que el usuario ingrese su correo electrónico asociado.
- Envío de un correo con un enlace temporal y único para restablecer la contraseña.
- Página segura donde el usuario ingresa la nueva contraseña (con validación de requisitos de seguridad).
- Manejo de enlaces expirados o inválidos con mensajes claros y la posibilidad de solicitar un nuevo enlace.

El enlace de recuperación debe expirar después de un tiempo configurado (por ejemplo 1 hora) y la nueva contraseña debe seguir la política de contraseñas del sistema.

Adicionalmente, la experiencia en cliente debe contemplar una confirmación en la misma pantalla de recuperación (en lugar de una alerta modal) que incluya opciones para "Volver al login" y "Reenviar correo". El reenvío debe deshabilitarse temporalmente (cooldown) para evitar envíos masivos accidentales. Se debe mostrar una nota sobre revisar la carpeta SPAM.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El usuario no recuerda su contraseña | Visualizar un enlace o botón “Olvidé mi contraseña” en la pantalla de Login | Login |
| El usuario ingresa su email asociado y es válido | Que el sistema envíe un correo con enlace de recuperación | Formulario de Recuperación |
| El usuario ingresa un email no registrado | Que se muestre el mensaje “Correo no registrado” | Formulario de Recuperación |
| El correo fue enviado correctamente | Mostrar confirmación en pantalla: "Revisa tu casilla" con botones "Volver al login" y "Reenviar correo" (Reenviar en cooldown) | Formulario de Recuperación |
| El usuario accede al enlace válido recibido por email | Que se muestre el formulario para ingresar y confirmar nueva contraseña | Reset de Contraseña |
| El enlace de recuperación expiró o es inválido | Que el sistema muestre aviso y ofrezca solicitar un nuevo enlace | Reset de Contraseña |
| El usuario ingresa una contraseña que no cumple requisitos | Que el sistema muestre los requisitos pendientes (largo, mayúsculas, números, etc.) | Reset de Contraseña |
| El usuario ingresa una contraseña válida y confirma | Que el sistema actualice la contraseña y confirme éxito | Confirmación |
| El cambio se realiza exitosamente | Que el usuario pueda iniciar sesión con la nueva contraseña | Login |

---

## Notas de diseño
- La confirmación en pantalla evita modales intrusivos y facilita acciones contextuales (reenviar, volver al login).
- Mostrar mensaje adicional: "Si no ves el correo, revisá la carpeta SPAM o la sección de promociones.".
- Cooldown recomendado para reenvío: 30 segundos.
- Mantener consistencia visual con los componentes existentes (`Input`, `Button`, `Text`).

