# US-MRIA-10: Detección Automática de Contenido Inadecuado

## Información General
- **Identificador:** US-MRIA-10
- **Actor:** Administrador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Administrador debe encontrarse autenticado en el sistema.
  - Debe existir una reseña o comentario/respuesta cuyo contenido textual pueda ser analizado.
  - Deben encontrarse definidas las categorías o políticas utilizadas para la clasificación automática.
- **Historias de Usuario Relacionadas:** US-RYV-02, US-CYN-07, US-PAD-03

---

## Descripción General
**Como** Administrador  
**Quiero** que el sistema analice automáticamente mediante Inteligencia Artificial las reseñas y los comentarios/respuestas publicados  
**Para** identificar contenido potencialmente inadecuado y generar casos de moderación que pueda revisar y resolver posteriormente.

---

## Descripción Funcional
El sistema deberá analizar automáticamente mediante Inteligencia Artificial el contenido textual de: reseñas publicadas por Turistas; comentarios o respuestas realizadas sobre reseñas.
El objetivo del análisis será detectar contenido potencialmente inadecuado que requiera revisión administrativa y que no pueda ser identificado únicamente mediante las validaciones básicas y filtros determinísticos existentes en la plataforma.
Las reseñas ya cuentan con una validación previa destinada a detectar palabras o expresiones prohibidas antes de su publicación. Por este motivo, esta funcionalidad de Inteligencia Artificial no tendrá como objetivo volver a detectar insultos o términos contemplados por dichos filtros, sino analizar situaciones que requieran una interpretación contextual del contenido (spam, acoso, amenazas, contenido sexual explícito, divulgación de datos privados).
Deberá analizar el texto recibido y devolver un resultado estructurado que indique si el contenido requiere o no revisión administrativa. Cuando el análisis determine que el contenido requiere revisión, generará un caso de moderación con origen “Detectado por IA” y estado “Pendiente de revisión”.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Se publica una reseña y esta disponible | Que el sistema analice automáticamente su contenido textual mediante Inteligencia Artificial | - |
| Un Prestador publica un comentario/respuesta asociado a una reseña | Que el sistema analice automáticamente su contenido textual mediante Inteligencia Artificial | - |
| La Inteligencia Artificial analiza una reseña o comentario y no detecta contenido potencialmente inadecuado | Que el resultado indique que el contenido no requiere revisión y no se genere un caso automático de moderación | - |
| La Inteligencia Artificial determina que el contenido requiere revisión | Que el resultado incluya una clasificación o categoría correspondiente al contenido detectado | - |
| La Inteligencia Artificial marca un contenido como potencialmente inadecuado | Que no elimine, oculte, modifique ni sancione automáticamente al contenido o al Usuario responsable. Se debe esperar la decisión definitiva quede pendiente de revisión por parte de un Administrador | - |
