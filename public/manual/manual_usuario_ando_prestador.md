# Manual de Usuario — ANDO App
### Rol: Prestador de Servicios Turísticos
**Proyecto Final de Carrera | UTN FRM — Año Académico 2026**

---

> [!NOTE]
> Este manual cubre exclusivamente las funcionalidades disponibles para el rol **Prestador** dentro de la aplicación móvil **ANDO**. Si buscás el manual para el rol Turista, consultá el documento correspondiente.

---

## 3. Primeros Pasos: Acceso a la Aplicación

### 3.1 Registro de Cuenta como Prestador

(Esta funcionalidad está disponible en la aplicación móvil de ANDO)

Para crear tu cuenta en ANDO como Prestador:

1. En la **Pantalla de Bienvenida**, presioná **"Crear cuenta"**.
2. Seleccioná la tarjeta **"Soy Prestador"** en la pantalla de selección de rol.
3. Completá el formulario de registro:

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| **Foto de Perfil** | ❌ Opcional | Avatar personal (círculo con ícono de cámara) |
| **Nombre** | ✅ Sí | Tu nombre de pila |
| **Apellido** | ✅ Sí | Tu apellido |
| **Email** | ✅ Sí | Correo electrónico único en el sistema |
| **Teléfono** | ✅ Sí | Número de contacto |
| **Ciudad de Origen** | ✅ Sí | Ciudad donde residís |
| **Fecha de Nacimiento** | ✅ Sí | Seleccioná desde el calendario (debés ser mayor de 18 años) |
| **Nombre de Empresa** | ✅ Sí | Nombre de tu organización o razón social |
| **CUIT Empresa** | ✅ Sí | CUIT de tu empresa (formato XX-XXXXXXXX-X) |
| **Contraseña** | ✅ Sí | Mínimo 8 caracteres, con mayúscula, número y símbolo |
| **Confirmar Contraseña** | ✅ Sí | Debe coincidir exactamente con la contraseña |
| **Términos y Condiciones** | ✅ Sí | Debés aceptar para continuar |

**Validaciones en tiempo real:**
- El email se valida automáticamente. Si ya existe, aparece el mensaje *"El correo ya se encuentra registrado"*.
- La contraseña muestra los requisitos faltantes mientras escribís.
- El botón **"Registrarse"** permanece deshabilitado hasta que todos los campos estén correctamente completados y se hayan aceptado los términos y condiciones.

---

### 3.2 Estado de la Cuenta: Pendiente de Validación

> [!IMPORTANT]
> Al registrarte como Prestador, tu cuenta **queda pendiente de validación** por el equipo de administradores de ANDO. No podrás publicar negocios hasta que tu cuenta esté aprobada.

Una vez que el Administrador valide tu cuenta:
- Recibirás una notificación o correo de confirmación.
- Podrás iniciar sesión y acceder al panel de gestión completo.

---

### 3.3 Inicio de Sesión

Una vez que tu cuenta está activa:

1. En la **Pantalla de Bienvenida**, presioná **"Iniciar sesión"**.
2. Ingresá tu **email** y **contraseña**.
3. Presioná **"Ingresar"**.

El sistema redirigirá automáticamente al panel principal del Prestador según tu rol.

| Situación | Mensaje |
|-----------|---------|
| Credenciales incorrectas | *"Usuario o contraseña incorrectos"* |
| Campos vacíos | El botón "Ingresar" permanece deshabilitado |

---

### 3.4 Recuperación de Contraseña

Si olvidaste tu contraseña:

1. En la pantalla de Login, presioná **"Olvidé mi contraseña"**.
2. Ingresá el **email** asociado a tu cuenta de Prestador.
3. El sistema enviará un correo con un enlace de recuperación (válido **1 hora**).
4. Hacé clic en el enlace para ingresar y confirmar tu nueva contraseña.

> [!NOTE]
> Si no ves el correo en tu bandeja principal, revisá la carpeta **SPAM** o promociones. Podés reenviar el correo con un cooldown de 30 segundos.

---

## 4. Panel Principal: Mis Negocios

### 4.1 Vista General del Panel

[Ir a Mis Negocios](/provider)

Al ingresar como Prestador, accedés al panel **"Mis Negocios"** que muestra:

- Un **listado de tarjetas** con cada uno de tus negocios registrados.
- Cada tarjeta muestra: foto, nombre del negocio, **badge de estado**, categoría y calificación promedio.
- Un **ícono de campana** en la esquina superior derecha con el contador de notificaciones sin leer.
- Un botón **"+ Crear Negocio"** en la parte inferior para registrar un nuevo establecimiento.

**Acciones rápidas disponibles en cada tarjeta:**

| Ícono | Sección | Función |
|-------|---------|---------|
| 🕐 | **Horarios** | Gestionar los días y horas de atención |
| 📸 | **Multimedia** | Administrar la galería de fotos |
| ⭐ | **Opiniones** | Ver y responder reseñas de turistas |
| 🛎️ | **Servicios** | Administrar los servicios ofrecidos |

---

### 4.2 Estados de un Negocio

Cada negocio que registrás pasa por distintos estados a lo largo de su ciclo de vida:

| Estado | Badge | Descripción |
|--------|-------|-------------|
| **Pendiente de Validación** | 🟠 Naranja | El negocio fue cargado y está esperando revisión del Administrador |
| **Aprobado** | 🟢 Verde | El negocio fue validado y es visible para los Turistas en el mapa y catálogo |
| **Rechazado** | 🔴 Rojo | El negocio no cumplió los criterios de aprobación |
| **Corrección Solicitada** | 🟡 Amarillo | El Administrador solicitó modificar algún dato antes de aprobar |

> [!NOTE]
> Solo los negocios en estado **"Aprobado"** son visibles para los Turistas en el mapa interactivo y en los resultados de búsqueda.

---

## 5. Alta de un Nuevo Negocio Turístico

Para registrar un nuevo negocio en ANDO, presioná el botón **"+ Crear Negocio"** desde el panel principal. Se abrirá un **wizard guiado de 6 pasos** donde podés navegar hacia adelante y atrás sin perder los datos ya cargados.

> [!IMPORTANT]
> Si intentás salir del wizard habiendo ingresado datos en algún paso, el sistema pedirá confirmación antes de descartar los cambios: *"¿Está seguro que desea salir? Los datos no guardados se perderán."*

---

### 5.1 Paso 1 — Información Básica

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| **Nombre del negocio** | ✅ Sí | Nombre público visible para los turistas |
| **Descripción general** | ✅ Sí | Texto descriptivo del establecimiento |
| **Categorías** | ✅ Sí | Selección de categorías del sistema (ej. Bodega, Gastronomía, Aventura) |

Presioná **"Siguiente"** para avanzar al Paso 2.

---

### 5.2 Paso 2 — Ubicación

[Ir a Mis Negocios](/provider)

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| **Dirección física** | ✅ Sí | Calle, número y ciudad |
| **Región** | ✅ Sí | Selección en cascada (ej. Gran Mendoza) |
| **Departamento** | ✅ Sí | Selección dependiente de la Región |
| **Zona** | ❌ Opcional | Selección dependiente del Departamento |
| **Latitud** | ✅ Sí | Coordenada geográfica (podés usar el mapa interactivo para seleccionarla) |
| **Longitud** | ✅ Sí | Coordenada geográfica |

> [!TIP]
> Podés arrastrar el pin en el mapa del paso 2 para establecer las coordenadas de forma visual, en lugar de ingresarlas manualmente.

**Validaciones:** Las coordenadas deben estar dentro de rangos geográficos válidos para Mendoza.

---

### 5.3 Paso 3 — Datos de Contacto

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| **Teléfono** | ✅ Sí | Número de contacto comercial |
| **Email de contacto** | ✅ Sí | Email público del negocio (puede diferir del de tu cuenta) |
| **Sitio web** | ❌ Opcional | URL de tu sitio web |
| **Instagram** | ❌ Opcional | Usuario de Instagram (sin el @) |

**Validaciones:** El formato de email y teléfono se validan en tiempo real.

---

### 5.4 Paso 4 — Horarios de Atención

En este paso cargás los días y horarios en que tu negocio atiende al público.

1. Seleccioná uno o más días de la semana usando el **selector horizontal con scroll**.
2. Definí el rango horario (Hora de Apertura y Hora de Cierre) usando el **selector de hora táctil** o los **accesos rápidos** predefinidos:

| Acceso Rápido | Horario |
|---------------|---------|
| **Mañana** | 09:00 – 13:30 |
| **Tarde** | 16:00 – 20:00 |
| **Noche** | 20:00 – 00:00 |
| **Corrido** | 09:00 – 18:00 |

3. Presioná **"Guardar"** para registrar el horario.

**Validaciones:**

| Situación | Mensaje |
|-----------|---------|
| Hora de apertura ≥ hora de cierre | *"El horario de apertura (XX:XX) no puede ser posterior o igual al horario de cierre (YY:YY)"* |
| Superposición con horario existente | *"El rango XX:XX - YY:YY para el [Día] se superpone con un horario ya definido para este POI"* |

> [!NOTE]
> Podés agregar múltiples rangos horarios para distintos días. Todos los horarios cargados en este paso se pueden gestionar en detalle posteriormente desde la sección **"Horarios"** del panel.

---

### 5.5 Paso 5 — Fotos del Negocio

1. Presioná **"Seleccionar imagen"** para abrir el selector.
2. Elegí **"Subir desde galería"** o **"Tomar foto"**.
3. Verificá la vista previa y presioná **"Confirmar"** para agregarla.

**Restricciones de archivos:**

| Parámetro | Límite |
|-----------|--------|
| Formatos permitidos | JPG, PNG, WEBP |
| Tamaño máximo por archivo | **30 MB** |

| Situación | Mensaje |
|-----------|---------|
| Formato no permitido | *"El archivo debe ser una imagen en formato JPG, PNG o WEBP"* |
| Archivo demasiado grande | *"La imagen no puede superar los 30 MB"* |

---

### 5.6 Paso 6 — Información Adicional

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| **Precio estimado mínimo** | ❌ Opcional | Precio base del servicio o entrada |
| **Precio estimado máximo** | ❌ Opcional | Precio tope |
| **Duración estimada de visita** | ❌ Opcional | Tiempo promedio de permanencia (ej. 2 horas) |

---

### 5.7 Vista Previa y Confirmación

Al completar el Paso 6, el sistema muestra una **Vista Previa** que emula exactamente cómo verán los Turistas la ficha de tu negocio, incluyendo la insignia **"Pendiente de validación"**.

Desde esta pantalla tenés dos opciones:

| Botón | Acción |
|-------|--------|
| **"Editar"** | Vuelve al wizard para realizar correcciones |
| **"Guardar Negocio"** | Registra el negocio y lo envía al Administrador para revisión |

Al confirmar **"Guardar Negocio"**:
- El sistema muestra un mensaje de éxito.
- El negocio queda en estado **"Pendiente de validación"**.
- Una vez aprobado por el Administrador, pasará a estado **"Aprobado"** y será visible para todos los Turistas.

---

## 6. Gestión de Horarios de Atención

Accedé a los horarios de un negocio desde la tarjeta en "Mis Negocios" presionando el ícono 🕐 **"Horarios"**.

[Ir a Mis Negocios](/provider)

### 6.1 Agregar un Horario

1. En la pantalla de Horarios, presioná **"+ Agregar Horario"** o el botón de acción.
2. Se abre el panel **"Agregar Horario"** con:
   - **Selector de días:** Chips horizontales con scroll (Lun, Mar, Mié, Jue, Vie, Sáb, Dom). Podés seleccionar múltiples días simultáneamente.
   - **Hora de Apertura:** Ingresá usando la rueda táctil o el teclado.
   - **Hora de Cierre:** Ingresá usando la rueda táctil o el teclado.
   - **Accesos rápidos:** Mañana, Tarde, Noche, Corrido — completan automáticamente los campos.
3. Presioná **"Guardar"**.

Mensaje de éxito: *"Horario guardado exitosamente"*

Los horarios guardados son **visibles inmediatamente** en el perfil público del negocio.

---

### 6.2 Modificar un Horario Existente

En el listado de horarios, presioná el ícono ✏️ **editar** sobre el registro que querés cambiar:

1. Se abre el modal **"Modificar Horario"** con los valores actuales precargados.
2. Realizá los cambios necesarios (día u horario).
3. Presioná **"Guardar"**.

Para descartar cambios sin guardar, presioná **"Cancelar"**, la ✕ o tocá fuera del modal.

> [!WARNING]
> Si el cambio de horario afecta itinerarios de Turistas que tienen tu negocio planificado, el sistema enviará automáticamente una notificación a esos turistas y marcará la parada como **"requiere revisión"** en sus itinerarios.

---

### 6.3 Eliminar un Horario

En el listado de horarios, presioná el ícono 🗑️ **eliminar** sobre el registro correspondiente:

1. El sistema muestra un **diálogo de confirmación**.
2. Presioná **"Aceptar / Eliminar"** para confirmar, o **"Cancelar"** para mantener el horario.

**Caso especial — Eliminar el último horario:**

> [!CAUTION]
> Si eliminás el único horario de tu negocio, el perfil público mostrará **"Horario no disponible"** y el negocio quedará **excluido de los filtros de disponibilidad** del motor de recomendación de itinerarios. Los turistas no podrán agregarlo fácilmente a sus viajes.

---

### 6.4 Impacto en Itinerarios de Turistas

Cuando modificás o eliminás un horario, el sistema:

1. Detecta automáticamente si algún turista tiene tu negocio planificado en un itinerario.
2. Envía una **notificación** al turista afectado: *"Tu itinerario '[Nombre]' requiere revisión. El prestador de '[Nombre del Negocio]' modificó los horarios de atención."*
3. Marca esa parada en el itinerario del turista como **"requiere revisión"**.

---

## 7. Gestión de Multimedia (Galería de Imágenes)

Accedé a la galería desde la tarjeta del negocio presionando el ícono 📸 **"Multimedia"**.

[Ir a Mis Negocios](/provider)

### 7.1 Subir una Imagen

1. Presioná el botón **"+ Subir Imagen"**.
2. Elegí la fuente:
   - **"Subir desde galería"** — Seleccioná una foto existente de tu dispositivo.
   - **"Tomar foto"** — Usá la cámara del dispositivo directamente.
3. El sistema procesa la imagen en segundo plano (redimensionado y compresión optimizada).
4. Mientras se procesa, la miniatura muestra el estado **"Procesando imagen..."** con un spinner.
5. Al finalizar el procesamiento, la imagen queda disponible en la galería pública.

**Restricciones:**

| Parámetro | Límite |
|-----------|--------|
| Formatos permitidos | JPG, PNG, WEBP |
| Tamaño máximo | **30 MB** por imagen |

| Situación | Mensaje |
|-----------|---------|
| Formato inválido | *"El archivo debe ser una imagen en formato JPG, PNG o WEBP"* |
| Imagen demasiado pesada | *"La imagen no puede superar los 30 MB"* |
| Servicio de almacenamiento no disponible | *"No fue posible subir la imagen en este momento. Intentá más tarde."* |
| Error de procesamiento | *"La imagen no pudo procesarse correctamente, intente subirla nuevamente"* |
| Pérdida de conexión durante subida | La operación se cancela automáticamente sin guardar registros incompletos |

---

### 7.2 Reemplazar una Imagen

Para cambiar una foto ya publicada sin eliminarla primero:

1. Presioná el ícono 📷 **"Reemplazar"** en la esquina inferior de la miniatura.
2. Seleccioná la nueva imagen desde galería o cámara.
3. El sistema elimina la imagen anterior del almacenamiento y sube la nueva.

Mensaje de éxito: *"Ha actualizado una de las imágenes de su POI"*

---

### 7.3 Eliminar una Imagen

1. Presioná el ícono 🗑️ **"Eliminar"** en la esquina inferior de la miniatura.
2. Si tenés **2 o más imágenes**: el sistema elimina directamente y muestra *"Su imagen fue eliminada exitosamente"*.
3. Si es la **única imagen** del negocio:

> [!CAUTION]
> El sistema muestra la advertencia: *"Tu POI quedará sin imágenes. ¿Confirmás la eliminación?"*. Solo procede tras presionar **"Confirmar"**.

---

## 8. Gestión de Servicios

Accedé a la gestión de servicios desde la tarjeta del negocio presionando el ícono 🛎️ **"Servicios"**.

### 8.1 Ver Servicios Existentes

Al ingresar a **"Gestionar Servicios"**, verás el listado de todos los servicios asociados al negocio, con:
- Nombre del servicio
- Precio estimado
- Duración
- Estado (activo / inactivo)
- Disponibilidad

---

### 8.2 Agregar un Servicio

1. Presioná **"Agregar Servicio"**.
2. Completá el formulario:

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| **Nombre del servicio** | ✅ Sí | Ej. "Visita guiada con degustación" |
| **Descripción** | ✅ Sí | Detalle del servicio ofrecido |
| **Categoría** | ✅ Sí | Tipo de servicio |
| **Precio estimado** | ✅ Sí | Debe ser mayor o igual a cero |
| **Duración** | ✅ Sí | En minutos u horas, debe ser mayor a cero |
| **Capacidad máxima** | ❌ Opcional | Cantidad de personas |
| **Condiciones de contratación** | ❌ Opcional | Requisitos o restricciones |
| **Estado de disponibilidad** | ✅ Sí | Activo o Inactivo |

3. Presioná **"Guardar Servicio"**.

**Validaciones:**

| Situación | Mensaje |
|-----------|---------|
| Campos obligatorios vacíos | El botón "Guardar Servicio" permanece bloqueado |
| Precio negativo | *"El precio del servicio no puede ser negativo"* |
| Duración inválida o cero | *"La duración del servicio debe ser mayor a cero"* |
| Servicio guardado correctamente | *"Servicio guardado correctamente"* |

---

### 8.3 Modificar un Servicio

1. Presioná el ícono ✏️ **editar** sobre el servicio deseado.
2. Modificá los campos necesarios.
3. Presioná **"Guardar"**.

Mensaje de éxito: *"Servicio actualizado correctamente"*

---

### 8.4 Activar o Desactivar un Servicio

Desde el listado de servicios:
- **Desactivar:** El servicio deja de mostrarse en el perfil público del negocio y en las recomendaciones del motor de IA. El servicio **no se elimina**, solo se oculta.
- **Activar:** El servicio vuelve a estar visible y disponible para búsquedas y recomendaciones.

---

### 8.5 Eliminar un Servicio

1. Presioná el ícono 🗑️ **eliminar** sobre el servicio.
2. El sistema solicita confirmación: *"¿Está seguro que desea eliminar este servicio?"*
3. Presioná **"Confirmar"** para eliminarlo o **"Cancelar"** para conservarlo.

| Acción | Mensaje |
|--------|---------|
| Eliminación confirmada | *"Servicio eliminado correctamente"* |
| Eliminación cancelada | *"Operación cancelada"* |

---

## 9. Gestión de Opiniones (Reseñas)

Accedé a las reseñas desde la tarjeta del negocio presionando el ícono ⭐ **"Opiniones"**.

[Ir a Mis Negocios](/provider)

### 9.1 Ver Reseñas Recibidas

Al ingresar a la sección de **Opiniones**, verás el listado de todas las reseñas asociadas a tu negocio, **ordenadas cronológicamente de más recientes a más antiguas**. Cada reseña muestra:

- Foto de perfil y nombre del turista
- Puntuación otorgada (1-5 estrellas)
- Comentario del turista
- Fecha de publicación
- Fotos adjuntas (si las hay)
- Badge **"Pendiente de responder"** si aún no respondiste

---

### 9.2 Responder a una Reseña

Para responder públicamente a un comentario de un turista:

1. Encontrá la reseña en el listado.
2. En el área de texto debajo de la reseña, escribí tu respuesta (máximo **1.000 caracteres**).
3. Presioná **"Publicar Respuesta"**.

Al publicar:
- La respuesta se inserta de forma inmediata en la plataforma.
- Los turistas verán tu respuesta **debajo del comentario original**, identificada con la etiqueta **"Respuesta del propietario"**.
- La reseña pasa del estado "Pendiente de responder" a "Respondida".

> [!NOTE]
> El botón **"Publicar Respuesta"** permanece deshabilitado si el campo de texto está vacío. Al intentarlo, verás el mensaje: *"La respuesta no puede estar vacía"*.

**Responder desde otras vistas:**
También podés responder reseñas directamente desde la **ficha de tu negocio en el mapa**, sin necesidad de ir al panel de "Mis Negocios". Esto te permite gestionar respuestas pendientes de forma más rápida y contextual.

---

### 9.3 Notificaciones de Nuevas Reseñas

El sistema te mantiene informado sobre las reseñas de tus negocios de tres maneras:

1. **Centro de Notificaciones:** Cada vez que un turista publica una reseña sobre uno de tus negocios, recibís una notificación con el mensaje: *"Tenés una nueva reseña en [Nombre del Negocio] esperando tu respuesta"*, con un acceso directo a esa reseña.

2. **Panel Principal:** En la pantalla **"Mis Negocios"**, podés ver el **contador de reseñas pendientes de responder** sumado de todos tus negocios, destacado visualmente.

3. **Tarjeta de Opiniones:** El ícono ⭐ en cada tarjeta de negocio muestra un **badge numérico** con la cantidad de reseñas sin responder de ese negocio específico.

---

## 10. Edición del Perfil del Prestador

### 10.1 Editar Información Personal

Accedé a tu perfil personal desde el ícono de perfil en la navegación principal:

1. Presioná **"Editar Perfil"**.
2. Modificá los campos disponibles:

| Campo | Descripción |
|-------|-------------|
| **Nombre y Apellido** | Datos personales del titular de la cuenta |
| **Teléfono** | Número de contacto personal |
| **Email** | Correo electrónico de acceso a la cuenta |
| **Contraseña** | Para cambiarla, deberás ingresar la contraseña actual, la nueva y la confirmación |

3. Presioná **"Guardar"** y confirmá los cambios en el diálogo de confirmación.

| Situación | Mensaje |
|-----------|---------|
| Guardado exitoso | *"Perfil actualizado correctamente"* |
| Cancelar edición | *"Los cambios se descartarán si confirma esta acción. ¿Está seguro que desea deshacer los cambios?"* |

---

### 10.2 Editar Información Comercial del POI

Para editar los datos de un negocio ya registrado (nombre, descripción, categoría, ubicación, contacto, etc.):

1. Desde **"Mis Negocios"**, presioná sobre la tarjeta del negocio que querés editar.
2. Seleccioná la opción **"Editar información del POI"**.
3. Si tenés **más de un POI asociado**, el sistema mostrará primero un modal preguntando cuál negocio querés modificar.
4. El formulario aparece pre-completado con la información actual.

**Campos editables:**

| Campo | Descripción |
|-------|-------------|
| Nombre de Organización / Razón Social | Nombre legal de tu empresa |
| Nombre del POI | Nombre visible para los turistas |
| Descripción | Texto descriptivo actualizado |
| Categoría | Tipo de negocio turístico |
| Servicio Ofrecido | Descripción general de los servicios |
| Contacto | Teléfono, email, web, redes sociales |
| Ubicación | Dirección y coordenadas |
| Logo | Imagen representativa de la marca |
| Imágenes del POI | Fotos de la galería |

5. Presioná **"Guardar los cambios"** y confirmá.

| Situación | Mensaje |
|-----------|---------|
| Campos obligatorios vacíos | El sistema impide guardar |
| Cambios guardados | *"Perfil actualizado correctamente"* |
| Cancelar | *"Los cambios se descartarán si confirma esta acción"* |

---

## 11. Gestión de Cuenta

### 11.1 Cerrar Sesión

Para cerrar tu sesión de forma segura:

1. Accedé a tu perfil.
2. Presioná **"Cerrar Sesión"**.
3. Confirmá en el diálogo: *"¿Está seguro que quiere cerrar la sesión? Si lo hace deberá iniciar sesión nuevamente para acceder al panel de gestión."*

| Acción | Resultado |
|--------|-----------|
| Confirmar | Cierra la sesión, invalida el token y redirige al Login |
| Cancelar | Mantiene la sesión activa sin cambios |

---

### 11.2 Eliminar Cuenta

> [!CAUTION]
> Eliminar tu cuenta como Prestador implica que todos tus negocios (POIs) serán dados de baja y dejarán de ser visibles para los turistas en la plataforma. Esta acción es de carácter lógico, lo que significa que algunos datos pueden mantenerse internamente por razones legales o de auditoría.

Para eliminar tu cuenta:

1. Desde tu perfil, presioná **"Eliminar cuenta"** al final del formulario.
2. El sistema informa sobre las consecuencias: tus negocios dejarán de estar visibles y los datos relacionados al POI se perderán (a menos que exista una reseña asociada y el negocio sea reingresado y aprobado posteriormente).
3. Aparecen dos botones:
   - **"Confirmar"** → La cuenta es desactivada y no podrás volver a ingresar.
   - **"Cancelar"** → La cuenta se mantiene activa con el mensaje *"Operación cancelada"*.
4. Al eliminar exitosamente: *"La cuenta fue eliminada correctamente"* y serás redirigido al Login.

---

## 12. Exploración del Mapa como Prestador

Como Prestador también tenés acceso al **módulo de mapa interactivo**, que te permite:

- Visualizar cómo aparece tu negocio **desde la perspectiva del turista** en el mapa.
- Verificar que la **ubicación del pin** sea correcta según las coordenadas que cargaste.
- Ver qué información aparece en el **popup** al presionar tu pin (nombre, categoría, horario, fotos, reseñas).
- **Responder reseñas** directamente desde la ficha de detalle de tu propio negocio en el mapa, sin necesidad de ir al panel de gestión.

> [!NOTE]
> Solo ves los negocios en estado **"Aprobado"** en el mapa. Si tu negocio está "Pendiente de Validación", aún no aparecerá en la vista pública del mapa.

---

## 13. Reportar Contenido

Como Prestador también podés reportar contenido inapropiado que encuentres en la plataforma:

**Reportar una reseña sobre tu negocio:**

1. Desde la sección **"Opiniones"** de tu negocio, encontrá la reseña problemática.
2. Presioná el botón **"Reportar"** sobre esa reseña.
3. En el modal que aparece, seleccioná el motivo:
   - Contenido ofensivo o inapropiado
   - Información falsa o engañosa
   - Spam
   - Otro
4. Opcionalmente agregá una aclaración.
5. Presioná **"Enviar Reporte"**.

Mensaje de confirmación: *"Gracias por tu reporte. El equipo de soporte lo revisará a la brevedad"*

> [!NOTE]
> Reportar una reseña **no la elimina automáticamente**. El equipo de administradores la revisará y tomará la decisión correspondiente.

---

## 14. Mensajes y Notificaciones del Sistema

Referencia rápida de los mensajes más frecuentes para el rol Prestador:

| Mensaje | Contexto | Acción sugerida |
|---------|----------|-----------------|
| *"El correo ya se encuentra registrado"* | Registro | Usá otro email o iniciá sesión con ese correo |
| *"Horario guardado exitosamente"* | Gestión de horarios | Confirmación de operación exitosa |
| *"El rango XX:XX - YY:YY se superpone con un horario ya definido"* | Carga de horarios | Elegí un rango que no se superponga |
| *"El horario de apertura no puede ser posterior o igual al cierre"* | Carga de horarios | Corregí las horas ingresadas |
| *"Horario no disponible"* | Vista pública del POI | Cargá al menos un horario de atención |
| *"Procesando imagen..."* | Subida de multimedia | Esperá a que finalice el procesamiento |
| *"La imagen no puede superar los 30 MB"* | Subida de multimedia | Reducí el tamaño de la imagen |
| *"El archivo debe ser JPG, PNG o WEBP"* | Subida de multimedia | Convertí el archivo al formato correcto |
| *"Tu POI quedará sin imágenes. ¿Confirmás?"* | Eliminar última foto | Considerá mantener al menos una imagen |
| *"Servicio guardado correctamente"* | Gestión de servicios | Confirmación de operación exitosa |
| *"La respuesta no puede estar vacía"* | Responder reseña | Escribí algo antes de publicar |
| *"Tu respuesta se ha publicado correctamente"* | Responder reseña | Confirmación de respuesta publicada |
| *"Tenés una nueva reseña en [Negocio]..."* | Notificación push | Ingresá a Opiniones para responder |
| *"Tu itinerario requiere revisión..."* | Notificación a turistas | Se envía automáticamente si cambiás horarios |
| *"Perfil actualizado correctamente"* | Edición de perfil | Confirmación de datos guardados |
| *"La cuenta fue eliminada correctamente"* | Eliminar cuenta | Confirmación de baja de cuenta |

---

## 15. Preguntas Frecuentes (FAQ)

**¿Cuánto tiempo tarda en aprobarse mi cuenta de Prestador?**
El proceso de validación lo realiza el equipo de administradores de ANDO. Los tiempos pueden variar según el volumen de solicitudes. Recibirás una notificación una vez que tu cuenta sea aprobada.

---

**¿Por qué mi negocio no aparece en el mapa si ya lo registré?**
Tu negocio solo será visible en el mapa una vez que el Administrador lo haya revisado y cambiado su estado a **"Aprobado"**. Mientras esté en estado "Pendiente de Validación", no será visible para los turistas.

---

**¿Puedo tener más de un negocio en ANDO?**
Sí. Podés registrar múltiples negocios turísticos bajo tu cuenta de Prestador. Cada negocio se gestiona de forma independiente desde el panel "Mis Negocios".

---

**¿Qué pasa con los itinerarios de los turistas si cambio mis horarios?**
El sistema detecta automáticamente qué turistas tienen tu negocio en un itinerario planificado y les envía una notificación para que revisen su viaje. La parada queda marcada como "requiere revisión" en su itinerario.

---

**¿Puedo eliminar una reseña negativa?**
No. Como Prestador, no podés eliminar las reseñas que los turistas publican sobre tu negocio. Sí podés **responderlas públicamente** para contextualizar o aclarar situaciones. Si considerás que la reseña viola las normas de la comunidad (contenido ofensivo, spam, etc.), podés **reportarla** para que el equipo administrativo la revise.

---

**¿Puedo responder la misma reseña más de una vez?**
Cada reseña admite una única respuesta del propietario. Si necesitás modificar tu respuesta publicada, consultá si hay opción de edición desde el ícono ✏️ que aparece junto a tu respuesta.

---

**¿Mis servicios se usan en las recomendaciones de IA?**
Sí. Los servicios que cargás (con precios, duración y disponibilidad) son utilizados por el motor de recomendación de ANDO para sugerir tu negocio a turistas según sus preferencias, presupuesto e intereses. Mantené la información actualizada para maximizar tu visibilidad.

---

**¿Qué formatos acepta la galería de imágenes?**
La galería acepta archivos JPG, PNG y WEBP con un peso máximo de **30 MB por imagen**. Las imágenes se procesan automáticamente en distintas resoluciones (thumbnail, medium, full) para una visualización óptima en todos los dispositivos.

---

**¿Cómo puedo ver cómo luce mi negocio para los turistas?**
Accedé al módulo **Mapa** desde la navegación principal. Si tu negocio está aprobado, encontrarás su pin en el mapa. Al presionarlo, verás exactamente la información que visualiza un turista: fotos, descripción, horarios, reseñas y categorías.

---

*Manual de Usuario — ANDO App v1.0 | UTN FRM 2026*  
*Proyecto Final de Carrera — Diseño y desarrollo de aplicación de turismo inteligente para el Gran Mendoza*
