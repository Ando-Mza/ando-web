# US-CYP-05: Preferencias del Usuario

## Información General
- **Identificador:** US-CYP-05
- **Actor:** Prestador/ Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar autenticado.
  - El Usuario debe poseer un perfil activo dentro de la plataforma.
  - Deben existir categorías e intereses configurados en el sistema.
- **Historias de Usuario Relacionadas:** US-CYP-02, US-MRIA-01, US-MRIA-10, US-ACIA-02, US-GDU-01, US-GDU-02

---

## Descripción General
**Como** Usuario  
**Quiero** configurar mis preferencias personales  
**Para** recibir recomendaciones, contenido y funcionalidades adaptadas a mis intereses, idioma y forma de utilización de la aplicación.

---

## Descripción Funcional
El sistema debe permitir que cada Usuario gestione sus preferencias personales desde su perfil. Estas configuraciones serán utilizadas por distintos módulos de la plataforma para personalizar la experiencia de uso.
Entre las preferencias configurables se incluirán el idioma de visualización, categorías turísticas de interés, actividades favoritas, preferencias gastronómicas, intereses de viaje, preferencias de accesibilidad y otras opciones que puedan ser utilizadas por el Motor de Recomendación Inteligente y el Asistente Conversacional.
Las preferencias definidas deberán almacenarse de forma consistente y aplicarse automáticamente en futuras sesiones del Usuario. Además, el sistema deberá permitir modificar estas configuraciones en cualquier momento sin afectar la información histórica del perfil.
La información configurada será utilizada para personalizar búsquedas, recomendaciones, itinerarios generados por IA, contenido destacado y sugerencias contextuales dentro de la plataforma.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario accede a la sección de preferencias | Visualizar las preferencias actualmente configuradas | - |
| El Usuario selecciona categorías de interés turístico | Que el sistema almacene correctamente la selección realizada | - |
| El Usuario modifica sus intereses de viaje | Que los cambios se guarden exitosamente | - |
| El Usuario selecciona un idioma preferido | Que el sistema actualice la configuración de idioma del perfil | - |
| El Usuario guarda cambios en sus preferencias | Que el sistema confirme la actualización realizada | - |
| El Usuario abandona la pantalla sin guardar cambios | Que el sistema conserve la configuración previamente almacenada | - |
| El Usuario inicia una nueva sesión | Que las preferencias configuradas se carguen automáticamente | - |
| El motor de recomendaciones genera sugerencias | Que utilice las preferencias configuradas para personalizar los resultados | - |
| El asistente conversacional interactúa con el Usuario | Que considere las preferencias registradas para generar respuestas más relevantes | - |
| El Usuario elimina una preferencia previamente seleccionada | Que el sistema actualice la configuración y deje de utilizarla en futuras recomendaciones | - |
| El Usuario consulta contenido turístico | Que el sistema destaque contenido relacionado con sus intereses configurados | - |
