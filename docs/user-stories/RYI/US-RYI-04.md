# US-RYI-04: Reporte de Uso del Asistente IA

## Información General
- **Identificador:** US-RYI-04
- **Actor:** Administrador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - Usuario autenticado con rol Administrador.
  - Al menos una conversación registrada en el período seleccionado.
- **Historias de Usuario Relacionadas:** US-RYI-06, US-RYI-07, US-ACIA-01

---

## Descripción General
**Como** Administrador  
**Quiero** ver métricas de uso del asistente conversacional  
**Para** entender cómo los Usuarios interactúan con la IA, identificar consultas frecuentes y monitorear el consumo de tokens y costos asociados.

---

## Descripción Funcional
El reporte consulta las tablas ConversacionIA y MensajeIA dentro del período filtrado. Las métricas presentadas son: total de conversaciones iniciadas, total de mensajes enviados (rol = 'user'), total de tokens consumidos (suma de tokensUsados en MensajeIA), costo estimado calculado aplicando la tarifa del modelo usado (configurable en ConfiguracionAsistente con clave 'costo_por_token'), promedio de mensajes por conversación, y promedio de tokens por mensaje. Para el análisis de contenido, se toman los primeros 50 caracteres de cada MensajeIA con rol = 'user' y se agrupan temáticamente usando una clasificación batch semanal via LLM que categoriza las consultas en: información turística, ayuda con itinerario, recomendaciones, soporte de plataforma, y otros. Los resultados de esa clasificación se persisten en una tabla de caché para no recalcular en cada consulta. No se expone el contenido completo de los mensajes individuales en este reporte por privacidad.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador accede al reporte | Que el sistema acceda al total de conversaciones, mensajes, tokens consumidos y costo estimado del período | - |
| El Administrador accede a la distribución temática | Que el sistema muestre un gráfico de torta con los porcentajes de cada categoría de consulta | - |
| El Administrador consulte el costo estimado y el mismo supere un umbral configurable | Visualizar ese valor destacado en rojo | - |
| No hay conversaciones en el período | Visualizar métricas en cero sin errores | - |
| El proceso de clasificación temática aún no se ejecutó para la semana actual | Visualizar los datos de la semana anterior con una indicación de que los datos de la semana actual están siendo procesados | - |
