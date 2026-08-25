# US-CYP-02: Gestión del Idioma

## Información General
- **Identificador:** US-CYP-02
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Usuario debe tener la aplicación abierta.
  - El Usuario debe tener un itinerario en estado "En curso" con actividades programadas a futuro.
- **Historias de Usuario Relacionadas:** US-GDI-02

---

## Descripción General
**Como** Turista  
**Quiero** visualizar automáticamente la información turística de la plataforma en mi idioma preferido  
**Para** comprender fácilmente las actividades, lugares y recomendaciones durante mi viaje en Mendoza sin barreras de idioma.

---

## Descripción Funcional
El sistema debe permitir al Usuario seleccionar un idioma desde la configuración de perfil o detectarlo automáticamente según la configuración regional del dispositivo. Una vez definido el idioma, el sistema deberá traducir dinámicamente las descripciones de los puntos de interés (POI), actividades, itinerarios, reseñas y mensajes del asistente conversacional inteligente.
La traducción deberá mantenerse consistente durante toda la navegación de la aplicación, incluyendo vistas de mapas, detalles de actividades, itinerarios y notificaciones. Además, el backend deberá gestionar respuestas multilenguaje optimizadas para evitar recargas innecesarias y reducir tiempos de respuesta.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista ingresa por primera vez a la aplicación con el dispositivo configurado en otro idioma | Que el sistema sugiera automáticamente configurar la plataforma en dicho idioma | - |
| El Turista accede a la configuración de idioma | Visualizar un listado de idiomas disponibles para seleccionar | - |
| El Turista selecciona un idioma distinto al español | Que toda la interfaz y el contenido turístico se actualicen automáticamente al idioma elegido | - |
| El Turista consulta el detalle de un punto turístico | Que la descripción, horarios y recomendaciones se visualicen traducidos | - |
| El Turista interactúa con el asistente conversacional | Que el chatbot responda en el idioma configurado | - |
| El Turista navega entre distintas secciones de la app | Que el idioma seleccionado se mantenga sin reiniciarse | - |
| El sistema no encuentra traducción disponible para un contenido específico | Que se muestre el contenido original junto con un aviso de “Traducción no disponible” | - |
| El Turista cambia nuevamente el idioma | Que el sistema actualice inmediatamente el contenido sin necesidad de cerrar sesión | - |
