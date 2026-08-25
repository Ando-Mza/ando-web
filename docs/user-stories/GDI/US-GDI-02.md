# US-GDI-02: Creación Asistida por IA

## Información General
- **Identificador:** US-GDI-02
- **Actor:** Turista
- **Puntos de Historia:** 8
- **Precondiciones:**
  - El Usuario debe tener al menos 3 "intereses" configurados en su perfil de base de datos.
  - La base de datos debe tener al menos 20 Puntos de Interés (POIs) activos y con coordenadas geográficas válidas.
- **Historias de Usuario Relacionadas:** US-GDI-01, US-REC-01, US-GDI-03, US-MRIA-06, US-ACIA-03

---

## Descripción General
**Como** Turista  
**Quiero** que el sistema genere automáticamente un itinerario completo  
**Para** ahorrar tiempo de planificación basándome en mis preferencias y el contexto del destino.

---

## Descripción Funcional
El Usuario completa el formulario de creación asistida con los campos: fechaInicio (obligatorio), fechaFin (obligatorio), cantidadPersonas (obligatorio), presupuestoEstimado (obligatorio), categorías de interés (selección múltiple, por defecto las de UsuarioPreferencia), y descripción libre (opcional, máximo 500 caracteres). Al enviar el formulario el backend ejecuta un pipeline de forma asíncrona devolviendo inmediatamente un jobId:
Paso 1 — Extracción de intenciones con LLM.
Paso 2 — Consulta y filtrado de POIs candidatos en el rango de fechas.
Paso 3 — Distribución de POIs candidatos por días (asumiendo jornada activa de 8 horas).
Paso 4 — Optimización de ruta mediante OR-Tools.
Paso 5 — Cálculo de tiempos de llegada y traslados.
Paso 6 — Generación de polylines con Google Maps Directions API.
El frontend realiza polling sobre el job hasta recibir estado "completado" y despliega el itinerario con estado "borrador" y creadoPorIA = true.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Turista presiona el botón global "+" | Aparezca el modal de la US-GDI-01 donde pregunte si quiere crear el viaje manual o con IA | - |
| Se presiona crear con IA | Se abre un formulario con datos: nombre de viaje, fechas, acompañantes, presupuesto y categorías | GDICreacionIAGUI |
| El Turista completa el formulario de IA | Ingresa fechaInicio (>= a hoy) y fechaFin, presupuesto máximo diario en ARS > 0, tipo de viaje (Solitario, Pareja, Familia, Amigos), confirma lista de al menos 3 etiquetas de intereses | - |
| Se confirmen los datos | El sistema empaqueta estos parámetros exactos, los envía a la API de IA, recibe el JSON estructurado y genera el itinerario con creadoPorIA=True separado por días | - |
| El Turista abre el calendario y hace click sobre una fecha pasada | Que el sistema desactive visualmente los días pasados en el calendario impidiendo el clic con el mensaje: "La fecha de inicio de tu viaje no puede ser en el pasado" | - |
| El Turista selecciona una fecha de inicio y fin cuya diferencia supera 14 días | Que el sistema bloquee el botón "Generar Viaje" y muestre el texto en rojo: "La planificación por IA está limitada a un máximo de 14 días por viaje. Por favor, reduce el rango de fechas." | - |
| La IA devuelva una lista cruda para los días con orden aleatorio | Que el backend descarte ese orden aleatorio y ejecute un algoritmo de optimización de rutas que minimice el tiempo de manejo | - |
| El modelo IA tarda más de 15 segundos en responder o devuelve un código de error 500/503 | Que el backend aborte la petición (timeout), devuelva HTTP 504 y muestre el modal: "Nuestros motores inteligentes están descansando un momento. Por favor, intenta de nuevo en unos minutos" conservando los datos tipeados | - |
| La IA devuelve el itinerario optimizado | Se le muestra al Usuario el modelo del itinerario para que pueda navegar en él y realizar modificaciones | - |
| El Turista sale de esta pantalla sin confirmar modificación | Se abre un modal antes de cambiar de pantalla con un mensaje de “¿Desea guardar las modificaciones antes de salir?” con botón de “aceptar” y “Salir sin guardar” | - |
