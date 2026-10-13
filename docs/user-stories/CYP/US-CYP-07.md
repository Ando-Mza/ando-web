Historia de Usuario
Identificación
US-CYP-07
Actor
Administrador
Descripción General
Como Administrador
Quiero gestionar las integraciones externas utilizadas por el sistema
Para garantizar el correcto funcionamiento de los servicios externos que complementan las funcionalidades de Ando.
Descripción Funcional
El sistema debe proporcionar un módulo de administración que permita configurar, monitorear y gestionar las integraciones externas utilizadas por la plataforma. Estas integraciones podrán incluir servicios de mapas y geolocalización, APIs meteorológicas, servicios de inteligencia artificial, plataformas de autenticación, servicios de mensajería, notificaciones push, almacenamiento de archivos, traducción automática y cualquier otro proveedor externo requerido por la solución.
El Administrador deberá poder registrar y modificar los parámetros de configuración no sensibles de cada integración, incluyendo nombre del servicio, proveedor, URL base, límites de consumo y estado operativo.
Las credenciales de acceso, claves API, tokens de autenticación y demás información sensible no serán gestionadas ni visualizadas directamente desde la interfaz administrativa. Dichas credenciales deberán permanecer almacenadas y gestionadas mediante mecanismos seguros de configuración del entorno, como variables de entorno o sistemas de gestión de secretos.
La US-CYP-07 administra las integraciones, pero las credenciales sensibles permanecen gestionadas mediante configuración segura del entorno.
Asimismo, el sistema deberá permitir habilitar o deshabilitar integraciones, verificar su conectividad mediante pruebas de conexión y visualizar información relacionada con el estado de funcionamiento de cada servicio.
Cuando una integración presente fallas o indisponibilidad, el sistema deberá registrar el incidente en auditoría y generar alertas para los Administradores responsables.
Las credenciales sensibles no podrán visualizarse desde la interfaz administrativa ni almacenarse como datos configurables de la integración en la base de datos.
Toda modificación realizada sobre las configuraciones de integración deberá quedar registrada para fines de auditoría y trazabilidad.
Puntos de Historia
8
Precondiciones
El Usuario debe estar autenticado.
El Usuario debe poseer rol Administrador.
Debe existir al menos una integración configurable dentro del sistema.
Las credenciales de las integraciones deben estar configuradas mediante mecanismos seguros del entorno o un sistema de gestión de secretos. 
US Relacionada
US-CYP-01, US-NYA-02, US-TRD-01, US-ACIA-01, US-MRIA-01, US-AYT-01
Criterios de Aceptación
Cuando
Espero
Pantalla
El Administrador accede al módulo de integraciones
Visualizar el listado de servicios externos configurados
CYPGestionIntegracionsGUI
El Administrador registra una nueva integración
Que el sistema permita almacenar la configuración no sensible ingresada 
-
El Administrador completa todos los parámetros requeridos
Que el sistema habilite la opción de guardar
-
El Administrador intenta guardar una integración con datos obligatorios faltantes
Que el sistema informe los campos incompletos
-
El Administrador modifica la configuración de una integración existente
Que el sistema actualice la información correctamente
-
El Administrador deshabilita una integración
Que el sistema deje de utilizar dicho servicio externo
-
El Administrador ejecuta una prueba de conexión
Que el sistema informe si la integración se encuentra operativa o presenta errores
-
La prueba de conexión es exitosa
Que el sistema muestre el estado "Conectado"
-
La prueba de conexión falla
Que el sistema informe el motivo del error detectado
-
El Administrador consulta una integración configurada
Que el sistema muestre únicamente información no sensible de la integración y no exponga credenciales 
-
Una integración externa deja de responder
Que el sistema registre el incidente y genere una alerta administrativa
-
El Administrador realiza una alta, baja o modificación
Que la acción quede registrada en auditoría
-
Un módulo dependiente solicita utilizar una integración habilitada
Que el sistema permita su utilización normalmente
-
Un módulo dependiente solicita utilizar una integración deshabilitada
Que el sistema impida su utilización e informe la indisponibilidad
-
La verificación de conexión de una integración externa implique costos
Que se muestre un cartel de advertencia “Esta verificación puede generar costos, ¿Está seguro que desea continuar?



