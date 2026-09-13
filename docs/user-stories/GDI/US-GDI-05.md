# US-GDI-05: Duplicación de Itinerario

## Información General
- **Identificador:** US-GDI-05
- **Actor:** Turista
- **Puntos de Historia:** 2
- **Precondiciones:**
  - El itinerario origen a duplicar debe existir y pertenecer al Usuario en sesión o ser público (is_public = true).
- **Historias de Usuario Relacionadas:** US-GDI-01, US-GDI-08, US-GDI-07, US-GDI-06

---

## Descripción General
**Como** Turista  
**Quiero** generar una copia de un itinerario existente (mío o comunitario)  
**Para** usarlo como plantilla base y personalizarlo sin empezar desde cero.

---

## Descripción Funcional
Ejecuta una clonación profunda (Deep Copy) en la base de datos. Se debe crear un nuevo registro principal (nuevo UUID), copiar todos los nodos hijos asociados (filtrando y excluyendo obligatoriamente cualquier POI que se encuentre inactivo is_active = false en la base central, recalculando los tiempos de ruta de los nodos puenteados), blanquear el estado de ejecución (poner en "Borrador") y asignar el user_id del Usuario en sesión como el nuevo propietario.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista presiona el botón "Adoptar esta ruta" en un itinerario público | El backend ejecute un proceso de clonación profunda (Deep Copy), cree un nuevo registro en Itinerario eliminando fechas calendario anteriores, asignando "(Copia)" al nombre y redirija a la vista de edición. | - |
| El Turista presiona "Usar esta ruta" sobre un itinerario público de otro Usuario que contiene costos | Al copiar los registros, el backend conserva la estructura lógica pero blanquea (deja en NULL) las fechas absolutas y excluye los datos privados del autor original. | - |
| El Turista es redirigido a su nuevo viaje clonado tras la adopción | El sistema abra la vista de edición del nuevo itinerario mostrando un modal o mensaje destacado: "¡Viaje copiado con éxito! Para comenzar a organizarlo, por favor define la Fecha de Inicio y Fecha de Fin en la configuración." | - |
| Un Usuario malintencionado intercepta la API y envía un POST /duplicate con el ID de un viaje privado de otro Turista | Que el backend valide que el viaje no le pertenece al solicitante y que is_public es false, rechazando la transacción instantáneamente con HTTP 403 Forbidden. | - |
| El itinerario origen contiene una parada en un POI que ha sido marcada como "Cerrada" (is_active = false) | Que el sistema detecte la inactividad del POI durante el clonado, lo excluya automáticamente de la nueva copia, recalcule el tiempo de traslado y muestre una alerta: "Algunos lugares del viaje original ya no están disponibles y fueron removidos de tu copia." | - |
| El Turista intenta presionar el botón "Activar Modo Viaje" en su itinerario recién duplicado | Que el sistema detecte que las fechas absolutas están en blanco y bloquee la acción, resaltando el componente del calendario con el mensaje: "Por favor, selecciona la fecha de inicio para tu nuevo viaje antes de continuar." | - |
| El Turista presiona el botón "Duplicar" en un viaje de su historial | El sistema aplica exactamente la misma lógica de clonación estructural (Deep Copy), permitiendo al Usuario reciclar un viaje viejo para volver a hacerlo en el futuro con nuevas fechas. | - |
