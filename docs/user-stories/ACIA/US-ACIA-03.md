# US-ACIA-03: Creación de Itinerario desde el Chat

## Identificación
* **ID:** US-ACIA-03
* **Título:** Creación de Itinerario desde el Chat
* **Puntos de Historia:** 8
* **Actor:** Turista
* **US Relacionadas:** US-ACIA-01, US-ACIA-04, US-GDI-02, US-MRIA-06

---

## Descripción General
Como **Turista**  
Quiero **pedirle al asistente que me ayude a crear un itinerario describiendo lo que quiero hacer**  
Para **generar un viaje planificado sin tener que usar el formulario de creación paso a paso.**

---

## Descripción Funcional
Cuando el LLM detecta intención de creación de itinerario en el mensaje del usuario, extrae los parámetros necesarios en formato JSON con el schema `{ fechaInicio: date, fechaFin: date, cantidadPersonas: int, presupuesto: string, categorias: string[], descripcion: string }`. 

Si algún parámetro obligatorio está ausente (ej. `fechaInicio`, `fechaFin`), el asistente responde solicitando esa información específica al usuario antes de continuar, manteniendo el contexto en el historial de la conversación. 

Una vez que tiene todos los parámetros necesarios, el backend invoca el mismo flujo interno de la **US-GDI-02 (Creación Asistida por IA)** pasando esos parámetros extraídos. El resultado es un borrador de itinerario creado en la base de datos con estado `"borrador"`. 

El asistente responde al usuario confirmando la creación, mostrando un resumen del itinerario generado (días, paradas principales) y un botón o link directo que navega al itinerario creado para que el usuario pueda revisarlo y modificarlo. El itinerario creado desde el chat queda marcado con `creadoPorIA = true` y en `UsuarioItinerario` con `tipoInteraccion = "creador"`.

---

## Precondiciones
1. El usuario debe estar registrado en el sistema.
2. El usuario debe haber iniciado sesión en el sistema.
3. Deben estar presentes al menos `fechaInicio` y `fechaFin` (ya sea en el mensaje actual o en el historial de la conversación activa).

---

## Criterios de Aceptación

| Escenario / Acción (Cuando) | Comportamiento Esperado (Espero) | Componente / Pantalla |
| :--- | :--- | :--- |
| El Turista describe su viaje ideal incluyendo fechas y preferencias. | El asistente crea un itinerario borrador y devuelve un resumen visual con un link directo al itinerario. | Chat del Asistente / Resumen Itinerario |
| El Turista no incluye las fechas de viaje en su mensaje inicial. | El asistente le solicita de forma conversacional que indique las fechas específicas antes de proceder a la creación del itinerario. | Chat del Asistente / Validación |
| El proceso de creación del itinerario en el backend demora más de 5 segundos. | El sistema muestra un mensaje o indicador visual de "cargando", avisando que se está generando el plan para evitar frustración. | Chat del Asistente / Loading State |
| El itinerario se crea exitosamente en la base de datos. | El usuario puede acceder directamente al itinerario desde la burbuja del chat interactuando (tap) sobre la tarjeta. | Chat del Asistente / Tarjeta de Itinerario |
| La creación del itinerario falla por un error interno o del servidor. | El asistente le informa cordialmente del error técnico y le sugiere intentarlo utilizando el formulario de creación manual de la app. | Chat del Asistente / Error de Creación |
