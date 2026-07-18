
# US-ACC-05: Cierre de Sesión

## Información General
- **Identificador:** US-ACC-05
- **Actor:** Usuario (Turista / Prestador / Administrador)
- **Puntos de Historia:** 5
- **Precondiciones:**
	- El usuario debe estar registrado en el sistema.
	- El usuario debe tener una sesión activa en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-01, US-ACC-02, US-ACC-03

---

## Descripción General
Como usuario quiero cerrar mi sesión para salir del sistema y proteger el acceso a mi cuenta.

---

## Descripción Funcional
El sistema debe permitir que los usuarios cierren sesión de forma simple y segura:
- Mostrar una opción clara `Cerrar Sesión` desde la vista de `Mi Cuenta` o el ícono de perfil.
- Solicitar confirmación antes de cerrar sesión mediante un diálogo con texto explicativo.
- Al confirmar: invalidar la sesión (tokens / estado local) y redirigir al `Login`.
- Al cancelar: mantener la sesión y la pantalla actual.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El usuario abre el menú de cuenta / ícono de perfil | Ver un botón u opción `Cerrar Sesión` | Mi Cuenta / Header |
| El usuario selecciona `Cerrar Sesión` | Mostrar diálogo de confirmación: “¿Está seguro que quiere cerrar la sesión? Si lo hace deberá iniciar sesión nuevamente para acceder a sus viajes.” | Modal / Confirmación |
| En el diálogo el usuario confirma (Aceptar) | Que el sistema cierre la sesión y redirija al `Login` | Login |
| En el diálogo el usuario cancela | Que el sistema mantenga la sesión y la pantalla actual | (sin cambio) |

---

## Notas de Implementación
- Usar el componente de diálogo/confirmación estándar del sistema (evitar alerts nativos sin estilo).
- Invalidar tokens y limpiar estado de sesión (almacenamiento local, Redux/Context) al cerrar sesión.
- Mantener preferencia de idioma/tema, pero no credenciales ni tokens.
- Añadir pruebas E2E que verifiquen flujo de cierre y redirección al `Login`.

