# US-CYN-06: Integración de Motor de Recomendación

## Información General
- **Identificador:** US-CYN-06
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El motor de recomendación debe estar operativo.
  - Deben existir POIs cargados y aprobados.
  - El Usuario debe estar registrado en el sistema y con una sesión activa.
- **Historias de Usuario Relacionadas:** US-GDU-03, US-CYN-05, US-RYV-02, US-IA-01

---

## Descripción General
**Como** Turista  
**Quiero** recibir recomendaciones personalizadas de Puntos de Interés (POI) e itinerarios recomendados  
**Para** descubrir lugares y actividades en Mendoza que se alineen perfectamente con mis gustos, presupuesto y tiempos.

---

## Descripción Funcional
El sistema debe implementar un servicio intermedio (Motor de Recomendación) que se alimente de múltiples fuentes de datos de la aplicación. Cuando el Turista solicite recomendaciones (o al cargar su pantalla de inicio), el motor ejecutará un pipeline de filtrado:
1. Filtro de Preferencias del Turista
2. Filtro de Estado de POI
3. Filtro de Contexto e IA (de las conversaciones)

El motor devolverá una colección ordenada de objetos POI basada en lo definido y en base a esto le recomendará lugares.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Se devuelven POIs recomendados | Que el estado de cada POIs sea “aprobado” | - |
| Un Turista con preferencias configuradas solicita recomendaciones en la app | Que el sistema consulte la tabla UsuarioPreferencia, busque los POIs asociados a esas categorías y devuelva un listado ordenado por nivel de preferencia | - |
| Un Turista nuevo o sin preferencias explícitas solicita recomendaciones | Que el sistema realice un promedio de las puntuaciones de la tabla Reseña y devuelva el Top 10 de POIs con mejor reputación en Mendoza | - |
| El motor procesa los POIs candidatos para la recomendación | Que el sistema filtre estrictamente por EstadoPOI = 'aprobado', garantizando que jamás se le recomiende al Turista un negocio suspendido, rechazado o dado de baja lógica. | - |
| El servicio del Motor de Recomendación externo o de IA experimenta un timeout o caída | Que el sistema capture la excepción de forma segura y muestre la lista de POIs populares por defecto | - |
