# US-GIT-01: Carga de días y horarios de un POI

## Información General
- **Identificador:** US-GIT-01
- **Actor:** Prestador
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El Prestador debe estar autenticado con rol de Prestador.
  - El POI debe existir previamente en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-CYN-02, US-GIT-02, US-GIT-03, US-GIT-04, US-GIT-08, US-GDI-01, US-GDI-02, US-MRIA-04, US-MRIA-06, US-NYA-02

---

## Descripción General
**Como** Prestador  
**Quiero** cargar los días y horarios de atención de un POI  
**Para** que los Turistas puedan conocer cuándo pueden visitarlo y el sistema pueda incluirlo en itinerarios viables.

---

## Descripción Funcional
El Prestador accede al detalle de un POI existente y selecciona la opción de gestión de horarios. El sistema presenta un formulario donde puede definir los días y un horario de atención (horaDesde - horaHasta). El sistema debe validar que horaHasta sea posterior a horaDesde. El Prestador puede agregar múltiples combinaciones de rango de días y horario para un mismo POI, permitiendo modelar distintas configuraciones según el día. Una vez guardados, los horarios quedan disponibles para ser consultados por los Turistas y utilizados por el motor de recomendación para filtrar POIs disponibles según la fecha y hora del itinerario.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador selecciona un día y el horarioDesde y horarioHasta de ese día, luego presiona el botón “guardar” | El sistema almacena el Días y Horarios asociados al POI y muestra un popup "Horario guardado exitosamente" | - |
| El Prestador ingresa una horaHasta anterior o igual a horaDesde | El sistema muestra “El horario de apertura (horario seleccionado) no puede ser posterior o igual al horario de cierre (horario seleccionado).” y no permite hacer click en el botón “guardar” | - |
| El Prestador guardo el horario y rango de días correctamente | Los horarios quedan visibles en el perfil público del POI para los Turistas | - |
| El Prestador abre el modal de "Cargar Horario" desde su dispositivo móvil (celular) y desee seleccionar un día de la semana | Que el sistema muestre las opciones horizontalmente con la posibilidad de desplazarse (de derecha a izquierda) para ver y seleccionar cualquiera de los 7 días (Dom, Lun, Mar, Mié, Jue, Vie, Sáb) | - |
| El Prestador selecciona un día de la semana para registrar su horario de atención | Que el día seleccionado se muestra resaltado y los valores de hora de apertura y cierre se ajusten al día seleccionado | - |
| El Prestador intenta cargar un rango de horarios de un día que se superpone con un rango de horarios ya existente para ese mismo día | El sistema detecta el conflicto y muestra "El rango de horarios para el día [día de semana] se superpone con un rango de horarios ya definido para este día y POI" y no permite hacer click en el botón “guardar” | - |
| El Prestador seleccione “Agregar” en la sección de “Días y Horarios de Atención” | El sistema muestre un modal donde permita seleccionar un día de la semana y su respectivo horario de atención | - |
| El Prestador acceda a “Cargar Horarios” e ingrese el horario de apertura y de cierre | El sistema solo permita ingresar números y en formato de hora de 24 horas o sistema internacional | - |
| El Prestador acceda a “Cargar Horarios” | El sistema muestre un acceso rápido para completar los campos de horario de apertura y de cierre según el estándar de la provincia, definiéndose así las siguientes franjas: Mañana: 09:00 - 13:30, Tarde: 16:00 - 20:00, Noche: 20:00 - 00:00, Corrido: 09:00 - 18:00 | - |
| El Prestador interactúa con los horarios desplazando la rueda vertical de horas o minutos | Que el sistema actualice visualmente el valor seleccionado en formato de 24 hs (HH:mm). | - |
| El Prestador está en el selector de horario y toque algún dígito del horario central resaltado | Que el sistema despliega el teclado numérico, desenfocar/atenuar el fondo del selector y permitir el tipeo directo de las horas y minutos y que la rueda desplazable se ajuste automáticamente para reflejar el nuevo valor ingresado. | - |
| El Prestador escribe el horario sin utilizar el selector | Que el teclado se esconda tras completar los 4 dígitos correspondientes a la hora (HH:mm) | - |
| El Prestador escribe el horario sin utilizar el selector y escribe algo erróneo | Que el sistema corrige automáticamente siguiendo las siguientes reglas: Minutos mayores a 59 se corrigen a 59, Horas mayores a 23 se corrigen a 23, Los valores del selector están acotados exactamente de 00 a 23 para horas y de 00 a 59 para minutos. | - |
