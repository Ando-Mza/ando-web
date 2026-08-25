# US-ACIA-04: Consulta de Estado de Itinerario

## Información General
- **Identificador:** US-ACIA-04
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
  - El Usuario debe iniciar sesión en el sistema.
  - Al menos un itinerario creado.
- **Historias de Usuario Relacionadas:** US-ACIA-03, US-ACIA-05, US-GDI-03, US-GDI-10

---

## Descripción General
**Como** Turista  
**Quiero** preguntarle al asistente sobre el estado y los detalles de mis itinerarios  
**Para** obtener información rápida de mi viaje sin tener que navegar a la sección de itinerarios

---

## Descripción Funcional
Cuando el LLM detecta intención de consulta sobre un itinerario, extrae el identificador del itinerario mencionado por el Usuario (puede ser por nombre o por "mi viaje número X" o "mi próximo viaje"). El backend busca en UsuarioItinerario los itinerarios del Usuario donde tipoInteraccion sea "creador" o "editor". Si la referencia es ambigua (el Usuario dice "mi viaje" sin especificar cuál y tiene más de uno), el asistente lista los últimos itinerarios del Usuario ordenado por fecha de creación más reciente y le pide que especifique. Una vez identificado el itinerario, el backend serializa sus datos: nombre, fechas, estado, cantidad de paradas, próxima parada con su hora estimada, y porcentaje de completitud (paradas completadas / total paradas). Esa información se inyecta como contexto al LLM que la redacta en lenguaje natural. Para consultas de modificación (ver US-GDI-03), el asistente deriva al flujo correspondiente. No se expone información de otros Usuarios del itinerario colaborativo salvo sus nombres de Usuario.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista pregunta por su viaje | Que el asistente muestre el estado actual y las paradas | - |
| El Turista tiene múltiples itinerarios y no especifico cuál consultará | Que el asistente liste 5 opciones ordenadas por fecha de creación más reciente, y pida que seleccione uno | - |
| No tengo ningún itinerario | Que el asistente informe y ofrezca ayuda para crear uno listando las formas de creación de viajes | - |
| El Turista tien un itinerario en modo viaje activo | Que el asistente indique cuál es la próxima parada y a qué hora debería llegar | - |
| Pregunto cuánto me falta para terminar el viaje | Recibir el porcentaje de paradas completadas y las que quedan pendientes | - |
