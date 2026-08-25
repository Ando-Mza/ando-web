# US-ACIA-01: Respuesta a Consultas Frecuentes

## Información General
- **Identificador:** US-ACIA-01
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
  - El Usuario debe iniciar sesión en el sistema.
  - Campo de texto con mínimo 1 carácter y máximo 500 caracteres.
- **Historias de Usuario Relacionadas:** US-ACIA-02, US-ACIA-03, US-ACIA-06, US-ACIA-07, US-AYS-02

---

## Descripción General
**Como** Turista  
**Quiero** poder hacerle preguntas al asistente sobre Mendoza y la plataforma en lenguaje natural  
**Para** obtener respuestas inmediatas sin tener que navegar por menús o leer documentación

---

## Descripción Funcional
El Usuario escribe una pregunta en el campo de chat. El frontend envía el mensaje al backend junto con el JWT del Usuario. El backend recupera la ConversacionIA activa del Usuario (donde activa = true). Si no existe ninguna, crea una nueva con fechaInicio = now() y activa = true. Recupera los últimos 10 MensajeIA de esa conversación ordenados por fechaCreacion ascendente. Construye el array de contexto para el LLM con el siguiente orden: system prompt fijo que define al asistente como experto turístico de Mendoza con restricción explícita de no responder temas fuera del dominio turístico, historial de los últimos 10 mensajes, mensaje nuevo del Usuario. Llama a la API del LLM. Persiste el mensaje del Usuario y la respuesta como dos nuevos registros en MensajeIA con sus respectivos rol y tokensUsados. Incrementa cantidadMensajes y totalTokensUsados en ConversacionIA. Devuelve la respuesta al frontend. Si la pregunta está fuera del dominio turístico o de la plataforma, el LLM responde con un mensaje predefinido en el system prompt indicando que solo puede ayudar con temas de turismo en Mendoza.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Envío una pregunta sobre turismo en Mendoza | Recibir una respuesta en menos de 10 segundos | - |
| Envío una pregunta fuera del dominio turístico | Que el asistente me indique amablemente que solo puede ayudar con temas de turismo en Mendoza | - |
| El campo de texto supera los 500 caracteres | Que el botón de envío esté deshabilitado y se muestre un contador de caracteres en rojo | - |
| La API del LLM no responde en 15 segundos | Ver un mensaje de error amigable sugiriendo reintentar | - |
| Envío un mensaje vacío | Que no se ejecute ninguna llamada al backend | - |
| La conversación no existe | Que se cree automáticamente sin que yo tenga que hacer ninguna acción | - |
