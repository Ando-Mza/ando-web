# US-CYP-05: Preferencias del Usuario

## Información General
*   **Identificador:** US-CYP-05
*   **Actor:** Prestador / Turista
*   **Puntos de Historia:** 5
*   **Precondiciones:**
    *   El usuario debe estar autenticado.
    *   El usuario debe poseer un perfil activo dentro de la plataforma.
    *   Deben existir categorías e intereses configurados en el sistema.
*   **Historias de Usuario Relacionadas:** US-CYP-02, US-MRIA-01, US-MRIA-10, US-ACIA-02, US-GDU-01, US-GDU-02

---

## Descripción General
Como usuario, quiero configurar mis preferencias personales, para recibir recomendaciones, contenido y funcionalidades adaptadas a mis intereses, idioma y forma de utilización de la aplicación.

---

## Descripción Funcional
El sistema debe permitir que cada usuario gestione sus preferencias personales desde su perfil. Estas configuraciones serán utilizadas por distintos módulos de la plataforma para personalizar la experiencia de uso.

Entre las preferencias configurables se incluirán el idioma de visualización, categorías turísticas de interés, actividades favoritas, preferencias gastronómicas, intereses de viaje, preferencias de accesibilidad y otras opciones que puedan ser utilizadas por el Motor de Recomendación Inteligente y el Asistente Conversacional.

Las preferencias definidas deberán almacenarse de forma persistente y aplicarse automáticamente en futuras sesiones del usuario. Además, el sistema deberá permitir modificar estas configuraciones en cualquier momento sin afectar la información histórica del perfil.

La información configurada será utilizada para personalizar búsquedas, recomendaciones, itinerarios generados por IA, contenido destacado y sugerencias contextuales dentro de la plataforma.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El usuario accede a la sección de preferencias | Visualizar las preferencias actualmente configuradas | Pantalla de Preferencias de Usuario |
| El usuario selecciona categorías de interés turístico | Que el sistema almacene correctamente la selección realizada | Pantalla de Preferencias de Usuario |
| El usuario modifica sus intereses de viaje | Que los cambios se guarden exitosamente | Pantalla de Preferencias de Usuario |
| El usuario selecciona un idioma preferido | Que el sistema actualice la configuración de idioma del perfil | Pantalla de Preferencias de Usuario |
| El usuario guarda cambios en sus preferencias | Que el sistema confirme la actualización realizada | Pantalla de Preferencias de Usuario |
| El usuario abandona la pantalla sin guardar cambios | Que el sistema conserve la configuración previamente almacenada | Pantalla de Preferencias de Usuario |
| El usuario inicia una nueva sesión | Que las preferencias configuradas se carguen automáticamente | Toda la Aplicación |
| El motor de recomendaciones genera sugerencias | Que utilice las preferencias configuradas para personalizar los resultados | Motor de Recomendaciones (Servicio) |
| El asistente conversacional interactúa con el usuario | Que considere las preferencias registradas para generar respuestas más relevantes | Chatbot Inteligente |
| El usuario elimina una preferencia previamente seleccionada | Que el sistema updatee la configuración y deje de utilizarla en futuras recomendaciones | Pantalla de Preferencias de Usuario |
| El usuario consulta contenido turístico | Que el sistema destaque contenido relacionado con sus intereses configurados | Descubrir / Búsqueda |
