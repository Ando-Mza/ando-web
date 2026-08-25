# US-CYN-01: Alta Comunitaria de POIs

## Información General
- **Identificador:** US-CYN-01
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Usuario debe estar autenticado en la plataforma.
  - El sistema debe contar con permisos habilitados para acceso a geolocalización y carga de imágenes.
  - Debe existir un módulo administrativo de validación de contenido.
- **Historias de Usuario Relacionadas:** -

---

## Descripción General
**Como** Turista  
**Quiero** proponer nuevos puntos de interés, actividades o lugares turísticos que aún no existan en el sistema  
**Para** colaborar con el crecimiento de la comunidad y enriquecer la información turística disponible para otros viajeros.

---

## Descripción Funcional
El sistema debe permitir a los Usuarios registrados cargar nuevos Puntos de Interés (POI) mediante un formulario colaborativo. El formulario deberá solicitar información obligatoria como nombre del lugar, seleccionar una categoría existente en el sistema, etiquetas existentes en el sistema, servicios incluidos, ubicación geográfica, descripción, región, zona, departamento y fotografías opcionales las cuales se cargarán previamente mediante el mecanismo actual de URL prefirmada.
Cada propuesta ingresada deberá almacenarse inicialmente en estado “Pendiente”, quedando disponible únicamente para los Administradores del sistema.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista seleccione el ícono de ubicación en el lado derecho de la pantalla y acceda a la sección “Sugerir lugar” | Visualizar un formulario de carga de nuevo POI | - |
| El Turista accede a la sección de “Mapa” y mantiene seleccionado un punto del mismo por medio segundo | Visualizar un formulario de carga de nuevo POI | - |
| El Turista completa nombre, ubicación y descripción del lugar | Que el sistema habilite el botón de envío | - |
| El Turista intenta enviar el formulario con campos obligatorios vacíos | Que el sistema indique los campos faltantes y no permita continuar | - |
| El Turista envía correctamente la propuesta | Que el sistema registre el POI con estado “Pendiente” | - |
| El Turista acceda al formulario de “Sugerir lugar” | Visualice un botón para “Agregar fotos o videos” que permita subir fotos desde la galería del dispositivo | - |
| El Turista desee subir fotos o videos | Que el sistema permita subir de 1 a 3 archivos por usuario | - |
