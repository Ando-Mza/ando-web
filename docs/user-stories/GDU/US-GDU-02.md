# US-GDU-02: Autogestión de Perfil Propio como Prestador

## Historia de Usuario

- **Identificación:** US-GDU-02
- **Actor:** Prestador

### Descripción General
- **Como** Prestador 
- **Quiero** modificar la información de mi tienda o servicio
- **Para** mantener actualizada la información comercial

### Descripción Funcional
El sistema debe permitir que los Prestadores modifiquen su información personal manteniendo las respectivas validaciones de formato.

- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Prestador debe estar registrado en el sistema.
  - El Prestador debe tener una sesión activa en el sistema.
- **US Relacionada:** US-ACC-02, US-ACC-03

## Criterios de Aceptación

| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador seleccione el botón de “Editar información POI” | Que el sistema muestre un formulario similar al de creación de cuenta con los campos completos por la información del perfil:<br>- Nombre Organización o Razón Social<br>- Nombre POI<br>- Descripción<br>- Categoría<br>- Servicio Ofrecido<br>- Contacto<br>- Ubicación<br>- Logo<br>- Imágenes de POI<br>- Contraseña<br><br>En el caso que tenga más de un POI debe aparecer previo al formulario un modal que pregunte cual POI desea modificar, listando sus POI relacionados. El mismo se selecciona y luego se muestran los campos. | - |
| El Prestador deje los campos obligatorios vacíos del formulario | Que el sistema impida guardar cambios | - |
| El Prestador cancele la edición de sus datos personales | Que el sistema descarte los cambios y muestre un mensaje de confirmación | - |
| El Prestador seleccione “Guardar los cambios” | Que los nuevos datos se almacenen correctamente | - |
| El Prestador seleccione “Guardar” los cambios | Que el sistema muestre un mensaje de confirmación que diga “¿Desea guardar los cambios realizados sobre el Usuario?” | - |
| El Prestador seleccione “Confirmar cambios” | Espero que se muestre el mensaje “Perfil actualizado correctamente” | - |
| El Prestador seleccione “Cancelar” | Espero que se muestre el mensaje “Los cambios se descartarán si confirma esta acción ¿Está seguro que desea deshacer los cambios?” | - |
| El Prestador seleccione “Confirmar” | Espero que se redireccione el Usuario a la página principal | - |
| El Prestador decida cambiar su contraseña | Que el sistema le solicite ingresar la contraseña actual, una nueva contraseña y la confirmación de la misma, validando que coincidan y cumplan las políticas de seguridad | - |
