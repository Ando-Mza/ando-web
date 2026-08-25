# US-GDI-11: Registro de Costos en Viaje

## Información General
- **Identificador:** US-GDI-11
- **Actor:** Turista
- **Puntos de Historia:** 2
- **Precondiciones:**
  - Usuario autenticado.
  - Tener un Itinerario creado.
- **Historias de Usuario Relacionadas:** US-GDI-01, US-GDI-02, US-GDI-10, US-GDI-12

---

## Descripción General
**Como** Turista  
**Quiero** visualizar el estado de mi presupuesto y gestionar todos mis gastos (editar, eliminar o agregar gastos sueltos)  
**Para** llevar un control financiero claro de mi viaje y evitar gastar más de lo planeado.

---

## Descripción Funcional
Entidad auxiliar Gastos anidada a un nodo del itinerario. El backend validará que el tipo de dato sea monetario y permitirá realizar operaciones de agregación (SUM) para devolverle a la vista el estado del presupuesto total.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista ingresa a la pestaña "Presupuesto / Gastos" dentro de su itinerario | El sistema realiza una suma de todos los montos de la tabla RegistroCosto asociados a ese viaje. La interfaz muestra un "Dashboard Financiero" con una barra de progreso que compara el Total Gastado contra el campo presupuestoEstimado del itinerario, y debajo despliega una lista ordenada cronológicamente con todos los gastos registrados. | - |
| El Turista presiona el botón "Agregar Gasto Extra" (para un gasto no asociado a un POI, ej: un taxi o vuelo) | Se abre un formulario solicitando tres datos obligatorios: descripcion (ej. "Taxi al hotel"), monto y la fechaRegistro. Al confirmar, el backend inserta el registro en la tabla RegistroCosto dejando el campo paradaId en NULL, y la interfaz actualiza automáticamente la suma total del dashboard. | - |
| El Turista selecciona un gasto de la lista y presiona "Editar" | El sistema abre el modal con los datos actuales precargados. El Usuario modifica el monto o la descripción y presiona "Guardar". El backend ejecuta un UPDATE sobre ese registro específico en RegistroCosto y el frontend recalcula inmediatamente la barra de presupuesto. | - |
| El Turista decide borrar un gasto por error de tipeo o cancelación, y presiona el ícono de "Eliminar" | El sistema muestra un modal de confirmación: "¿Estás seguro de que deseas eliminar este gasto?". Al confirmar, el backend ejecuta un DELETE físico del registro en RegistroCosto, remueve el ítem de la lista visual y recalcula el monto total gastado en el dashboard. | - |
| El Turista registra o edita un gasto y la suma total de gastos supera el presupuestoEstimado del viaje | El sistema no bloquea la carga del gasto, pero cambia el color de la barra de progreso a rojo y lanza una alerta visual estática en el dashboard: "¡Atención! Has superado tu presupuesto estimado para este viaje." | - |
| El Turista intenta editar o eliminar un gasto de un viaje en el que solo es "Lector" | El sistema valida su rol en la tabla UsuarioItinerario. Al detectar que no es "Creador" ni "Editor", oculta los botones de Agregar, Editar y Eliminar, permitiéndole únicamente ver la lista de gastos en modo de solo lectura. | - |
