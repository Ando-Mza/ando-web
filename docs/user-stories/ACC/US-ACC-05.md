# US-ACC-05: Cierre de Sesión

## Información General
- **Identificador:** US-ACC-05
- **Actor:** Usuario (Turista/Prestador/Administrador)
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
  - El Usuario debe tener una sesión activa en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-01, US-ACC-02, US-ACC-03

---

## Descripción General
**Como** Usuario  
**Quiero** cerrar sesión  
**Para** salir del sistema

---

## Descripción Funcional
El sistema debe permitir que los Usuarios cierren sesión.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario ingresa al ícono de cuenta | Visualizar un botón de Cerrar Sesión | Relación a pantalla GUI |
| El Usuario seleccione Cerrar Sesión | Que el sistema muestre un mensaje de confirmación “¿Está seguro que quiere cerrar la sesión? Si lo hace deberá iniciar sesión nuevamente para acceder a sus viajes” | - |
| El Usuario seleccione “Aceptar” como confirmación para cerrar sesión | Que el sistema lo redireccione a la página de Login | - |
| El Usuario seleccione “Cancelar” como confirmación para el cierre de sesión | Que el sistema se mantenga en la página actual en la que se encuentra | - |
