# US-ACIA-05: Soporte dentro de la Plataforma

## Información General
- **Identificador:** US-ACIA-05
- **Actor:** Turista/Prestador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
  - El Usuario debe iniciar sesión en el sistema.
- **Historias de Usuario Relacionadas:** US-ACIA-01, US-AYS-03

---

## Descripción General
**Como** Usuario de la plataforma  
**Quiero** preguntarle al asistente cómo usar las funcionalidades del sistema  
**Para** resolver dudas operativas sin tener que consultar el manual de Usuario ni contactar soporte.

---

## Descripción Funcional
El System Prompt del asistente aloja en su definición un bloque de RAG (Retrieval-Augmented Generation) o texto fijo con el mapa de documentación de la app: lógica de pantallas, flujos de navegación y permisos por rol. Cuando el LLM detecta una pregunta sobre el uso de la plataforma, responde basándose exclusivamente en esa documentación sin inventar funcionalidades inexistentes. Si la duda no puede resolverse con la información disponible, el asistente deriva al canal de soporte formal (US-AYS-03) proporcionando el link directo al formulario de contacto. Las respuestas de soporte incluyen cuando es relevante un link directo a la sección de la app mencionada. El contenido de soporte del system prompt es actualizable por el Administrador sin necesidad de re-desplegar el sistema, almacenándose en una tabla de configuración.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Pregunto cómo crear un itinerario | Recibir una explicación de los pasos con links a las secciones correspondientes | - |
| Pregunto por una funcionalidad que no existe en la plataforma | Que el asistente me indique que esa función no está disponible sin inventar instrucciones | - |
| Mi duda no puede resolverse vía chat | Que el asistente me ofrezca el link al formulario de contacto con soporte además de proporcionar los links correspondientes del módulo de “Ayuda y Soporte” | - |
| El Prestador pregunta sobre cómo gestionar su negocio | Respuestas específicas para mi rol y no instrucciones de Turista | - |
| El Administrador actualiza el contenido de soporte | Que el asistente refleje ese cambio en la siguiente conversación sin necesidad de redespliegue | - |
