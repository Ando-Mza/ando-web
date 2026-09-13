# US-GDU-02: Autogestión de Perfil Propio como Prestador

## Información General
- **Identificador:** US-GDU-02
- **Actor:** Prestador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Prestador debe estar registrado en el sistema.
  - El Prestador debe tener una sesión activa en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-ACC-04, US-GDU-04

---

## Descripción General
**Como** Prestador  
**Quiero** modificar la información de mi perfil  
**Para** mantener actualizada la información comercial

---

## Descripción Funcional
El sistema debe permitir que los Prestadores modifiquen su información personal manteniendo las respectivas validaciones de formato.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador seleccione el botón de “Editar perfil” | Que el sistema muestre un formulario similar al de creación de cuenta con los campos completos por la información del perfil: Nombre Organización o Razón Social, Nombre POI, Descripción, Categoría, Servicio Ofrecido, Contacto, Ubicación, Logo, Imágenes de POI. En el caso que tenga más de un POI debe aparecer previo al formulario un modal que pregunte cual POI desea modificar, listando sus POI relacionados. El mismo se selecciona y luego se muestran los campos. | - |
| El Prestador deje los campos obligatorios vacíos del formulario | Que el sistema impida guardar cambios | - |
| El Prestador cancele la edición de sus datos personales | Que el sistema descarte los cambios y muestre un mensaje de confirmación | - |
| El Prestador seleccione “Guardar los cambios” | Que los nuevos datos se almacenen correctamente | - |
| El Prestador seleccione “Guardar” los cambios | Que el sistema muestre un mensaje de confirmación que diga “¿Desea guardar los cambios realizados sobre el Usuario?” | - |
| El Prestador seleccione “Confirmar cambios” | Espero que se muestre el mensaje “Perfil actualizado correctamente” | - |
| El Prestador seleccione “Cancelar” | Espero que se muestre el mensaje “Los cambios se descartarán si confirma esta acción ¿Está seguro que desea deshacer los cambios?” | - |
| El Prestador seleccione “Confirmar” | Espero que se redireccione el Usuario a la página principal | - |
