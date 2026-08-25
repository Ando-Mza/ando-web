# US-CYN-04: Validación Comunitaria

## Información General
- **Identificador:** US-CYN-04
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Turista debe estar autenticado en el sistema.
  - El POI debe haber sido cargado previamente por otro Usuario o Prestador.
  - El POI debe encontrarse en estado “Pendiente de validación comunitaria”.
  - El POI debe haber superado la validación técnica inicial del sistema.
- **Historias de Usuario Relacionadas:** US-CYN-01, US-CYN-02, US-CYN-05, US-CYN-08, US-GIT-07, US-GYM-01, US-NYA-05, US-PAD-05

---

## Descripción General
**Como** Turista  
**Quiero** validar o reportar POIs propuestos por otros Usuarios  
**Para** colaborar con la verificación de la información turística cargada en la plataforma y mejorar la calidad del catálogo de Ando.

---

## Descripción Funcional
El sistema debe permitir que los Turistas registrados participen en la validación comunitaria de POIs cargados por otros Usuarios o Prestadores. Los POIs que hayan superado la validación técnica inicial quedarán disponibles en una sección de “Validación Comunitaria”, donde los Usuarios podrán visualizar su información principal, como nombre, categoría, ubicación, descripción, horarios e imágenes.
El Turista podrá confirmar que la información es correcta o reportar inconsistencias, indicando un motivo. Cada validación quedará registrada con el Usuario, fecha y tipo de acción realizada. El sistema deberá impedir que un Usuario valide más de una vez el mismo POI o que valide un POI cargado por sí mismo.
Cuando un POI alcance la cantidad mínima definida de validaciones positivas, por ejemplo 10, cambiará su estado a “Validado por la comunidad” y quedará disponible para la revisión formal del Administrador. En caso de recibir reportes reiterados, el POI quedará marcado como “Observado por la comunidad” para que el Administrador lo revise con prioridad.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista accede a la sección “Validación Comunitaria” | Que el sistema muestre un listado de POIs pendientes de validación comunitaria | - |
| El Turista selecciona un POI pendiente | Que el sistema muestre el detalle del POI con nombre, categoría, ubicación, descripción, horarios, imágenes y Usuario que lo propuso | - |
| El Turista visualiza el detalle del POI | Que el sistema muestre las opciones “Confirmar información” y “Reportar inconsistencia” | - |
| El Turista confirma que la información del POI es correcta | Que el sistema registre una validación positiva asociada al Usuario y muestre el mensaje “Validación registrada correctamente” | - |
| El Turista reporta una inconsistencia | Que el sistema solicite seleccionar o ingresar un motivo del reporte antes de guardar | - |
| El Turista completa el motivo del reporte y confirma | Que el sistema registre el reporte asociado al POI y muestre el mensaje “Reporte registrado correctamente” | - |
| El Turista intenta validar un POI que él mismo cargó | Que el sistema no permita la acción y muestre el mensaje “No podés validar un POI cargado por vos mismo” | - |
| El Turista intenta validar dos veces el mismo POI | Que el sistema bloquee la acción y muestre el mensaje “Ya realizaste una validación sobre este POI” | - |
| El POI alcanza 10 valoraciones positivas | Que el sistema cambie su estado a “Validado por la comunidad” | - |
| El POI pasa a estado “Validado por la comunidad” | Que el sistema lo deje disponible para validación formal del Administrador | - |
| El POI recibe una cantidad elevada de reportes comunitarios | Que el sistema cambie su estado a “Observado por la comunidad” y lo priorice para revisión administrativa | - |
| El Turista consulta el listado de POIs pendientes luego de validar uno | Que el POI validado ya no aparezca como pendiente para ese Usuario | - |
