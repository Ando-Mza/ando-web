# US-ACIA-03: Asistencia en Creación de Itinerario

## Información General
- **Identificador:** US-ACIA-03
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Usuario debe estar registrado en el sistema.
  - El Usuario debe iniciar sesión en el sistema.
  - Al menos fechaInicio y fechaFin presentes en el mensaje o en el historial de la conversación activa.
- **Historias de Usuario Relacionadas:** US-ACIA-01, US-ACIA-04, US-GDI-02, US-MRIA-06

---

## Descripción General
**Como** Turista  
**Quiero** pedirle al asistente que me ayude a crear un itinerario describiendo lo que quiero hacer  
**Para** generar un viaje planificado sin tener que usar el formulario de creación paso a paso

---

## Descripción Funcional
Cuando el LLM detecta intención de creación de itinerario en el mensaje del Usuario, extrae los parámetros necesarios en formato JSON con el schema { fechaInicio: date, fechaFin: date, cantidadPersonas: int, presupuesto: string, categorias: string[], descripcion: string }. Si algún parámetro obligatorio está ausente (fechaInicio, fechaFin), el asistente responde solicitando esa información específica al Usuario antes de continuar, manteniendo el contexto en el historial de la conversación. Una vez que tiene todos los parámetros necesarios, el backend invoca el mismo flujo interno de US-GDI-02 (Creación Asistida por IA) pasando esos parámetros extraídos. El resultado es un borrador de itinerario creado en la BD con estado "borrador". El asistente responde al Usuario confirmando la creación, mostrando un resumen del itinerario generado (días, paradas principales) y un botón/link directo que navega al itinerario creado para que el Usuario pueda revisarlo y modificarlo. El itinerario creado desde el chat queda marcado con creadoPorIA = true y en UsuarioItinerario con tipoInteraccion = creador.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| Cuando describo mi viaje ideal con fechas y preferencias | Espero que el asistente cree un itinerario borrador y me muestre un resumen con link directo | ACIAPlanificarViajeGUI |
| Cuando no incluyo las fechas en mi mensaje | Espero que el asistente me las solicite específicamente antes de crear el itinerario | - |
| Cuando el proceso de creación del itinerario tarda más de 5 segundos | Espero ver un mensaje indicando que se está generando el plan | - |
| Cuando el itinerario se crea exitosamente | Espero poder acceder a él desde el chat con un solo tap | - |
| Cuando la creación falla por error interno | Espero que el asistente me lo informe y me sugiera intentarlo desde el formulario de creación manual | - |
