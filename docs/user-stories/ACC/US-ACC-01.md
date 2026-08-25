# US-ACC-01: Registro de Usuario con Rol Turista

## Información General
- **Identificador:** US-ACC-01
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Usuario debe encontrarse en la pantalla de acceso o bienvenida de la aplicación.
  - El sistema debe encontrarse disponible.
  - El correo electrónico utilizado no debe estar asociado previamente a otra cuenta.
  - Debe existir configurado el rol de Usuario "Turista".
- **Historias de Usuario Relacionadas:** -

---

## Descripción General
**Como** Turista  
**Quiero** registrarme en Ando  
**Para** acceder a las funcionalidades del sistema, planificar mis viajes en Mendoza y recibir recomendaciones adaptadas a mis intereses.

---

## Descripción Funcional
El sistema debe permitir que un Turista pueda crear una cuenta mediante un proceso de registro, proporcionando la información necesaria para generar su perfil dentro de la plataforma.
El formulario de registro deberá solicitar datos básicos del Usuario como nombre, apellido, correo electrónico, contraseña y aceptación de términos y condiciones. Además, podrá incluir información opcional que permita personalizar la experiencia del Usuario, como idioma preferido, intereses turísticos o preferencias iniciales de viaje.
Durante el proceso de creación de cuenta, el sistema deberá validar que el correo electrónico ingresado no se encuentre asociado previamente a otro Usuario, verificar que la contraseña cumpla con las políticas de seguridad definidas y controlar que los campos obligatorios hayan sido completados correctamente.
Una vez finalizado el registro exitosamente, el sistema deberá crear automáticamente un Usuario con rol Turista, inicializar su perfil y permitirle acceder a la pantalla principal de la plataforma. En caso de cancelación o error durante el proceso, el sistema deberá conservar la información ingresada únicamente durante la sesión actual y permitir volver al inicio de sesión.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista ingresa a la plataforma | Visualizar un botón de “¿No tienes cuenta? Registrate” | - |
| El Turista selecciona la opción “Registrarse” | Visualizar el formulario de creación de cuenta | - |
| El Turista completa el formulario de registro | Visualizar los campos obligatorios y opcionales disponibles | - |
| El Turista ingrese al formulario de registro de Usuario tipo “Turista” | Visualizar un formulario con los siguientes campos: nombre, apellido, email, contraseña, repetir contraseña, teléfono, fechaNacimiento, avatarUrl o foto de perfil, idioma, selector de intereses turísticos | - |
| El Turista desee regresar a la página anterior | Visualizar un botón que lo regrese al login | - |
| El Turista ingrese al formulario | Visualizar al final del mismo un seleccionable que le permita leer los términos y condiciones de uso de la aplicación | - |
| El email ya existe en el sistema | Espero que se muestre el mensaje “El correo ya se encuentra registrado” | - |
| La contraseña no cumple con los requisitos | Que el sistema indique las condiciones faltantes (Longitud entre 8 y 12 caracteres, al menos 1 caracter especial, al menos 1 mayúscula, al menos 1 número) | - |
| El Turista completa los campos correctamente | Que el sistema cree la cuenta exitosamente | - |
| El Turista deja campos vacíos | Que el botón de “Registrarse” se encuentre deshabilitado | - |
| El registro es exitoso | Que el sistema redireccione al panel principal del Turista (homepage) | - |
| El registro no se quiere llevar a cabo | Que el sistema redireccione al Usuario a la página de login | - |
| El Turista seleccione “Registrate” | Visualizar un selector de roles que le permita elegir la opción de “Turista” y lo redireccione al formulario de registro | - |
