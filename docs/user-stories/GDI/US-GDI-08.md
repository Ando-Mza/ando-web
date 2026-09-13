# US-GDI-08: Explorar Itinerarios Comunitarios

## Información General
- **Identificador:** US-GDI-08
- **Actor:** Turista
- **Puntos de Historia:** 2
- **Precondiciones:**
  - Usuario autenticado.
  - Existencia de al menos un itinerario con esPublico = true.
- **Historias de Usuario Relacionadas:** US-GDI-05, US-GDI-09, US-MRIA-10

---

## Descripción General
**Como** Turista  
**Quiero** explorar itinerarios públicos exitosos creados por la comunidad  
**Para** inspirarme, ver recorridos probados y decidir si quiero adoptar alguno.

---

## Descripción Funcional
El sistema despliega un catálogo comunitario paginado mediante una consulta a la tabla Itinerario donde esPublico = true y su estadoId corresponda a "activo" o "finalizado". El listado se ordena por defecto por vecesCopiado en forma descendente. El motor de búsqueda permite al Usuario aplicar filtros combinados de: rango de días, presupuesto estimado, categorías y ubicación geográfica. El DTO de la tarjeta expone: nombre, descripcion, duración en días, zona, cantidad de paradas totales, vecesCopiado, puntuacionPromedio, y alias del autor. Si el autor fue dado de baja, el DTO enmascara el autor con "Usuario eliminado". Al seleccionar una tarjeta, se accede en modo de Solo Lectura.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista ingresa a la sección "Comunidad" sin aplicar filtros | El sistema realiza una consulta filtrando por esPublico = true, y devuelve una lista paginada de viajes ordenados por vecesCopiado (los más populares primero). | - |
| El Turista utiliza la barra de búsqueda o aplica filtros (ej. duración, zona o categorías) | El sistema actualiza dinámicamente el listado consultando la base de datos con los parámetros ingresados. | - |
| El Turista aplica filtros que no devuelven ningún resultado | El sistema muestra la pantalla vacía con una ilustración y el mensaje: "No encontramos viajes públicos con esos filtros. ¡Intenta con otra búsqueda!", sin arrojar errores. | - |
| El Turista selecciona la tarjeta de un itinerario comunitario para ver más información | El sistema abre la vista de "Detalle del Viaje Público" (Modo solo lectura) mostrando la ruta completa, pero ocultando cualquier dato privado del creador. | - |
| Cuando el autor del itinerario eliminó su cuenta | Espero ver el itinerario igual pero con "Usuario eliminado" en lugar del nombre. | - |
| El Turista, estando en el detalle del viaje comunitario, presiona el botón "Adoptar esta ruta" | El sistema incrementa en +1 el campo vecesCopiado y delega la acción a la lógica de duplicación (US-GDI-05) que creará la copia en el perfil del Turista. | - |
