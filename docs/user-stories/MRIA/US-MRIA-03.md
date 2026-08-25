# US-MRIA-03: Recomendación por Ubicación

## Información General
- **Identificador:** US-MRIA-03
- **Actor:** Turista
- **Puntos de Historia:** 3
- **Precondiciones:**
  - Usuario autenticado.
  - Permiso de GPS concedido en el dispositivo.
  - Ubicación actual disponible.
- **Historias de Usuario Relacionadas:** US-MRIA-01, US-MRIA-09, US-GYM-01, US-GYM-03

---

## Descripción General
**Como** Turista  
**Quiero** recibir sugerencias de POIs cercanos a mi ubicación actual  
**Para** aprovechar lo que tengo disponible en el lugar donde me encuentro sin planificación previa.

---

## Descripción Funcional
El sistema recibe las coordenadas actuales del Usuario desde el frontend (GPS del dispositivo). Para optimizar el rendimiento antes de la matemática espacial, el backend pre-filtra los registros identificando la Zona o Departamento actual del Usuario. Luego ejecuta una consulta espacial sobre la tabla POI usando PostGIS (ST_DWithin) con un radio configurable (valor por defecto: 5 km). Los resultados se ordenan por distancia ascendente y se muestran en una sección "Cerca tuyo" con la distancia calculada para cada POI. La ubicación del Usuario no se persiste en la base de datos.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista tiene GPS activo | Que el sistema muestre los POIs ordenados por distancia dentro del radio configurado | - |
| No hay POIs en el radio por defecto | Que el sistema amplíe el radio automáticamente e informe el nuevo valor usado | - |
| El Usuario deniega el permiso de GPS | Que la sección "Cerca tuyo" no aparezca y se muestre un mensaje explicando por qué | - |
| Un POI está fuera del horario de atención actual | Que aparezca en los resultados pero marcado como "cerrado ahora" | - |
