# Manual de Usuario — ANDO App (Panel Web)
### Rol: Administrador
**Proyecto Final de Carrera | UTN FRM — Año Académico 2026**

---

> [!NOTE]
> Este manual cubre exclusivamente las funcionalidades disponibles para el rol **Administrador** a través del **Panel Web** de ANDO. A diferencia de los Turistas y Prestadores, el Administrador gestiona la plataforma desde una interfaz de escritorio/tablet.

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos de Acceso](#2-requisitos-de-acceso)
3. [Acceso al Sistema](#3-acceso-al-sistema)
4. [Dashboard General](#4-dashboard-general)
5. [Gestión de Validaciones](#5-gestión-de-validaciones)
   - 5.1 [Revisar Solicitudes](#51-revisar-solicitudes)
   - 5.2 [Aprobar o Rechazar](#52-aprobar-o-rechazar)
6. [Moderación de Contenido](#6-moderación-de-contenido)
   - 6.1 [Origen de los Reportes](#61-origen-de-los-reportes)
   - 6.2 [Resolución de Casos](#62-resolución-de-casos)
7. [Administración de Usuarios](#7-administración-de-usuarios)
8. [Reportes y Analíticas](#8-reportes-y-analíticas)
9. [Configuraciones Generales](#9-configuraciones-generales)
10. [Preguntas Frecuentes (FAQ)](#10-preguntas-frecuentes-faq)

---

## 1. Introducción

El **Panel Web de Administración** es el centro de control de la plataforma **ANDO**. Desde aquí, el equipo administrativo monitorea la salud del sistema, valida la autenticidad de los prestadores y negocios, modera el contenido reportado y gestiona las cuentas de todos los usuarios.

### Módulos Principales:
| Módulo | Función |
|--------|---------|
| 📊 **Dashboard** | Métricas clave (KPIs) y gráficos del estado general. |
| ✅ **Validaciones** | Aprobación de cuentas de Prestadores y nuevos POIs. |
| 🛡️ **Moderación** | Revisión de reportes de usuarios y detección de IA. |
| 👥 **Usuarios** | Gestión completa del padrón de usuarios (CRUD). |
| 📈 **Reportes** | Estadísticas detalladas de uso y comportamiento. |
| ⚙️ **Configuración** | Parámetros globales del sistema. |

---

## 2. Requisitos de Acceso

Para una experiencia óptima en el panel de administración, se recomienda:
- **Dispositivo:** Computadora de escritorio, notebook o tablet con resolución mínima de 1024x768.
- **Navegador:** Versiones recientes de Google Chrome, Mozilla Firefox, Safari o Edge.
- **Conexión:** Acceso estable a Internet.

> [!WARNING]
> La vista de administración **no está optimizada para pantallas de teléfonos móviles**, debido a la densidad de información en las tablas de datos y gráficos.

---

## 3. Acceso al Sistema

### Inicio de Sesión
1. Ingresá a la URL del panel web de ANDO.
2. Ingresá tu correo electrónico institucional y contraseña.
3. Presioná **"Ingresar"**.
4. Si las credenciales son correctas y posees el rol `Administrador`, el sistema te redirigirá automáticamente al **Dashboard General**.

### Recuperación de Contraseña
El flujo es idéntico al de la aplicación móvil. Ingresá tu email en "Olvidé mi contraseña" para recibir un enlace seguro de recuperación, válido por 1 hora.

---

## 4. Dashboard General

El Dashboard es la pantalla de inicio del Administrador, diseñada para ofrecer una vista rápida del estado de la plataforma.

![Dashboard General del Administrador](C:\Users\marti\.gemini\antigravity\brain\2ffd65d7-85b5-4451-99df-1421beedf654\ando_admin_dashboard_1791419672238.jpg)

### Elementos del Dashboard:
- **Filtro Temporal:** Ubicado en la esquina superior derecha (ej. "Últimos 30 días", "Este año"). Al cambiarlo, todos los indicadores y gráficos se actualizan dinámicamente sin recargar la página.
- **Tarjetas KPI:**
  - **Total Usuarios:** Usuarios registrados activos.
  - **Itinerarios Activos:** Viajes en curso o planificados a futuro.
  - **POIs Validados:** Negocios aprobados y visibles en el mapa.
  - **Reseñas Pendientes:** Reportes o reseñas esperando moderación.
- **Gráficos:**
  - *Crecimiento de Usuarios:* Gráfico de barras agrupado por fecha de alta.
  - *Top 5 POIs más visitados:* Gráfico circular que muestra los destinos más populares en el período seleccionado.

> [!NOTE]
> Si seleccionás un período sin actividad, los KPIs mostrarán "0" y los gráficos indicarán *"No hay datos registrados en este período"*.

---

## 5. Gestión de Validaciones

Este módulo garantiza que los negocios que se muestran a los turistas sean reales y seguros.

![Módulo de Gestión de Validaciones](C:\Users\marti\.gemini\antigravity\brain\2ffd65d7-85b5-4451-99df-1421beedf654\ando_admin_validations_1791419686311.jpg)

### 5.1 Revisar Solicitudes
La tabla muestra todas las solicitudes pendientes ordenadas por fecha.
- **Tipo:** Puede ser la cuenta de un `Prestador` o un `POI` (Negocio Turístico).
- **Entidad:** El nombre del negocio o prestador.
- **Detalle:** Al hacer clic en una fila (Ver más), se despliega la **documentación adjunta** (fotos, CUIT, etc.) cargada por el prestador durante su registro.

### 5.2 Aprobar o Rechazar
En la columna de Acciones, tenés dos opciones:
- ✅ **Aprobar:** Cambia el estado a "Validado/Aprobado". El POI o Prestador pasa a estar activo en la plataforma y se notifica al dueño.
- ❌ **Rechazar:** Abre un modal donde **debés ingresar el motivo del rechazo**. El estado cambia a "Rechazado" (o "Corrección Solicitada") y se notifica al prestador para que subsane el error.

---

## 6. Moderación de Contenido

Este módulo es fundamental para mantener un entorno seguro y libre de spam.

![Módulo de Moderación de Contenido](C:\Users\marti\.gemini\antigravity\brain\2ffd65d7-85b5-4451-99df-1421beedf654\ando_admin_moderation_1791419728179.jpg)

### 6.1 Origen de los Reportes
Los casos llegan a la bandeja de moderación por dos vías:
1. **Reporte de Usuarios:** Un Turista o Prestador denunció manualmente una reseña o comentario. Se muestra el motivo y el autor de la denuncia.
2. **Detectado por IA:** El motor de Inteligencia Artificial de ANDO marcó automáticamente un texto por posible spam, lenguaje ofensivo o inapropiado.

Podés usar los filtros superiores para ver solo lo reportado por usuarios o por IA.

### 6.2 Resolución de Casos
Al hacer clic en un reporte, se abre el modal de **Detalle del Reporte** con el texto completo. Opciones de resolución:

| Botón | Efecto | Cuándo usarlo |
|-------|--------|---------------|
| 🔴 **Eliminar Contenido** | El contenido recibe una baja lógica (deja de ser visible). El reporte pasa a "Resuelto". Se audita la acción. | Cuando se confirma que el contenido viola las políticas (spam, insultos). |
| ⚪ **Desestimar Reporte** | El contenido se mantiene público. El reporte pasa a "Desestimado". | Cuando el reporte es un falso positivo o no viola las normas. |

> [!TIP]
> **Penalización Directa:** Si el contenido es grave, el detalle del reporte incluye un atajo para "Suspender Usuario autor" sin tener que ir a la pantalla de Usuarios.

---

## 7. Administración de Usuarios

Permite visualizar y controlar todas las cuentas (Turistas, Prestadores y otros Administradores).

![Módulo de Administración de Usuarios](C:\Users\marti\.gemini\antigravity\brain\2ffd65d7-85b5-4451-99df-1421beedf654\ando_admin_users_1791419738339.jpg)

### Funcionalidades:
- **Búsqueda Avanzada:** Barra de búsqueda por nombre, email o rol.
- **Listado:** Tabla paginada con Nombre, Email, Rol y Estado (Activo/Suspendido).
- **Editar Usuario (✏️):** Permite modificar información de la cuenta. Requiere confirmación para guardar. Si cancelás, se advierte sobre la pérdida de cambios.
- **Eliminar Usuario (🗑️):** Aplica una **baja lógica**. El usuario ya no podrá acceder con sus credenciales y aparecerá con estado rojo "Suspendido/Eliminado".

---

## 8. Reportes y Analíticas

El módulo de reportes permite extraer información valiosa para la toma de decisiones.

### Reporte de POIs más Visitados (Tasa de Abandono)
Este reporte especializado cruza los datos de planificación vs. realidad:
1. **Apariciones en Itinerarios:** Cuántas veces un POI fue agregado a un viaje.
2. **Visitas Efectivas:** Cuántas veces el turista marcó ese POI como "completado" o hizo Check-in geolocalizado.

> [!IMPORTANT]
> **Tasa de Abandono:** Si un POI tiene muchas apariciones en itinerarios pero bajas visitas efectivas, significa que los turistas lo planifican pero no llegan a ir. Esto puede indicar problemas de accesibilidad, horarios incorrectos o falta de interés real.

---

## 9. Configuraciones Generales

El módulo de parámetros del sistema permite ajustar reglas globales sin necesidad de modificar el código:

- Tiempos de expiración de sesión.
- Tamaños máximos de subida de archivos (ej. 30MB para fotos).
- Distancia máxima en kilómetros para sugerencias del motor de IA.
- Activación/Desactivación de mantenimiento.

*Toda modificación en este panel queda registrada en los logs de auditoría.*

---

## 10. Preguntas Frecuentes (FAQ)

**¿Qué pasa si apruebo por error un negocio falso?**
Podés buscar el POI en el sistema, ingresar a su detalle y cambiar su estado manualmente a "Suspendido" o "Rechazado", lo que lo ocultará inmediatamente del mapa público.

---

**¿Por qué hay reportes sin "Usuario reportante"?**
Son los reportes generados automáticamente por la Inteligencia Artificial de ANDO al detectar lenguaje inapropiado durante la publicación de una reseña.

---

**¿La eliminación de usuarios borra sus datos de la base de datos?**
No. Por cuestiones de auditoría e integridad referencial, las eliminaciones son "lógicas". La cuenta se desactiva y se oculta su contenido, pero los registros persisten en la base de datos.

---

**¿Puedo crear otro usuario Administrador?**
Sí. Desde el módulo de Administración de Usuarios, usando el botón "+ Nuevo Usuario" y asignándole el rol `Administrador`. Tienen los mismos privilegios que tu cuenta.

---

*Manual de Usuario — ANDO App (Admin Web) v1.0 | UTN FRM 2026*
