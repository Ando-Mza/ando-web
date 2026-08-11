# US-CYP-02: Gestión del Idioma

## Información General
*   **Identificador:** US-CYP-02
*   **Actor:** Turista
*   **Puntos de Historia:** 8
*   **Precondiciones:**
    *   El usuario debe tener la aplicación abierta.
    *   El usuario debe tener un itinerario en estado "En curso" con actividades programadas a futuro.
*   **Historias de Usuario Relacionadas:** US-GDI-02

---

## Descripción General
Como turista, quiero visualizar automáticamente la información turística de la plataforma en mi idioma preferido, para comprender fácilmente las actividades, lugares y recomendaciones durante mi viaje en Mendoza sin barreras de idioma.

---

## Descripción Funcional
El sistema debe permitir al usuario seleccionar un idioma desde la configuración de perfil o detectarlo automáticamente según la configuración regional del dispositivo. Once definido el idioma, el sistema deberá traducir dinámicamente las descripciones de los puntos de interés (POI), actividades, itinerarios, reseñas y mensajes del asistente conversacional inteligente.

La traducción deberá mantenerse consistente durante toda la navegación de la aplicación, incluyendo vistas de mapas, detalles de actividades, itinerarios y notificaciones. Además, el backend deberá gestionar respuestas multilenguaje optimizadas para evitar recargas innecesarias y reducir tiempos de respuesta.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El turista ingresa por primera vez a la aplicación con el dispositivo configurado en otro idioma | Que el sistema sugiera automáticamente configurar la plataforma en dicho idioma | Pantalla de bienvenida / onboarding |
| El turista accede a la configuración de idioma | Visualizar un listado de idiomas disponibles para seleccionar | Pantalla de Configuración / Perfil |
| El turista selecciona un idioma distinto al español | Que toda la interfaz y el contenido turístico se actualicen automáticamente al idioma elegido | Pantalla de Configuración / Perfil |
| El turista consulta el detalle de un punto turístico | Que la descripción, horarios y recomendaciones aparezcan traducidos | Pantalla detalle de POI |
| El turista interactúa con el asistente conversacional | Que el chatbot responda en el idioma configurado | Pantalla asistente IA |
| El turista navega entre distintas secciones de la app | Que el idioma seleccionado se mantenga sin reiniciarse | Toda la Aplicación |
| El sistema no encuentra traducción disponible para un contenido específico | Que se muestre el contenido original junto con un aviso de “Traducción no disponible” | Pantalla del Contenido correspondiente |
| El turista cambia nuevamente el idioma | Que el sistema actualice inmediatamente el contenido sin necesidad de cerrar sesión | Pantalla de Configuración / Perfil |
