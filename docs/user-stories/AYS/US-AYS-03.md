# US-AYS-03: Canal de Contacto

## Información General
- **Identificador:** US-AYS-03
- **Actor:** Todos los tipos de Usuarios (Administrador / Prestador/ Turista)
- **Puntos de Historia:** 5
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
- **Historias de Usuario Relacionadas:** US-AYS-01

---

## Descripción General
**Como** Usuario  
**Quiero** comunicarme con soporte  
**Para** resolver problemas o consultas que no pueda solucionar desde el centro de ayuda.

---

## Descripción Funcional
El sistema debe proveer un medio para enviar consultas mediante un formulario, donde se solicite el asunto, descripción del problema, y se permita adjuntar evidencia del error. El soporte se pondrá en contacto con el Usuario por correo electrónico asociado a la cuenta.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario completa los campos obligatorios | Que el sistema permita enviar la consulta | - |
| El Usuario adjunta evidencia válida | Que el sistema almacene correctamente el archivo | - |
| El Usuario envía la consulta | Que el sistema muestre el mensaje “Consulta enviada correctamente” | - |
| El Usuario deja campos vacíos | Que el sistema impida enviar el formulario | - |
