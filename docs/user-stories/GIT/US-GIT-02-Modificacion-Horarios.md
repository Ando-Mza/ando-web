# US-GIT-02: Modificación de días y horarios de un POI

## Información General
*   **Identificador:** US-GIT-02
*   **Actor:** Prestador
*   **Puntos de Historia:** 2
*   **Precondiciones:**
    *   El Prestador de servicio debe estar autenticado con rol de Prestador.
    *   El POI debe tener al menos un Día y Horario del POI previamente cargados.
*   **Historias de Usuario Relacionadas:** US-ACC-02, US-ACC-03, US-GIT-01

---

## Descripción General
Como Prestador,
quiero modificar los días y horarios de atención de un POI,
para que la información disponible para los turistas siempre esté actualizada ante cualquier cambio operativo.

---

## Descripción Funcional
El Prestador de servicio accede a la gestión de horarios de un POI existente y visualiza la lista de horarios cargados. Al tocar la opción de editar un registro, el sistema abre el modal "Modificar Horario" precargando el día y las horas de apertura y cierre actuales.

El Prestador puede ajustar el día mediante el selector horizontal responsivo, las horas mediante el selector híbrido (`HybridTimePicker` con rueda o teclado) o los accesos rápidos a turnos habituales (Mañana: 09:00-13:30, Tarde: 16:00-20:00, Noche: 20:00-00:00, Corrido: 09:00-18:00).

Al guardar, el sistema aplica las mismas validaciones en tiempo real (apertura < cierre y no superposición) y actualiza la información pública. Si el cambio afecta itinerarios previamente armados por turistas, el sistema notifica a los afectados y marca la parada como "requiere revisión".

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador selecciona editar un horario, modifica el día o las horas y presiona "Guardar" | El sistema actualiza el registro y muestra el mensaje "Horario guardado exitosamente" | Modal Modificar Horario (`GITDashboardScreen`) |
| El cambio de horario altera la ventana de visita de un itinerario ya generado por un Turista | El sistema notifica al Turista afectado que revise su itinerario y marca la parada del POI en el itinerario como "requiere revisión" | Pantalla de Notificaciones / Detalle de Itinerario |
| El Prestador ingresa un rango inválido (apertura >= cierre o superpuesto con otro turno del día) | El sistema aplica las validaciones en tiempo real, muestra el mensaje de error en rojo y deshabilita el botón "Guardar" | Modal Modificar Horario (`GITDashboardScreen`) |
| El Prestador presiona "Cancelar", el ícono "✕" o toca fuera del modal | El modal se cierra descartando los cambios no guardados | Modal Modificar Horario (`GITDashboardScreen`) |
