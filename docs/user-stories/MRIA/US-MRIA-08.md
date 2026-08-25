# US-MRIA-08: Filtrado Multicriterio

## Información General
- **Identificador:** US-MRIA-08
- **Actor:** Turista
- **Puntos de Historia:** 5
- **Precondiciones:** Usuario Autenticado.
- **Historias de Usuario Relacionadas:** US-MRIA-01, US-MRIA-02, US-MRIA-03, US-MRIA-07, US-GIT-05

---

## Descripción General
**Como** Turista  
**Quiero** poder combinar múltiples filtros simultáneamente al explorar POIs  
**Para** acotar los resultados exactamente a lo que necesito sin tener que revisar opciones irrelevantes.

---

## Descripción Funcional
El sistema expone un panel de filtros que permite combinar: categoría (selección múltiple desde Categoria), rango de precio (precioMin/precioMax), ubicación geográfica jerárquica cruzando con la tabla Zona y Departamento, distancia desde ubicación actual (requiere GPS), puntuación mínima (puntuacionPromedio), disponibilidad en fecha específica (cruza con Horario y fechaInicio/fechaFin del POI), y fuente del POI (Admin/Prestador/comunidad). Cada filtro activo se muestra como un chip removible. La consulta se construye dinámicamente en el backend agregando condiciones según los filtros activos, siempre con estadoId = aprobado como condición base no removible. Los resultados se paginan de a 20 registros.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista aplica múltiples filtros simultáneamente | Que los resultados cumplan todas las condiciones combinadas | - |
| El Turista remueve un filtro | Que los resultados se actualicen inmediatamente reflejando la nueva combinación | - |
| El Turista combina filtros pero no arroja resultados | Un mensaje claro y la sugerencia de relajar algún filtro específico | - |
| El Turista no tiene GPS activo | Que el filtro de distancia esté deshabilitado con una indicación del motivo | - |
| Hay más de 20 resultados | Que se carguen de forma paginada sin necesidad de recargar la página | - |
