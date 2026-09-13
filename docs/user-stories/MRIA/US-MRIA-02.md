# US-MRIA-02: Recomendación por Presupuesto

## Información General
- **Identificador:** US-MRIA-02
- **Actor:** Turista
- **Puntos de Historia:** 2
- **Precondiciones:**
  - Usuario autenticado.
  - Con presupuestoDefault configurado en el perfil.
- **Historias de Usuario Relacionadas:** US-MRIA-01, US-MRIA-09, US-CYP-05

---

## Descripción General
**Como** Turista  
**Quiero** que las recomendaciones respeten el rango de presupuesto que definí en mi perfil  
**Para** no recibir sugerencias de lugares que estén fuera de mis posibilidades económicas.

---

## Descripción Funcional
El sistema lee el presupuestoDefault del Usuario desde la tabla Usuario. Al generar recomendaciones, aplica un filtro sobre los campos precioMin y precioMax de la tabla POI, excluyendo aquellos cuyo rango de precio no tenga intersección con el presupuesto del Usuario. El filtro se aplica como una capa adicional sobre cualquier otro tipo de recomendación activa, no como un módulo aislado. Si el Usuario no tiene presupuesto configurado, las recomendaciones se muestran sin filtro económico y se sugiere al Usuario completar ese dato en su perfil.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista tiene un presupuesto "bajo" configurado | Que el sistema no muestre POIs cuyo precioMin supere el umbral correspondiente | - |
| El Turista no tiene un presupuesto configurado | Que el sistema muestre recomendaciones sin filtro económico y un aviso sugiriendo completar mi perfil | - |
| Un POI no tiene precio informado | Que igualmente aparezca en los resultados con una indicación de "precio no disponible" | - |
