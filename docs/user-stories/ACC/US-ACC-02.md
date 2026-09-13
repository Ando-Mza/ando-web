# US-ACC-02: Registro de Usuario con Rol Prestador

## Información General
- **Identificador:** US-ACC-02
- **Actor:** Prestador
- **Puntos de Historia:** 8
- **Precondiciones:** -
- **Historias de Usuario Relacionadas:** -

---

## Descripción General
**Como** Prestador  
**Quiero** registrarme en Ando  
**Para** publicar y administrar mis servicios o tiendas Turistas.

---

## Descripción Funcional
El sistema debe permitir que los Prestadores se registren y relacionen con su respectiva organización.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Ingrese a la plataforma o en la misma pantalla de login | Visualizar un botón de “¿No tienes cuenta? Registrate” | - |
| Ingrese al formulario de registro de Usuario tipo “Prestador” | Visualizar los campos obligatorios: nombre, apellido, email, contraseña, repetir contraseña, teléfono, fechaNacimiento, avatarUrl o foto de perfil, nombre de la empresa, cuit de la empresa | - |
| El email ya existe en el sistema | Espero que se muestre el mensaje “El correo ya se encuentra registrado” | - |
| La contraseña no cumple con los requisitos | Que el sistema indique las condiciones faltantes (Longitud entre 8 y 12 caracteres, al menos 1 caracter especial, al menos 1 mayúscula, al menos 1 número) | - |
| El Prestador complete los campos correctamente | Que el sistema cree la cuenta exitosamente | - |
| El Prestador deje campos vacíos | Que el botón de “Registrarse” se encuentre deshabilitado | - |
| El registro es exitoso | Que el sistema redireccione al panel principal del Prestador (homepage) | - |
| El Prestador acepta los términos y condiciones | Que el sistema permita finalizar el registro | - |
| El Prestador se registre | Que el sistema informe que la cuenta queda pendiente de validación | - |
| El Prestador se registre | Que el sistema valide la entidad turística | - |
| El Prestador seleccione “Registrate” | Visualizar un selector de roles que le permita elegir la opción de “Prestador” y lo redireccione al formulario de registro | - |
