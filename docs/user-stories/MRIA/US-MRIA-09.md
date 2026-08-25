# US-MRIA-09: Recomendación Colaborativa

## Información General
- **Identificador:** US-MRIA-09
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - Usuario autenticado.
  - Al menos 5 valoraciones registradas en el sistema a nivel global para que el modelo tenga datos suficientes.
  - Proceso batch ejecutado al menos una vez.
- **Historias de Usuario Relacionadas:** US-MRIA-01, US-MRIA-04, US-RYV-01, US-RYI-01

---

## Descripción General
**Como** Turista  
**Quiero** recibir sugerencias basadas en lo que otros Usuarios con gustos similares a los míos han visitado y valorado  
**Para** descubrir lugares que probablemente me gusten aunque no los haya buscado activamente.

---

## Descripción Funcional
El servicio Python de recomendación aplica filtrado colaborativo usando cosine similarity sobre los vectores de preferencias y valoraciones de los Usuarios. El vector de cada Usuario se construye a partir de sus categorías de interés (UsuarioPreferencia), sus valoraciones (Valoracion) y sus POIs favoritos (FavoritoPOI). Se identifican los K Usuarios más similares (K=10 por defecto) y se recomiendan los POIs que esos Usuarios valoraron positivamente pero que el Usuario actual no ha visitado ni valorado. El cálculo se ejecuta como un proceso batch nocturno (cron job) que persiste los resultados en una tabla de caché para ser consultados en tiempo real sin recalcular en cada request.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista tiene suficiente historial | Ver una sección "Otros como vos también visitaron" con POIs que no he visitado | - |
| El proceso aún no se ejecutó o no hay suficientes datos | Que la sección no aparezca sin mostrar error | - |
| Un POI recomendado colaborativamente pierde su estado "aprobado" | Que desaparezca de los resultados aunque esté en la caché | - |
| El Turista actualiza mis preferencias | Que en el próximo ciclo batch las recomendaciones colaborativas reflejen el cambio | - |
