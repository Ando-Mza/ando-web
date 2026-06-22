# ANDO: Web Management Portal - Repository Initialization & Context Prompt 🏔️💻
**Contexto Académico:** Proyecto Final de Carrera (PFC) - UTN FRM (Año Académico 2026)
**Fase de Desarrollo:** Etapa 5 (Diseño de Interfaces) e Inicio de Etapa 6 (Implementación)
**Stack Tecnológico Core:** React (Next.js 14+ App Router) + TypeScript + Tailwind CSS

---

## 1. Misión y Contexto del Portal Web (UI/UX Focus)
Actuarás como el **Ingeniero de Frontend Web Principal** para **ando-web**, el portal de gestión y administración de **ANDO** (aplicación de turismo inteligente para el Gran Mendoza, Argentina). 

Este portal web está de forma exclusiva destinado a dos roles de usuarios clave:
1. **Administradores del Sistema:** Encargados de configurar parámetros de negocio, gestionar idiomas, categorías, integraciones y validar de forma crítica el contenido subido.
2. **Prestadores de Servicios Turísticos (Dueños de Negocios):** Encargados de gestionar su perfil comercial, cargar/editar días y horarios de atención, temporadas, y subir recursos multimedia de sus puntos de interés (POIs).

El enfoque visual debe ser **premium, limpio y altamente intuitivo**, consistente con la aplicación móvil pero optimizado para pantallas de escritorio (desktop). Se debe priorizar el uso de espaciados generosos, paneles tipo tarjeta con sombreados sutiles, micro-animaciones en interacciones (hover/pressed) y una distribución limpia de los datos mediante tablas responsivas, dashboards visuales y formularios estructurados.

---

## 2. Design Tokens Oficiales (Semántica del Color y Tipografía)
El portal web debe reflejar con total precisión la identidad visual de la marca ANDO, adaptada a clases de utilidad de **Tailwind CSS**.

### 2.1 Paleta de Colores en Tailwind CSS
Configura tu archivo `tailwind.config.js` para mapear los siguientes tokens oficiales:
*   `fillPrimary` / `bg-fillPrimary`: `#E96509` (Naranja terracota). Uso para botones de acción principal (CTA), botones de guardado crítico y estados activos de navegación.
*   `fillSecondary` / `bg-fillSecondary`: `#F2904A` (Naranja atardecer). Uso para CTAs secundarios, badges de estado/categoría y acentos interactivos secundarios.
*   `bgPrimary` / `bg-bgPrimary`: `#FFFAF5` (Crema cálido/off-white). Fondo base del portal. Reemplaza el blanco puro para reducir la fatiga visual.
*   `accentPurple` / `bg-accentPurple` / `text-accentPurple`: `#8E527D` (Malbec suave). Uso exclusivo para elementos del ecosistema de Inteligencia Artificial (ej: sugerencias de optimización del asistente o paneles de IA).
*   `accentWine` / `text-accentWine` / `bg-accentWine`: `#750031` (Vino profundo/borgoña). Color para tipografías de alta jerarquía (títulos de sección, headers) e iconografía de enoturismo.
*   `textDark` / `text-textDark`: `#2C2C2C` (Gris oscuro). Color base para el texto del cuerpo. Nunca utilices negro puro `#000000` sobre el fondo crema.

### 2.2 Jerarquía Tipográfica (Google Fonts)
*   **Encabezados de Identidad / Títulos Hero:** `Unbounded` (700 Bold). Uso exclusivo para logueo, onboarding o títulos destacados de la marca.
*   **Títulos de Interfaz (H1, H2, H3):** `Wix Madefor Display` (SemiBold / Bold). Para nombres de secciones del dashboard, títulos de tablas y modales.
*   **Texto de Lectura y Controles:** `Wix Madefor Text` (Regular / Medium). Para descripciones, inputs de texto, botones, tablas y texto corporal.

---

## 3. Arquitectura del Repositorio Web (`ando-web`)
El proyecto frontend web se organiza mediante el **App Router de Next.js** bajo la siguiente estructura modular:

```text
ando-web/
├── public/                 # Recursos estáticos (Logos, imágenes de mock)
├── src/
│   ├── app/                # Enrutamiento App Router (Next.js 14+)
│   │   ├── layout.tsx      # Configuración de HTML base, fuentes de Google y estilos globales
│   │   ├── page.tsx        # Login / Acceso
│   │   ├── admin/          # Rutas exclusivas para el Administrador
│   │   │   ├── layout.tsx  # Dashboard Layout del Admin (Sidebar lateral + Header superior)
│   │   │   ├── dashboard/  # Métricas globales de la plataforma
│   │   │   ├── validation/# GIT: Pantalla de validación de POIs, horarios y reseñas
│   │   │   └── settings/   # CYP: Gestión de parámetros, idiomas e integraciones
│   │   └── provider/       # Rutas exclusivas para el Prestador de Turismo
│   │       ├── layout.tsx  # Dashboard Layout del Prestador
│   │       ├── dashboard/  # Métricas del negocio
│   │       ├── business/   # Gestión de datos del local/bodega/actividad
│   │       └── schedules/  # GIT: Carga y edición de horarios, días y temporadas
│   ├── components/         # Catálogo de Componentes Reutilizables
│   │   ├── ui/             # Componentes básicos (Button, Input, Card, Table, Modal, Switch)
│   │   ├── layout/         # Sidebar navigation, Header, UserMenu
│   │   └── charts/         # Componentes visuales de reportes / gráficos (mock)
│   ├── theme/              # Centralización de estilos (tailwind.config.js, globals.css)
│   ├── types/              # Definición de interfaces TypeScript (POI, Schedule, User, Log)
│   └── utils/              # Parsers, simuladores de conexión, helpers de fechas/horas
```

---

## 4. Módulos y Roles de la Plataforma
El desarrollo web se centra en implementar las siguientes especificaciones funcionales distribuidas en dos módulos principales:

### 4.1 Módulo CYP (Configuración de Parámetros)
Destinado a administradores para controlar el comportamiento del sistema:
*   **Parámetros Generales (US-CYP-01):** Modificación de límites, variables globales y políticas.
*   **Idiomas (US-CYP-02):** Gestión del diccionario de traducciones.
*   **Categorías Turísticas (US-CYP-03) e Integraciones (US-CYP-07):** Habilitar/deshabilitar APIs de mapas, clima y pasarelas de pago.

### 4.2 Módulo GIT (Gestión de Información Turística)
Destinado a prestadores para mantener actualizada su oferta y a administradores para auditarla:
*   **Carga y Modificación de Horarios (US-GIT-01/02/03/04/08):** Formulario avanzado con soporte para múltiples franjas horarias por día, selección de temporadas (alta/media/baja) y feriados.
*   **Validación de Contenido (US-GIT-07):** Panel para administradores donde listan elementos pendientes de validación (POIs modificados, imágenes subidas) con acciones de *Aprobar* o *Rechazar* con feedback.
*   **Multimedia R2 (US-GIT-09/11):** Interfaz de subida (Drag & Drop) de imágenes para prestadores simulando la subida directa a Cloudflare R2 y eliminador seguro para el administrador.

---

## 5. Instrucciones Operativas para el Agente Web (Next.js/Tailwind)

1. **Uso de Tailwind CSS:** Está estrictamente prohibido utilizar hojas de estilo ad-hoc o inline CSS en los componentes. Utiliza las clases de utilidad de Tailwind CSS mapeadas a los tokens de diseño oficiales.
2. **Simulación de Datos (Mocking):** El portal debe operar de forma totalmente funcional en el frontend utilizando datos mockeados almacenados localmente en constantes o archivos JSON. No conectes bases de datos reales en esta fase de diseño e interacción visual.
3. **Responsividad Premium:** Todos los layouts de dashboard (sidebars colapsables, grillas de métricas) y componentes de gestión (tablas de validación, modales de edición) deben estar optimizados tanto para pantallas de escritorio amplias como para tablets en modo horizontal.
4. **Validaciones de Formularios:** Asegúrate de validar los formularios de carga de horarios (evitando horas de fin previas a horas de inicio, solapamiento de rangos) y subida de multimedia con estados de error claros y visualmente pulidos (colores HSL y animaciones de sacudida).
5. **GitFlow y Convención de Commits:** Respeta estrictamente Conventional Commits en el repositorio (`feat(web-ui): ...`, `fix(web-cyp): ...`).

---

## 6. Documentación de Referencia y User Stories (`/docs`)
El repositorio de ANDO cuenta con especificaciones funcionales y de diseño detalladas en la carpeta `/docs`, que sirven de guía directa para las reglas de negocio de ambos entornos (Mobile y Web):

### 6.1 Estructura del Directorio de Documentación
*   **`docs/design/`**
    *   Reglas de componentes en md. y sus estados visuales.
*   **`docs/user-stories/`**
    *   `README.md`: Directorio de referencia y mapeo de historias de usuario.
    * Una carpeta por módulo de la app en principio serían /PAD /CYN y /CYP

