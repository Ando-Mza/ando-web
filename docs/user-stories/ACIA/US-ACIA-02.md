# US-ACIA-02: Recomendación de POIs en Lenguaje Natural

## Identificación
* **ID:** US-ACIA-02
* **Título:** Recomendación de POIs en Lenguaje Natural
* **Puntos de Historia:** 8
* **Actor:** Turista
* **US Relacionadas:** US-ACIA-01, US-MRIA-01, US-MRIA-09, US-GIT-XX

---

## Descripción General
Como **Turista**  
Quiero **pedirle recomendaciones al asistente describiendo lo que busco con mis propias palabras**  
Para **recibir sugerencias personalizadas de POIs sin tener que usar filtros manuales.**

---

## Descripción Funcional
Cuando el backend detecta que el mensaje del usuario tiene intención de recomendación (esto se determina en el system prompt instruyendo al LLM a identificar intenciones), el flujo se extiende con un paso adicional antes de llamar al LLM para generar la respuesta final. 

El backend primero llama al LLM con un prompt de extracción pidiendo que devuelva exclusivamente un JSON con el schema `{ categorias: string[], precioMax: string, zona: string, duracion: int }` a partir del mensaje del usuario. 

Con esos parámetros extraídos ejecuta una consulta real a la tabla `POI` con los filtros correspondientes usando PostGIS si hay zona, filtro de categoría via `CategoriaPOI`, y rango de precio. Toma los primeros 5 resultados. Los serializa como contexto adicional y los inyecta en el array de mensajes antes de la llamada final al LLM, que redacta la respuesta en lenguaje natural mencionando esos POIs reales. 

Si la extracción de parámetros devuelve un JSON inválido o vacío, se omite la consulta a BD y el LLM responde con recomendaciones generales basadas en su conocimiento del system prompt, sin inventar datos específicos. Los POIs mencionados en la respuesta incluyen un link directo a su ficha dentro de la app. 

---

## Precondiciones
1. El usuario debe estar registrado en el sistema.
2. El usuario debe haber iniciado sesión en el sistema.
3. Deben existir POIs en estado "aprobado" en la base de datos.

---

## Criterios de Aceptación

| Escenario / Acción (Cuando) | Comportamiento Esperado (Espero) | Componente / Pantalla |
| :--- | :--- | :--- |
| El Turista pide recomendaciones de bodegas económicas. | El asistente le menciona POIs reales de la base de datos que correspondan a bodegas y tengan un nivel de precio bajo o moderado. | Chat del Asistente / Recomendación |
| La extracción automática de parámetros desde el mensaje falla (ej. JSON inválido o vacío). | El sistema responde de manera fluida con sugerencias generales basadas en el LLM, sin mostrar errores técnicos ni inventar datos específicos (alucinaciones). | Chat del Asistente / Flujo LLM |
| El asistente menciona un Punto de Interés (POI) en su respuesta. | El mensaje del asistente incluye un link o tarjeta interactiva (tappable) que redirige directamente al Turista a la ficha de detalle de ese POI. | Chat del Asistente / Tarjeta de POI |
| No existen POIs en la base de datos que cumplan estrictamente con todos los filtros extraídos. | El asistente indica amablemente la situación, sugiere relajar alguno de los criterios y presenta los POIs que tengan mayor nivel de coincidencia. | Chat del Asistente / Recomendación vacía |
| El Turista solicita recomendaciones generales sin especificar categorías ni filtros concretos. | El asistente obtiene las preferencias del perfil del usuario y las inyecta como contexto adicional para personalizar las sugerencias. | Chat del Asistente / Personalización |
