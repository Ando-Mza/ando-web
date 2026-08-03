# US-GDU-04: Eliminar cuenta

## Historia de Usuario

**Identificación:** US-GDU-04  
**Actor:** Usuario (Prestador/Turista)

### Descripción General
- **Como** Usuario
- **Quiero** eliminar mi cuenta
- **Para** dejar de utilizar el servicio y remover mi acceso al sistema

### Descripción Funcional
El Usuario, ya sea prestador o Turista, elimina su cuenta para dejar de utilizar el servicio. En el caso del prestador, implica la eliminación del POI del catálogo. La baja de la cuenta será lógica.

**Puntos de Historia:** 3

### Precondiciones
- El Usuario debe estar registrado en el sistema.
- El Usuario debe tener una sesión activa en el sistema.

### US Relacionadas
- US-ACC-03

---

## Criterios de Aceptación

| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario accede a la sección de autogestión del perfil propio | Que el sistema muestre un botón para eliminar su cuenta al final del formulario | - |
| El Usuario de tipo Turista selecciona el botón de “Eliminar cuenta” | Que el sistema valide si tiene relacionado un viaje en curso (modo viaje activado). En el caso que lo tenga, primero deberá eliminar el viaje y luego podrá eliminar su cuenta, esto se indica por medio del popup “No puede eliminar su cuenta si tiene un viaje iniciado. Por favor, detenga o elimine el viaje antes de realizar esta acción” | - |
| El Usuario de tipo Prestador selecciona el botón de “Eliminar cuenta” | Que el sistema informe que se perderán los datos relacionados al POI y dejará de estar visible, al menos que se suba por una reseña y se apruebe su estado | - |
| El Usuario selecciona el botón de “Eliminar cuenta” | Que el sistema muestre un cartel de confirmación indicando sobre las consecuencias de la acción | - |
| Aparezca el mensaje de confirmación para eliminar la cuenta | Que el sistema muestre 2 botones, uno de confirmar y otro de cancelar | - |
| El Usuario seleccione el botón de cancelar la eliminación de cuenta | El sistema mantiene la cuenta activa y muestra una notificación indicando "Operación cancelada" | - |
| El Usuario confirma la eliminación | El sistema elimina/desactiva la cuenta y no pueda volver a ingresar con sus credenciales de acceso | - |
| La eliminación se realiza correctamente | El sistema muestra un cartel de confirmación indicando "La cuenta fue eliminada correctamente" y redireccione a la página de Login | - |
| El Usuario ingresa credenciales incorrectas luego de la acción | El sistema muestra un mensaje de error y no elimina la cuenta | - |
