# US-MRIA-01: Recomendación por Intereses

## Información General
- **Identificador:** US-MRIA-01
- **Actor:** Turista
- **Puntos de Historia:** 3
- **Precondiciones:**
  - Usuario autenticado.
  - Al menos una categoría de interés registrada en UsuarioPreferencia.
- **Historias de Usuario Relacionadas:** US-MRIA-02, US-MRIA-05, US-MRIA-09, US-CYP-05

---

## Descripción General
**Como** Turista  
**Quiero** recibir recomendaciones de POIs basadas en mis intereses declarados  
**Para** descubrir lugares y actividades que se me me me me me se me se ajusten a mis preferencias sin tener que buscarlos manualmente.

---

## Descripción Funcional
El sistema consulta las categorías de interés registradas en UsuarioPreferencia para el Usuario autenticado. Con esas categorías realiza una consulta a la tabla POI filtrada por CategoriaPOI, excluyendo POIs con estado distinto de "aprobado". El resultado se ordena por puntuacionPromedio descendente y se presenta como una sección de recomendaciones en el home del Usuario. Si el Usuario no tiene preferencias registradas, el sistema redirige al flujo de configuración de preferencias antes de mostrar resultados.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario accede al home | Ver una sección "Para vos" con POIs cuyas categorías coincidan con sus intereses | - |
| El Usuario no tiene preferencias configuradas | Ser redirigido a configurarlas antes de ver recomendaciones personalizadas | - |
| Un POI tiene estado distinto de "aprobado" | Que no aparezca en las recomendaciones | - |
| El Usuario tiene múltiples categorías de interés | Que los resultados incluyan POIs de todas ellas, no solo de la primera y priorizando los POIs que coincidan en más de una | - |
