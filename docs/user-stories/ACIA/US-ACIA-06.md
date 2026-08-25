# US-ACIA-06: Respuestas Multilenguaje

## Información General
- **Identificador:** US-ACIA-06
- **Actor:** Turista
- **Puntos de Historia:** 2
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
  - El Usuario debe iniciar sesión en el sistema.
  - Campo idioma configurado en el perfil del Usuario.
- **Historias de Usuario Relacionadas:** US-ACIA-01, US-CYP-02

---

## Descripción General
**Como** Turista internacional  
**Quiero** que el asistente me responda en el idioma que tengo configurado en mi perfil  
**Para** poder interactuar con la plataforma en mi idioma nativo sin barreras de comunicación.

---

## Descripción Funcional
Al construir el array de mensajes para la API del LLM, el backend lee el campo idioma de la tabla Usuario del Usuario autenticado. Si el idioma es distinto de "es" (español), agrega una instrucción explícita al system prompt indicando que todas las respuestas deben estar en ese idioma. El campo idioma usa códigos ISO 639-1 (es, en, pt, fr, it, de). Si el campo idioma del Usuario es nulo o tiene un código no soportado, el sistema usa español por defecto. El Usuario puede cambiar su idioma desde la configuración del perfil en cualquier momento, lo que afecta inmediatamente a los nuevos mensajes sin necesidad de reiniciar la conversación. Los mensajes previos en el historial mantienen el idioma en que fueron escritos originalmente.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Tengo el idioma configurado en inglés | Que todas las respuestas del asistente estén en inglés independientemente del idioma en que escriba | - |
| Cambio el idioma en mi perfil | Que el siguiente mensaje que envíe sea respondido en el nuevo idioma | - |
| Mi idioma configurado no está entre los soportados | Que el asistente responda en español sin mostrar error | - |
| El campo idioma es nulo | Que el asistente responda en español por defecto | - |
| El historial tiene mensajes en un idioma anterior | Que esos mensajes no cambien de idioma retroactivamente | - |
