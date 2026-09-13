# US-ACC-03: Inicio de Sesión para cualquier Rol

## Información General
- **Identificador:** US-ACC-03
- **Actor:** Usuario (Turista/Prestador/Administrador)
- **Puntos de Historia:** 8
- **Precondiciones:** El Usuario debe estar registrado en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-01, US-ACC-02

---

## Descripción General
**Como** Usuario  
**Quiero** iniciar sesión en Ando  
**Para** acceder al sistema

---

## Descripción Funcional
El sistema debe permitir que los Usuarios inicien sesión con sus respectivos Usuarios y contraseñas.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario ingresa a la plataforma | Visualizar un botón de Login | ACCIniciarSesiónGUI Login |
| El Usuario ingresa su email y contraseña válida | Que el sistema lo redireccione a la página principal | - |
| El Usuario ingresa su email y contraseña inválida | Que se muestre el mensaje “Usuario o contraseña incorrectos” | - |
| El Usuario deja campos vacíos | Que el botón de “Ingresar” permanezca deshabilitado | - |
| El Usuario seleccione “Olvidé mi contraseña” | Que el sistema redireccione a la página de recuperación de contraseñas | - |
