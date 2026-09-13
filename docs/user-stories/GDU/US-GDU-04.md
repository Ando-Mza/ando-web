# US-GDU-04: Eliminar cuenta

## Información General
- **Identificador:** US-GDU-04
- **Actor:** Usuario (Prestador/Turista)
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
  - El Usuario debe tener una sesión activa en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-03

---

## Descripción General
**Como** Usuario  
**Quiero** eliminar mi cuenta  
**Para** dejar de utilizar el servicio y remover mi acceso al sistema

---

## Descripción Funcional
El Usuario, ya sea Prestador o Turista, elimina su cuenta para dejar de utilizar el servicio. En el caso del Prestador, implica la eliminación del POI del catálogo. La baja de la cuenta será lógica.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario accede a la sección de autogestión del perfil propio | Que el sistema muestre un botón para eliminar su cuenta al final del formulario | - |
| El Usuario de tipo Turista selecciona el botón de “Eliminar cuenta” | Que el sistema advierta que al eliminar se perderán los datos de itinerarios creados | - |
| El Usuario de tipo Prestador selecciona el botón de “Eliminar cuenta” | Que el sistema informe que se perderán los datos relacionados a la o las organizaciones pertenecientes al Usuario | - |
| El Usuario selecciona el botón de “Eliminar cuenta” | Que el sistema muestre un cartel de confirmación indicando sobre las consecuencias de la acción. | - |
| Aparezca el mensaje de confirmación para eliminar la cuenta | Que el sistema muestra 2 botones, uno de confirmar y otro de cancelar | - |
| El Usuario seleccione el botón de cancelar la eliminación de cuenta | El sistema mantiene la cuenta activa y muestra una notificación indicando "Operación cancelada" | - |
| El Usuario confirma la eliminación | El sistema elimina/desactiva la cuenta y no pueda volver a ingresar con sus credenciales de acceso | - |
| El Usuario desee eliminar la cuenta | Que el sistema solicite el ingreso de la contraseña actual | - |
| El Usuario ingrese mal su contraseña | Que el sistema informe “Contraseña incorrecta. No se puede verificar su identidad” | - |
| El Usuario no recuerde su contraseña | Que el sistema provea un link de acceso a la pantalla de recuperar cuenta | - |
| El Usuario confirma la eliminación | Que el sistema muestre las siguientes razones de eliminación para tener un feedback: 'No la uso', 'Tuve problemas con la app', 'Tuve problemas con Prestadores', 'No me sirve el contenido', Opinión personal libre | - |
| La eliminación se realiza correctamente | El sistema muestra un cartel de confirmación indicando "La cuenta fue eliminada correctamente" y redireccione a la página de Login | - |
| El Usuario ingresa credenciales incorrectas luego de la acción | El sistema muestra un mensaje de error y no elimina la cuenta | - |
