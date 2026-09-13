# US-CYN-02: Creación de Negocio por Prestador

## Información General
- **Identificador:** US-CYN-02
- **Actor:** Prestador
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Prestador debe estar autenticado en el sistema.
  - El Prestador debe tener una cuenta válida y activa.
- **Historias de Usuario Relacionadas:** US-ACC-02, US-GDU-02, US-GIT-01, US-GIT-02, US-GIT-03, US-GIT-05, US-GIT-06, US-GIT-07

---

## Descripción General
**Como** Prestador  
**Quiero** crear y registrar un negocio turístico en Ando  
**Para** publicar mis servicios, gestionar información comercial y ser visible para los Turistas dentro de la plataforma

---

## Descripción Funcional
El sistema debe permitir que un Prestador autenticado cree un nuevo negocio turístico asociado a su Organización mediante un wizard interactivo organizado en 6 pasos estructurados:
1. Información básica: Nombre del negocio, descripción general y selección de categorías.
2. Ubicación: Dirección física, selección en cascada (Región, Departamento y Zona opcional) y coordenadas geográficas (Latitud / Longitud).
3. Datos de contacto: Teléfono, email de contacto comercial, sitio web y red social (Instagram).
4. Horarios de atención: Carga dinámica de rangos horarios por día de la semana con validación de superposición.
5. Fotos del negocio: Captura mediante cámara o selección desde galería (con límite máximo de 30 MB por archivo).
6. Información adicional: Rango de precios estimado (mínimo y máximo) y duración estimada de la visita.

El sistema validará progresivamente que los campos obligatorios de cada paso estén completos y con formato válido antes de permitir avanzar al siguiente paso.
Al finalizar la carga, el sistema presentará un modal de Resumen y Vista Previa que emulará la ficha visual final del negocio con la insignia "Pendiente de validación". Desde esta vista, el Prestador podrá elegir entre "Editar" (para retornar al wizard y corregir datos) o "Guardar Negocio" (para enviar la propuesta).
Una vez guardado, el negocio quedará asociado a la Organización del Prestador en estado "Pendiente de validación" hasta su posterior revisión por un Administrador.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Prestador accede al módulo "Mis Negocios" | Que el sistema muestre un botón "Crear Negocio" | CYNCreacionNegocioPrestadorGUI |
| El Prestador selecciona "Crear Negocio" | Que el sistema despliegue el flujo guiado por pasos (stepper) iniciando en el Paso 1: Información básica | - |
| El Prestador intenta avanzar al siguiente paso con campos obligatorios vacíos o con errores de formato | Que el sistema indique el error visualmente y bloquee el avance | - |
| El Prestador retrocede o selecciona un paso previamente alcanzado en el indicador visual | Que el sistema le permita navegar y editar la información sin perder los datos previamente cargados | - |
| El Prestador selecciona o captura fotos válidas (<= 30 MB) | Que el sistema las cargue correctamente y permita visualizarlas o eliminarlas antes de continuar | - |
| El Prestador completa el último paso y presiona guardar/continuar | Que el sistema despliegue una vista previa consolidada (modal de resumen) con la estética final de la card del negocio | - |
| El Prestador presiona "Editar" en la vista previa de resumen | Que el modal se cierre y el sistema lo retorne al wizard para realizar modificaciones | - |
| El Prestador confirma "Guardar Negocio" desde la vista previa | Que el sistema registre el POI asociado a su Organización, emita un mensaje de éxito y establezca su estado en "Pendiente de validación" | - |
| El Prestador presiona "Cancelar y volver" habiendo ingresado información en cualquier paso | Que el sistema solicite confirmación explícita para descartar los cambios sin guardar | - |
| El Administrador aprueba el negocio | Que el negocio pase a estado “Publicado” y sea visible para los Turistas | - |
