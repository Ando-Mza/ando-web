# US-MRIA-07: Búsqueda predictiva

## Información General
- **Identificador:** US-MRIA-07
- **Actor:** Turista
- **Puntos de Historia:** 3
- **Precondiciones:**
  - Usuario autenticado.
  - Al menos 3 caracteres ingresados en el campo de búsqueda.
- **Historias de Usuario Relacionadas:** US-MRIA-09, US-GIT-XX

---

## Descripción General
**Como** Turista  
**Quiero** que el sistema sugiera resultados automáticamente mientras escribo en el buscador  
**Para** encontrar lo que busco más rápido sin necesidad de escribir el nombre completo.

---

## Descripción Funcional
A partir del tercer carácter ingresado en el campo de búsqueda, el sistema ejecuta una consulta sobre nombre y descripción de la tabla POI usando búsqueda de texto parcial (ILIKE o full-text search con índice GIN en PostgreSQL). Las sugerencias se limitan a 8 resultados máximo, priorizando coincidencias exactas en nombre sobre coincidencias en descripción. Los resultados se muestran en un dropdown en tiempo real con debounce de 300ms para no ejecutar una query por cada tecla. Las búsquedas recientes del Usuario se almacenan localmente en el dispositivo y se muestran como sugerencias antes de que el Usuario empiece a escribir.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista escribe 3 o más caracteres | Ver sugerencias de POIs que contengan ese texto en el nombre o descripción | - |
| El Turista escribo menos de 3 caracteres | Que no se ejecute ninguna búsqueda y no aparezca el dropdown | - |
| No hay resultados para el texto ingresado | Ver un mensaje "Sin resultados" en el dropdown en lugar de un dropdown vacío | - |
| El Turista deja de escribir por 300ms | Que recién ahí se ejecute la búsqueda, no en cada tecla | - |
| El Turista abre el buscador sin escribir nada | Ver mis búsquedas recientes como sugerencias | - |
