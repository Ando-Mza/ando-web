# US-RYI-05: Exportación de Reportes

## Información General
- **Identificador:** US-RYI-05
- **Actor:** Administrador / Prestador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - Usuario autenticado con rol Administrador o Prestador.
  - Reporte generado y visible en pantalla con al menos 1 registro.
- **Historias de Usuario Relacionadas:** US-RYI-01, US-RYI-02, US-RYI-03, US-RYI-04, US-RYI-05, US-NYA-XX

---

## Descripción General
**Como** Administrador o Prestador  
**Quiero** exportar los datos de cualquier reporte en formatos descargables  
**Para** analizarlos externamente, compartirlos con terceros o archivarlos como respaldo.

---

## Descripción Funcional
Todos los reportes del módulo RYI exponen un botón "Exportar" que permite descargar los datos actualmente visualizados (respetando los filtros aplicados) en tres formatos: PDF, Excel (XLSX) y CSV. La exportación se ejecuta como background job dado que puede involucrar grandes volúmenes de datos: el Usuario presiona "Exportar". Cuando se genera el archivo con una URL de descarga que expira en 24 horas, y se envía una notificación al Usuario con la misma. Para reportes con menos de 1000 registros, la exportación es sincrónica y se descarga directamente.
Formato según archivos:
- El PDF incluye el logo de la plataforma, el nombre del reporte, el período y los filtros aplicados como encabezado, seguido de los datos en formato tabla.
- El XLSX incluye una hoja por sección del reporte cuando se aplica. El CSV incluye únicamente los datos tabulares sin formato. Los reportes con visualizaciones geográficas (US-RYI-05) exportan solo la tabla de datos, no el mapa.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador o Prestador exporte un reporte con menos de 1000 registros | Que el sistema genere un archivo con los mismos e inicie la descarga inmediatamente | - |
| El Administrador o Prestador exporte un reporte con más de 1000 registros | Que el sistema envíe una notificación con el link de descarga cuando el archivo esté listo | - |
| El Administrador o Prestador descarga el archivo en PDF | Que el archivo generado incluya el encabezado con nombre del reporte, período y filtros aplicados | - |
| El Administrador o Prestador descarga el archivo en XLSX | Que el archivo generado muestre los datos estén en formato tabla con encabezados de columna en la primera fila | - |
| El Administrador o Prestador espera más de 24 horas sin descargar el archivo del link | Que el sistema informe que expiró el enlace y ofrezca la generación de uno nuevo | - |
| El Administrador o Prestador exporta el reporte de distribución turística | Que el archivo generado contenga la tabla de datos por zona pero no el mapa | - |
