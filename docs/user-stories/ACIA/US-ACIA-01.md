# US-ACIA-01: Preguntas al Asistente en Lenguaje Natural

## Identificación
* **ID:** US-ACIA-01
* **Título:** Preguntas al Asistente en Lenguaje Natural
* **Puntos de Historia:** 5
* **Actor:** Turista
* **US Relacionadas:** US-ACIA-02, US-ACIA-03, US-ACIA-06, US-ACIA-07

---

## Descripción General
Como **Turista**  
Quiero **poder hacerle preguntas al asistente sobre Mendoza y la plataforma en lenguaje natural**  
Para **obtener respuestas inmediatas sin tener que navegar por menús o leer documentación.**

---

## Descripción Funcional
El usuario escribe una pregunta en el campo de chat. El frontend envía el mensaje al backend junto con el JWT del usuario. El backend recupera la `ConversacionIA` activa del usuario (donde `activa = true`). Si no existe ninguna, crea una nueva con `fechaInicio = now()` y `activa = true`. Recupera los últimos 10 `MensajeIA` de esa conversación ordenados por `fechaCreacion` ascendente. 

Construye el array de mensajes para la API del LLM con el siguiente orden: system prompt fijo que define al asistente como experto turístico de Mendoza con restricción explícita de no responder temas fuera del dominio turístico, historial de los últimos 10 mensajes, mensaje nuevo del usuario. 

Llama a la API del LLM con modelo Haiku/mini. Persiste el mensaje del usuario y la respuesta como dos nuevos registros en `MensajeIA` con sus respectivos rol y `tokensUsados`. Incrementa `cantidadMensajes` y `totalTokensUsados` en `ConversacionIA`. Devuelve la respuesta al frontend. 

Si la pregunta está fuera del dominio turístico o de la plataforma, el LLM responde con un mensaje predefinido en el system prompt indicando que solo puede ayudar con temas de turismo en Mendoza.

---

## Precondiciones
1. El usuario debe estar registrado en el sistema.
2. El usuario debe haber iniciado sesión en el sistema.
3. El campo de texto debe tener un mínimo de 1 carácter y un máximo de 500 caracteres.

---

## Criterios de Aceptación

| Escenario / Acción (Cuando) | Comportamiento Esperado (Espero) | Componente / Pantalla |
| :--- | :--- | :--- |
| El Turista envía una pregunta sobre turismo en Mendoza. | El sistema le devuelve una respuesta en menos de 10 segundos. | Chat del Asistente |
| El Turista envía una pregunta fuera del dominio turístico. | El asistente le indica amablemente que solo puede ayudar con temas de turismo en Mendoza, sin salir de su rol. | Chat del Asistente |
| El texto ingresado en el campo supera los 500 caracteres. | El botón de envío se deshabilita automáticamente y se muestra un contador de caracteres en color rojo. | Chat del Asistente / Input |
| La API del LLM no responde en un máximo de 15 segundos (Timeout). | El sistema despliega un mensaje de error amigable sugiriendo reintentar la consulta. | Chat del Asistente / Alertas |
| El Turista intenta enviar un mensaje completamente vacío. | El sistema previene el envío y no ejecuta ninguna llamada de red al backend. | Chat del Asistente / Input |
| El Turista envía un mensaje pero no tiene una conversación previa activa. | El sistema crea automáticamente una nueva instancia de conversación en segundo plano sin requerir acciones extra del usuario. | Chat del Asistente / Flujo Inicial |
