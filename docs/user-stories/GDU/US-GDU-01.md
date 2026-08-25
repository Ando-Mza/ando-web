# US-GDU-01: Autogestión de Perfil Propio como Turista

## Información General
- **Identificador:** US-GDU-01
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Turista debe estar registrado en el sistema.
  - El Turista debe tener una sesión activa en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-01, US-ACC-03, US-ACC-04, US-GDU-04

---

## Descripción General
**Como** Turista  
**Quiero** modificar mi perfil personal  
**Para** mantener actualizada mi información

---

## Descripción Funcional
El sistema debe permitir que los Turistas modifiquen su información personal manteniendo las respectivas validaciones de formato.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista seleccione “Editar Perfil” | Que el sistema muestre un formulario para editar sus datos personales con los siguientes campos: Nombre y Apellido, Teléfono, Email, Preferencias, Ciudad de Origen, Contraseña, Foto de Perfil (avatarUrl) | - |
| El Turista modifique su información válidamente | Que el sistema actualice su perfil correctamente | - |
| El Turista deje los campos obligatorios vacíos | Que el sistema impida guardar cambios | - |
| El Turista guarde sus cambios | Espero que se muestre el mensaje “Perfil actualizado correctamente” | - |
| El Turista guarde los cambios | Que los nuevos datos se almacenen correctamente | - |
| El Turista cancele la edición de sus datos personales | Que el sistema descarte los cambios y muestre un mensaje de confirmación | - |
| El Turista seleccione “Guardar” los cambios | Que el sistema muestre un mensaje de confirmación que diga “¿Desea guardar los cambios realizados sobre el Usuario?” | - |
| El Turista seleccione “Confirmar cambios” | Espero que se muestre el mensaje “Perfil actualizado correctamente” | - |
| El Turista seleccione “Cancelar” | Espero que se muestre el mensaje “¿Descartar cambios? Si sales de la página, los cambios que no hayas guardado se perderán. ¿Estás seguro de que deseas salir?” | - |
| El Turista seleccione “Confirmar” | Espero que se redireccione el Usuario a la página de “Mi Cuenta” | - |
| El Turista seleccione “Cambiar Contraseña” | Que se despliegue un formulario que requiera el ingreso de la contraseña actual, y luego de la nueva manteniendo el formato de: Longitud entre 8 y 12 caracteres, al menos 1 caracter especial, al menos 1 mayúscula, al menos 1 número | - |
| El Turista seleccione “Cambiar Contraseña” y no recuerde su contraseña actual | Que el sistema muestre debajo del campo de “Contraseña Actual” un botón de “¿Olvidaste tu contraseña?” que redireccione a la página de recuperacion de cuenta | - |
