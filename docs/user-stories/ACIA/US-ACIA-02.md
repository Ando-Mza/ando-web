# US-ACIA-02: Recomendación Conversacional

## Información General
- **Identificador:** US-ACIA-02
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
  - El Usuario debe iniciar sesión en el sistema.
  - POIs en estado "aprobado" existentes en la BD.
- **Historias de Usuario Relacionadas:** US-ACIA-01, US-MRIA-01, US-MRIA-08, US-CYP-05

---

## Descripción General
**Como** Turista  
**Quiero** pedirle recomendaciones al asistente describiendo lo que busco con mis propias palabras  
**Para** recibir sugerencias personalizadas de POIs sin tener que usar filtros manuales

---

## Descripción Funcional
Cuando el backend detecta que el mensaje del Usuario tiene intención de recomendación (esto se determina en el system prompt instruyendo al LLM a identificar intenciones), el flujo se extiende con un paso adicional antes de llamar al LLM para generar la respuesta final. El backend primero llama al LLM con un prompt de extracción pidiendo que devuelva exclusivamente un JSON con el esquema { categorias: string[], precioMaximo: numeric, departamentoId: uuid, zonaId: uuid, duracionMinutos: int } a partir del mensaje del Usuario. Con esos parámetros extraídos ejecuta una consulta real a la tabla POI con los filtros correspondientes usando PostGIS si hay zona, filtro de categoría via CategoriaPOI, y rango de precio. Toma los primeros 5 resultados. Los serializa como contexto adicional y los inyecta en el array de mensajes antes de la llamada final al LLM, que redacta la respuesta en lenguaje natural mencionando esos POIs reales. Si la extracción de parámetros devuelve un JSON inválido o vacío, se omite la consulta a BD y el LLM responde con recomendaciones generales basadas en su conocimiento del system prompt y en las preferencias del Usuario, sin inventar datos específicos. Los POIs mencionados en la respuesta incluyen un link directo a su ficha dentro de la app.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Pido recomendaciones de bodegas económicas | Que el asistente me mencione POIs reales de la BD que sean bodegas con precio bajo o moderado | - |
| La extracción de parámetros falla | Recibir una respuesta útil aunque más genérica, sin ver ningún error técnico guiándose por las preferencias configuradas en el perfil del Usuario | - |
| El asistente menciona un POI | Ver un card tappable que me lleve a la ficha de ese lugar | - |
| No hay POIs que cumplan los filtros extraídos | Que el asistente me lo indique y sugiera relajar algún criterio pero me presente los POIs con más coincidencia | - |
| Pido recomendaciones sin especificar categoría | Que el asistente use mis preferencias del perfil como contexto adicional | - |
