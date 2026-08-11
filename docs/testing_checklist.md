# Lista de Chequeo y Criterios de Aceptación para Pruebas en `ando-web`

Esta guía recopila todos los **Criterios de Aceptación oficiales** estructurados por módulo para validar las funcionalidades implementadas en el portal web (**ando-web**) conectadas al backend NestJS (**AndoBack**).

---

## 📋 MÓDULO 1: CRUD POIs, Categorías, Horarios y Multimedia

### 🔹 US-GIT-05: Gestión de Categorías y Etiquetas (Administrador)
- [ ] **Visualización:** Al ingresar a `/admin/settings`, la pestaña de categorías muestra la lista completa de categorías y etiquetas registradas en el sistema.
- [ ] **Creación de Categoría:** Al ingresar un nombre nuevo y presionar guardar, la categoría se crea exitosamente (`POST /poi/categorias`).
- [ ] **Validación de Duplicados:** Al intentar registrar una categoría con un nombre ya existente, el sistema bloquea la acción y muestra el mensaje *"Ya existe una categoría registrada con este nombre"*.
- [ ] **Edición:** Al modificar el nombre o estado de una categoría, los cambios se persisten (`PATCH /poi/categorias/:id` y `PATCH /poi/categorias/:id/activar`).
- [ ] **Eliminación Segura:** Al intentar eliminar una categoría en uso por algún POI activo, el sistema muestra la advertencia *"No se puede eliminar la categoría porque está asociada a puntos de interés activos"*.

### 🔹 US-GIT-07 / US-GIT-09: Gestión Multimedia (Prestador)
- [ ] **Subida a Cloudflare R2:** Al seleccionar o arrastrar imágenes (JPG, PNG, WEBP), el sistema obtiene la presigned URL (`POST /storage/presigned-url`) y sube el archivo binario mediante PUT.
- [ ] **Límite de Tamaño:** Si se intenta subir una imagen mayor a 30 MB, el sistema rechaza el archivo mostrando la advertencia de tamaño superado.
- [ ] **Límite de Galería:** El sistema respeta el límite máximo configurado de imágenes por POI (por defecto 8).
- [ ] **Eliminación de Imagen:** Al presionar eliminar sobre una foto de la galería, se remueve de la lista del POI.
- [ ] **Advertencia Última Imagen:** Si el Prestador intenta borrar la única imagen restante de su negocio, el sistema muestra el modal de confirmación advirtiendo que el lugar quedará sin fotos.

### 🔹 US-GIT-01 / US-GIT-02 / US-GIT-03: Carga, Edición y Eliminación de Horarios (Prestador)
- [ ] **Acceso a Horarios:** En `/provider/schedules`, se pueden seleccionar los POIs de la organización del prestador.
- [ ] **Presets de Mendoza:** Al presionar un preset (*Mañana 09:00-13:30*, *Tarde 16:00-20:00*, *Noche*, *Corrido*), las franjas horarias se autocompletan correctamente.
- [ ] **Selección Multidía:** Se pueden seleccionar múltiples días (ej. Lunes a Viernes) y guardar el rango en lote (`POST /poi/prestador/my-pois/:poiId/horarios/batch`).
- [ ] **Validación de Horarios:** El sistema bloquea el guardado si la hora de apertura es igual o posterior a la hora de cierre.
- [ ] **Eliminación:** Al eliminar una regla horaria o vaciar los horarios, se actualiza el perfil del negocio.

---

## 📋 MÓDULO 2: Crowdsourcing, Negocios y Validaciones (CYN)

### 🔹 US-CYN-01 & US-CYN-02: Creación de Negocio / POI (Prestador)
- [ ] **Pestaña Mis Negocios:** En `/provider/business`, el Prestador visualiza la lista de negocios asociados a su Organización.
- [ ] **Botón Crear Negocio:** Al presionar *"Registrar Nuevo Establecimiento"*, se despliega el formulario/wizard de creación.
- [ ] **Validación Progresiva de Campos:** 
  - Bloqueo si el nombre, categoría, descripción o dirección están vacíos.
  - Formato de Email inválido (ej. sin `@` o dominio).
  - Formato de Teléfono (entre 6 y 18 dígitos).
  - Coordenadas Latitud/Longitud numéricas dentro de rangos válidos.
- [ ] **Confirmación al Cancelar:** Si el formulario tiene cambios cargados y se presiona *"Cancelar"*, se despliega un modal pidiendo confirmación explícita para no perder datos.
- [ ] **Alta y Estado Inicial:** Al guardar el negocio, se registra en el backend (`POST /poi/prestador/my-pois`) con estado **"Pendiente de validación"**.

### 🔹 US-CYN-03 & US-CYN-07: Edición y Ficha de POI
- [ ] **Edición de POI:** Al modificar datos de un POI existente, los cambios se envían al backend (`PATCH /poi/prestador/my-pois/:id`) y el negocio retorna a estado **"Pendiente de revisión"**.
- [ ] **Visualización Ficha POI:** La vista detallada consolida la imagen principal, categoría, ubicación, mapa, contacto y horarios.

### 🔹 US-GIT-06 / US-GIT-11 & Validación por Administrador
- [ ] **Panel de Validación:** En `/admin/validation`, el Administrador visualiza la lista de POIs en estado **"Pendiente"**.
- [ ] **Aprobación de POI:** Al presionar *"Aprobar"*, el estado del POI cambia a **"Aprobado"** (`PATCH /poi/:id/estado?estado=aprobado`) y se registra en la auditoría.
- [ ] **Rechazo con Feedback:** Al presionar *"Rechazar"*, el Administrador debe ingresar la justificación obligatoria. El estado cambia a **"Rechazado"**.
- [ ] **Solicitud de Corrección:** Al presionar *"Solicitar Corrección"*, se envía la observación al Prestador.
- [ ] **Moderación Multimedia:** El Administrador puede inspeccionar la galería del POI y eliminar fotos inapropiadas.

---

## 📋 MÓDULO 3: Usuarios, Roles y Perfiles (GDU)

### 🔹 US-GDU-01 & US-GDU-04: Gestión de Cuentas (Administrador)
- [ ] **Listado de Usuarios:** En `/admin/users`, el Administrador visualiza la tabla consolidada de Administradores, Prestadores y Turistas.
- [ ] **Filtros y Búsqueda:** Se puede filtrar la lista por término de búsqueda (nombre, email, CUIT) y por rol.
- [ ] **Alta de Usuario Administrador / Prestador:** Al completar el formulario con datos válidos y CUIT (11 dígitos para prestadores), la cuenta se registra con éxito.
- [ ] **Desactivación / Inactivación:** Al eliminar/desactivar un usuario, su estado pasa a `inactive` y se inhabilitan sus accesos.

### 🔹 US-GDU-03: Perfil de Prestador y Organización
- [ ] **Carga de Datos Comerciales:** En `/provider/profile`, el Prestador visualiza y edita su Nombre, Apellido, Teléfono, Razón Social y CUIT.
- [ ] **Persistencia en Backend:** Al guardar los cambios, la actualización se envía a `PATCH /user/prestador/profile`.
- [ ] **Cambio de Contraseña:** En la sección de seguridad, el usuario puede cambiar su clave de acceso validando la contraseña actual.

---

## 📋 MÓDULO 4: Autenticación, Seguridad y Swagger API

- [ ] **Login de Prestador / Admin:** En el formulario de autenticación, el inicio de sesión genera y almacena el JWT Token en `localStorage`.
- [ ] **Protección de Rutas:** Si un usuario sin sesión o rol incorrecto intenta ingresar a `/admin/*` o `/provider/*`, el sistema lo redirige a la página principal.
- [ ] **Swagger Documentation:** La documentación interactiva de Swagger está disponible en el backend en `http://localhost:5000/api`.
