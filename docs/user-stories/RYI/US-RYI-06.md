# US-RYI-06: Filtrado por Período y Categoría

## Información General
- **Identificador:** US-RYI-06
- **Actor:** Administrador / Prestador
- **Puntos de Historia:** 3
- **Precondiciones:**
  - Usuario autenticado con rol Administrador o Prestador.
  - Al menos un reporte del módulo RYI abierto.
- **Historias de Usuario Relacionadas:** US-RYI-01, US-RYI-02, US-RYI-03, US-RYI-04, US-RYI-05, US-RYI-06

---

## Descripción General
**Como** Administrador o Prestador  
**Quiero** poder filtrar cualquier reporte por rango de fechas y categoría de POI  
**Para** acotar el análisis a períodos específicos o segmentos del catálogo sin necesidad de generar reportes separados.

---

## Descripción Funcional
Los filtros son un componente global persistente en la parte superior de la sección de reportes que se aplica a todos los reportes del módulo simultáneamente. Los filtros disponibles son: rango de fechas con selector de fecha inicio y fecha fin (por defecto últimos 30 días), categoría de POI (selección múltiple desde la tabla Categoria, opción "Todas" por defecto), y zona geográfica (selección desde las localidades disponibles en la tabla geográfica, opción "Toda Mendoza" por defecto). Al modificar cualquier filtro, todos los reportes actualmente cargados se calculan y actualizan automáticamente. Los filtros seleccionados persisten durante la sesión activa del Usuario: si navega entre reportes dentro del módulo, los filtros se mantienen. Al cerrar sesión o salir del módulo, los filtros vuelven a sus valores por defecto. El rango de fechas tiene las siguientes restricciones: la fecha inicio no puede ser posterior a la fecha fin, la fecha fin no puede ser posterior a la fecha actual, y el rango máximo permitido es de 365 días. Para rangos superiores a 365 días se sugiere al Usuario usar la exportación en lugar del reporte en pantalla.

---

## Criterios de Aceptación
| Cuando | Espero | Pantallas |
| :--- | :--- | :--- |
| El Administrador cambie el rango de fechas | Que todos los reportes visibles se actualicen automáticamente reflejando el nuevo período | - |
| El Administrador seleccione una categoría específica | Que el sistema muestre los reportes que pertenecen únicamente a los POIs de esa categoría | - |
| El Administrador navegue de un reporte a otro dentro del módulo | Que el sistema mantenga configurados los filtros aplicados en la última sesión | - |
| El Administrador intenta ingresar una fecha fin anterior a la fecha inicio | Que el sistema muestre un mensaje de error inline y que el filtro no se aplique | - |
| El Administrador selecciona un rango que supera los 365 días | Que el sistema muestre un mensaje sugiriendo usar la exportación y que el filtro no se aplique | - |
| El Administrador cierra sesión y vuelvo a entrar | Que los filtros estén en sus valores por defecto (últimos 30 días, todas las categorías, toda Mendoza) | - |
