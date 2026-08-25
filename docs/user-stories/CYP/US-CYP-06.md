# US-CYP-06: Configuración de Notificaciones

## Información General
- **Identificador:** US-CYP-06
- **Actor:** Prestador/ Turista
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar autenticado.
  - El Usuario debe poseer un perfil activo dentro de la plataforma.
  - Debe existir el módulo de notificaciones operativo.
  - Debe existir al menos un tipo de notificación configurable.
- **Historias de Usuario Relacionadas:** US-NTF-01, US-NTF-02, US-CYN-05, US-MRIA-01, US-ACIA-01

---

## Descripción General
**Como** Usuario  
**Quiero** configurar las notificaciones que deseo recibir  
**Para** mantenerme informado sobre eventos relevantes sin recibir información que no sea de mi interés.

---

## Descripción Funcional
El sistema debe permitir a los Usuarios gestionar sus preferencias de notificación desde su perfil personal. El Usuario podrá habilitar o deshabilitar distintos tipos de notificaciones generadas por la plataforma según sus necesidades y preferencias.
Entre las categorías configurables se incluyen notificaciones relacionadas con actividades próximas del itinerario, alertas meteorológicas, validaciones de negocios y POIs, actualizaciones de contenido, recomendaciones personalizadas, respuestas a reseñas, mensajes del asistente conversacional y novedades de la plataforma.
Las preferencias configuradas deberán almacenarse de forma consistente y ser consideradas por todos los módulos emisores de notificaciones. El sistema deberá respetar estas configuraciones antes de generar o enviar cualquier aviso al Usuario.
Además, el Usuario podrá definir el canal de recepción de las notificaciones, incluyendo notificaciones dentro de la aplicación (in-app), notificaciones push en dispositivos móviles y correo electrónico, dependiendo de las capacidades habilitadas por la plataforma.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario accede a la configuración de notificaciones | Visualizar todas las categorías de notificaciones disponibles | - |
| El Usuario habilita una categoría de notificación | Que el sistema almacene la preferencia seleccionada | - |
| El Usuario deshabilita una categoría de notificación | Que el sistema deje de enviar notificaciones de ese tipo | - |
| El Usuario selecciona canales de recepción específicos | Que el sistema registre los canales elegidos | - |
| El Usuario guarda los cambios realizados | Que el sistema confirme la actualización exitosa | - |
| El sistema genera una alerta de actividad próxima | Que la notificación se envíe únicamente si dicha categoría se encuentra habilitada | - |
| El Usuario vuelve a iniciar sesión | Que las preferencias previamente configuradas permanezcan almacenadas | - |
| El Usuario desactiva todas las notificaciones de una categoría | Que deje de recibir avisos relacionados con dicha categoría | - |
| El Usuario consulta sus preferencias actuales | Que el sistema muestre la configuración vigente almacenada | - |
| El sistema intenta enviar una notificación por un canal deshabilitado | Que el envío no se realice | - |
