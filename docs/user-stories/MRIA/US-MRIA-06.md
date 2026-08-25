# US-MRIA-06: Recomendación de Negocios Locales

## Información General
- **Identificador:** US-MRIA-06
- **Actor:** Turista
- **Puntos de Historia:** 3
- **Precondiciones:**
  - Usuario autenticado.
  - Existencia de POIs con fuente "Prestador" o "comunidad" en estado "aprobado".
- **Historias de Usuario Relacionadas:** US-MRIA-01, US-MRIA-09, US-CYN-01, US-CYN-02

---

## Descripción General
**Como** Turista  
**Quiero** que el sistema priorice emprendimientos y negocios locales pequeños en mis recomendaciones  
**Para** apoyar la economía local y descubrir opciones más auténticas que las atracciones turísticas tradicionales.

---

## Descripción Funcional
El sistema identifica POIs cuya fuente sea "Prestador" o "comunidad" y cuya organizacionId corresponda a una organización sin alto volumen de apariciones en itinerarios previos (negocios no saturados). Estos POIs reciben un factor de boost en el score de recomendación, haciéndolos aparecer antes que POIs equivalentes de fuentes más establecidas cuando la diferencia de puntuación no es significativa. El boost es configurable desde el Panel Administrativo. Se agrega una etiqueta visual "Negocio local" en la UI para estos POIs.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Dos POIs tienen puntuación similar | Que el negocio local aparezca primero en los resultados | - |
| Un POI local tiene estado distinto de "aprobado" | Que no aparezca en las recomendaciones | - |
| Veo un POI en los resultados | Poder identificar visualmente si es un negocio local mediante una etiqueta | - |
| El factor de boost está en cero desde configuración | Que los negocios locales aparezcan sin priorización especial | - |
