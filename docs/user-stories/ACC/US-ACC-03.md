# US-ACC-03: Inicio de Sesión para cualquier Rol

## Información General
*   **Identificador:** US-ACC-03
*   **Actor:** Usuario (Turista / Prestador / Administrador)
*   **Puntos de Historia:** 8
*   **Precondiciones:**
    *   El Usuario debe estar registrado en el sistema.
*   **Historias de Usuario Relacionadas:** US-ACC-01, US-ACC-02

---

## Descripción General
Como usuario, quiero iniciar sesión en Ando para acceder al sistema.

---

## Descripción Funcional
El sistema debe permitir que los usuarios inicien sesión con su usuario y contraseña válidos.
Debe validar las credenciales ingresadas y mostrar mensajes claros cuando sean inválidas o los campos estén incompletos.
El botón de ingreso debe permanecer deshabilitado hasta que se completen los campos obligatorios.
El sistema debe ofrecer un enlace de “Olvidé mi contraseña” que redirija a la página de recuperación.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El usuario ingresa a la plataforma | Visualizar un botón de Login | Login |
| El usuario ingresa su email y contraseña válidos | Que el sistema lo redireccione a la página principal | Login |
| El usuario ingresa su email y contraseña inválidos | Que se muestre el mensaje “Usuario o contraseña incorrectos” | Login |
| El usuario deja campos vacíos | Que el botón de “Ingresar” permanezca deshabilitado | Login |
| El usuario selecciona “Olvidé mi contraseña” | Que el sistema redireccione a la página de recuperación de contraseñas | Login |

