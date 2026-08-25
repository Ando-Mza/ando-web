# US-RYV-06: Resumen de Reseñas con IA

## Información General
- **Identificador:** US-RYV-06
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Turista debe estar autenticado.
  - El POI debe tener al menos 1 reseña registrada en el sistema.
- **Historias de Usuario Relacionadas:** US-RYV-01, US-RYV-02, US-RYV-04, US-RYV-05

---

## Descripción General
**Como** Turista  
**Quiero** visualizar un resumen automático de las reseñas de un POI generado con IA  
**Para** conocer rápidamente las opiniones generales de otros Usuarios sin leer todas las reseñas individuales

---

## Descripción Funcional
El sistema debe analizar las reseñas publicadas sobre un POI utilizando un modelo de Inteligencia Artificial capaz de procesar lenguaje natural. A partir de las opiniones registradas, el sistema generará automáticamente un resumen destacando aspectos positivos, negativos y temas recurrentes mencionados por los Turistas. El resumen deberá actualizarse dinámicamente cada vez que se incorporen nuevas reseñas relevantes. Además, el sistema deberá evitar incluir lenguaje ofensivo o contenido inapropiado dentro del resumen generado.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista accede al perfil de un POI con al menos una reseña registrada | Que el sistema muestre un resumen generado automáticamente por IA | - |
| Existen opiniones positivas recurrentes sobre un aspecto del POI | Que el resumen destaque los puntos positivos más mencionados | - |
| Existen críticas frecuentes sobre un aspecto del POI | Que el sistema incluya observaciones negativas relevantes dentro del resumen | - |
| Se agregan nuevas reseñas al POI | Que el sistema actualice automáticamente el resumen generado | - |
| El POI no posee reseñas | Que el sistema muestre el mensaje “No hay suficientes reseñas para generar un resumen automático” | - |
| El Turista consulta el resumen generado | Que el sistema muestre un texto breve, claro y fácil de interpretar | - |
