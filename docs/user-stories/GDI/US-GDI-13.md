# US-GDI-13: Eliminar Itinerario

**Actor:** Turista  
**Prioridad:** Media  
**Estimación:** 5 puntos

## Historia de Usuario

> **Como** turista,  
> **quiero** eliminar un itinerario de mi lista de viajes,  
> **para** mantener organizados mis itinerarios y quitar aquellos que ya no deseo conservar.

## Descripción Funcional

El sistema debe permitir al usuario eliminar un itinerario del cual sea el creador original.

Antes de realizar la eliminación, el sistema debe solicitar una confirmación explícita al usuario para evitar eliminaciones accidentales.

La eliminación será **lógica**, de manera que el itinerario deje de estar disponible en las listas y búsquedas habituales del usuario, pero sus datos se conserven para mantener la trazabilidad e integridad de la información.

En caso de que el itinerario sea público, al eliminarlo deberá dejar de estar disponible en la comunidad.

Los itinerarios que hayan sido creados mediante la duplicación del itinerario eliminado no deberán verse afectados.

## Precondiciones

- El usuario debe estar autenticado en el sistema.
- El itinerario debe existir.
- El usuario debe ser el creador original del itinerario.
- El itinerario debe pertenecer al usuario que inició sesión.
- El sistema debe encontrarse disponible.

## Criterios de Aceptación

### CA-01: Mostrar opción de eliminación

**Dado** que el usuario se encuentra visualizando o listando un itinerario propio,  
**cuando** el usuario es el creador original,  
**entonces** el sistema debe mostrar la opción para eliminarlo.

### CA-02: Solicitar confirmación

**Dado** que el usuario selecciona la opción "Eliminar itinerario",  
**cuando** se inicia la acción,  
**entonces** el sistema debe mostrar un mensaje de confirmación indicando que la acción eliminará el itinerario.

### CA-03: Cancelar eliminación

**Dado** que se muestra el mensaje de confirmación,  
**cuando** el usuario selecciona "Cancelar",  
**entonces** el sistema no debe realizar ninguna modificación sobre el itinerario.

### CA-04: Confirmar eliminación

**Dado** que el usuario confirma la eliminación,  
**cuando** el sistema valida que es el creador original,  
**entonces** debe realizar la eliminación lógica del itinerario.

### CA-05: Actualizar listado

**Dado** que la eliminación lógica se realizó correctamente,  
**cuando** finaliza la operación,  
**entonces** el itinerario no debe aparecer en los listados habituales de itinerarios del usuario.

### CA-06: Eliminar de la comunidad

**Dado** que el itinerario eliminado se encontraba publicado en la comunidad,  
**cuando** se realiza la eliminación lógica,  
**entonces** el itinerario debe dejar de estar disponible para ser explorado en la comunidad.

### CA-07: Mantener copias existentes

**Dado** que otros usuarios hayan creado una copia del itinerario,  
**cuando** el itinerario original sea eliminado,  
**entonces** las copias existentes deben permanecer disponibles y no verse afectadas.

### CA-08: Validar permisos

**Dado** que el usuario intenta eliminar un itinerario del cual no es el creador original,  
**cuando** solicita la eliminación,  
**entonces** el sistema debe rechazar la operación e informar que no posee permisos suficientes.

### CA-09: Itinerario inexistente o ya eliminado

**Dado** que el itinerario no existe o ya fue eliminado,  
**cuando** el usuario intenta eliminarlo,  
**entonces** el sistema debe informar que el itinerario no se encuentra disponible y no debe realizar modificaciones adicionales.

### CA-10: Manejo de errores

**Dado** que ocurre un error durante la eliminación,  
**cuando** el sistema procesa la solicitud,  
**entonces** no deben quedar modificaciones parciales ni datos inconsistentes.

### CA-11: Integridad de datos

**Dado** que se elimina un itinerario,  
**cuando** finaliza la operación,  
**entonces** la información asociada al itinerario debe mantenerse consistente y no deben generarse registros huérfanos.

## Reglas de Negocio

- Solo el **creador original** puede eliminar un itinerario.
- La eliminación debe realizarse de manera **lógica**.
- Un itinerario eliminado no debe aparecer en los listados o búsquedas habituales.
- Si el itinerario era público, debe dejar de aparecer en la comunidad.
- Las copias realizadas previamente por otros usuarios deben conservarse.
- La eliminación no debe provocar inconsistencias en las relaciones existentes del itinerario.
- La operación debe requerir confirmación explícita del usuario.

## Relación con otras Historias de Usuario

- **US-GDI-01:** Creación Manual de Itinerario
- **US-GDI-02:** Creación Asistida por IA
- **US-GDI-03:** Modificación de Itinerario
- **US-GDI-05:** Duplicación de Itinerario
- **US-GDI-06:** Compartir Itinerario Modo Lectura
- **US-GDI-07:** Administración Colaborativa
- **US-GDI-08:** Explorar Itinerarios Comunitarios
- **US-GDI-09:** Publicar Itinerario en la Comunidad
- **US-GDI-12:** Historial de Viajes