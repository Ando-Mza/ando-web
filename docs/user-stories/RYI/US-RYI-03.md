# US-RYI-03: Reporte Negocios Locales

## Información General
- **Identificador:** US-RYI-03
- **Actor:** Administrador / Prestador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - Para vista Administrador: Usuario con rol Administrador.
  - Para vista Prestador: Usuario con rol Prestador vinculado a al menos un POI via UsuarioOrganizacion.
- **Historias de Usuario Relacionadas:** US-RYI-06, US-RYI-07, US-RYI-01

---

## Descripción General
**Como** Administrador  
**Quiero** ver el desempeño de los negocios locales registrados en la plataforma  
**Para** evaluar el impacto de Ando en la visibilidad de emprendimientos locales y detectar negocios que necesitan mayor promoción.

**Como** Prestador  
**Quiero** ver las métricas de mi propio negocio  
**Para** entender cómo me está yendo en la plataforma y tomar decisiones sobre mi oferta.

---

## Descripción Funcional
El reporte tiene dos vistas con diferente alcance según el rol del Usuario autenticado.
Perspectiva del Administrador: El sistema desplegará el catálogo completo de puntos turísticos. Para cada entidad se detallarán métricas clave: frecuencia de inclusión en rutas, check-ins confirmados, puntuacionPromedio, volumen de opiniones validadas, incidencias reportadas y la situación administrativa vigente. La interfaz habilitará el ordenamiento dinámico por cualquier atributo y el filtrado por región geográfica, tipo de actividad o estado. Asimismo, incorporará un ranking comparativo de los 10 emprendimientos con mayor incremento de actividad respecto al ciclo previo.
Perspectiva del Prestador: La interfaz filtra el contenido para exponer únicamente los sitios vinculados al organizacionId del Usuario autenticado mediante la tabla UsuarioOrganizacion. Se presentarán los mismos indicadores analíticos restringidos exclusivamente a su oferta comercial. Como valor agregado, se graficará la tendencia mensual de paradas planificadas, se listarán las 5 reseñas más recientes con acceso al flujo de respuesta directa (vinculado a US-RYV) y se informará el posicionamiento relativo dentro de su rubro específico.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador accede al reporte | Visualizar todos los negocios locales con sus métricas completas | - |
| El Prestador accede al reporte | Visualizar únicamente las métricas de su propios negocios | - |
| Un negocio tiene alto porcentaje de aparición en itinerarios pero baja visita efectiva | Que el sistema permita identificarlo visualmente | - |
| El Prestador y mi negocio subió posiciones en el ranking de su categoría | Visualizar ese cambio destacado | - |
| El Prestador no tiene negocios vinculados | Que el sistema muestre un mensaje indicando que debo registrar un negocio primero | - |
