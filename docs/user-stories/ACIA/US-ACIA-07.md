# US-ACIA-07: Historial Conversacional

## Información General
- **Identificador:** US-ACIA-07
- **Actor:** Turista
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
  - El Usuario debe iniciar sesión en el sistema.
  - Conversación activa existente con al menos un mensaje previo.
- **Historias de Usuario Relacionadas:** US-ACIA-01, US-ACIA-03, US-ACIA-04

---

## Descripción General
**Como** Turista  
**Quiero** que el asistente recuerde lo que hablamos durante la sesión activa  
**Para** no tener que repetir información que ya proporciona en mensajes anteriores del mismo chat.

---

## Descripción Funcional
El sistema gestiona el contexto enviado al LLM incluyendo un tope de los últimos 10 pares de mensajes (intercambios entre Usuario y asistente), dando prioridad a los registros más recientes. En los casos donde el diálogo exceda los 20 mensajes en total (cantidadMensajes > 20), se procederá a truncar los envíos al modelo para los mensajes más antiguos; no obstante, estos permanecerán almacenados en la base de datos para garantizar la integridad de la consulta histórica. Al producirse un cierre de sesión o ante la solicitud explícita de una nueva interacción, el sistema marcará la conversación vigente como inactiva, registrando la fechaFin actual. Consecuentemente, el inicio de una sesión posterior generará una instancia de ConversacionIA limpia, sin arrastrar antecedentes. El Usuario retiene la facultad de reiniciar el chat manualmente mediante el botón "Nueva conversación", acción que también finalizará el estado activo de la charla previa.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Envío un mensaje que hace referencia a algo que dije antes en el mismo chat | Que el asistente entienda la referencia sin que yo repita el contexto (siempre y cuando este en los últimos 20 mensajes de IA + user) | - |
| La conversación supera los 20 mensajes | Que el asistente siga respondiendo coherentemente aunque no recuerde los mensajes más antiguos | - |
| Cierro sesión y vuelvo a entrar | Que el chat comience limpio sin historial de la sesión anterior | - |
| Hago click en "Nueva conversación" | Que el chat se limpie visualmente y el asistente no recuerde nada de la conversación anterior | - |
| Tengo una conversación activa y abro el chat | Ver los mensajes de esa sesión tal como los dejé | - |
