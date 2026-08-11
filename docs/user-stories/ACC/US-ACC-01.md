# US-ACC-01: Registro de Usuario con Rol Turista

## Información General
- **Identificador:** US-ACC-01
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El usuario debe encontrarse en la pantalla de acceso o bienvenida de la aplicación.
  - El sistema debe encontrarse disponible.
  - El correo electrónico utilizado no debe estar asociado previamente a otra cuenta.
  - Debe existir configurado el rol de Usuario "Turista".
- **Historia de Usuario Relacionada:** -

---

## Descripción General
Como Turista quiero registrarme en Ando para acceder a las funcionalidades del sistema, planificar mis viajes en Mendoza y recibir recomendaciones adaptadas a mis intereses.

---

## Descripción Funcional
El sistema debe permitir que un viajero cree una cuenta mediante un proceso de registro, proporcionando la información necesaria para generar su perfil dentro de la plataforma.

El formulario de registro debe solicitar los datos básicos obligatorios del usuario y validar:
- que el correo electrónico no esté asociado a otra cuenta.
- que la contraseña cumpla con la política de seguridad.
- que los campos obligatorios estén completos.

El registro debe crear automáticamente un usuario con rol Turista, inicializar su perfil y permitir el acceso a la pantalla principal. En caso de cancelación o error, el sistema debe conservar la información ingresada sólo durante la sesión actual y permitir volver al inicio de sesión.

---

## Atributos del Registro
El registro debe incluir obligatoriamente los siguientes atributos:
- `id` uuid [pk]
- `nombre` varchar
- `apellido` varchar
- `email` varchar
- `passwordHash` varchar
- `telefono` varchar
- `fechaNacimiento` date
- `avatarUrl` varchar
- `idioma` varchar

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El turista ingresa a la plataforma | Visualizar un botón de "Registrarse" | Pantalla de inicio |
| El turista selecciona la opción "Registrarse" | Mostrar el formulario de creación de cuenta | Registro |
| El turista completa el formulario de registro | Visualizar los campos obligatorios y opcionales disponibles | Registro |
| El email ya existe en el sistema | Mostrar el mensaje "El correo ya se encuentra registrado" | Registro |
| La contraseña no cumple con los requisitos | Indicar las condiciones faltantes | Registro |
| El turista completa los campos correctamente | Crear la cuenta exitosamente | Registro |
| El turista deja campos vacíos | El botón de "Registrarse" se encuentra deshabilitado | Registro |
| El registro es exitoso | Redirigir al panel principal del turista (homepage) | Homepage |
| El usuario decide no registrarse | Redirigir al usuario a la página de login | Login |

---

## Notas de Implementación
- El formulario debe ser claro, con validación en tiempo real de email y contraseña.
- El `passwordHash` debe generarse en backend; el cliente sólo envía la contraseña.
- El campo `idioma` debe guardar el idioma preferido del usuario.
- El `avatarUrl` puede ser opcional en el formulario, pero debe existir en el registro final.



