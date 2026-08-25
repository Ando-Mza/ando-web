# US-GDI-09: Publicar Itinerario en la Comunidad

## Información General
- **Identificador:** US-GDI-09
- **Actor:** Turista
- **Puntos de Historia:** 3
- **Precondiciones:** Usuario autenticado.
- **Historias de Usuario Relacionadas:** US-GDI-01, US-GDI-02, US-GDI-12, US-GDI-08

---

## Descripción General
**Como** Turista  
**Quiero** publicar mi itinerario personal en el catálogo de la comunidad  
**Para** que otros Usuarios puedan verlo, inspirarse y adoptarlo para sus propios viajes.

---

## Descripción Funcional
El creador accede a un itinerario en estado "activo" o "finalizado" y selecciona "Publicar en la comunidad". El sistema valida que el itinerario tenga al menos 2 paradas en total. Si la validación pasa, se actualiza esPublico = true. El sistema solicita al Usuario que seleccione las categorías que representan el itinerario (máximo 5), que se persisten en ItinerarioCategoria. El itinerario publicado es visible inmediatamente en el catálogo. El creador puede retirar la publicación en cualquier momento cambiando esPublico = false, lo que lo saca del catálogo pero no afecta las copias ya realizadas por otros Usuarios.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista se encuentra en el detalle de su itinerario válido y presiona "Publicar en Comunidad" | Se abre un modal pidiendo al Usuario que asigne las categorías que más describen ese Itinerario con un máximo de 5 categorías seleccionables. | - |
| El Turista no asigna ninguna categoría y le da a publicar | Se bloquea el botón de continuar y se le pide al Usuario que escoja al menos 1 categoría para continuar. | - |
| El Turista asigna las categorías y le da a publicar | Se despliega un modal de confirmación informativo que le indica al Usuario: "Tu ruta, lugares y notas serán visibles para todos. Tus datos privados y gastos registrados se mantendrán ocultos. ¿Deseas continuar?" | - |
| El Turista confirma la advertencia | El backend actualiza esPublico = true en la tabla Itinerario, muestra un mensaje de éxito "¡Tu viaje ya es público!" y el itinerario pasa a estar indexado inmediatamente en el buscador. | - |
| El Turista intenta publicar un itinerario que tiene menos de 2 POIs asignados | El sistema bloquea la acción localmente y lanza un Toast: "Tu viaje debe tener al menos 2 paradas organizadas para poder publicarlo en la comunidad." | - |
| El Turista decide privatizar un viaje que ya había publicado previamente (presiona "Dejar de publicar") | El backend actualiza esPublico = false, lo remueve instantáneamente del catálogo comunitario pero conserva intactos los valores históricos de vecesCopiado y puntuacionPromedio. | - |
| Un Usuario que tiene rol de "Colaborador/Editor" (no Owner) intenta publicar el itinerario | El sistema valida en UsuarioItinerario que el Usuario no es el "Creador" original, bloquea el botón de publicación y muestra el mensaje: "Solo el creador original puede hacer público este viaje." | - |
