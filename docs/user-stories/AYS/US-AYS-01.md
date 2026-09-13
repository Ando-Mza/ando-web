# US-AYS-01: Manual de Usuario Integrado

## Información General
- **Identificador:** US-AYS-01
- **Actor:** Todos los tipos de Usuarios (Administrador / Prestador/ Turista)
- **Puntos de Historia:** 3
- **Precondiciones:**
  - El Usuario debe tener una sesión activa en el sistema.
  - El sistema debe tener artículos de ayuda y categorías previamente registrados.
- **Historias de Usuario Relacionadas:** US-AYS-02, US-AYS-03, US-ACIA-05

---

## Descripción General
**Como** Usuario de la plataforma  
**Quiero** acceder a un manual de Usuario  
**Para** comprender cómo utilizar las funcionalidades del sistema.

---

## Descripción Funcional
El sistema debe proveer un módulo de "Ayuda y Soporte" accesible desde el menú principal para cualquier Usuario. En el debe existir un manual de Usuario accesible para cualquier rol que contenga las principales funcionalidades de Ando ordenadas por categoría, con sus respectivas instrucciones paso a paso. Además, el módulo debe incluir una barra de búsqueda para localizar artículos por palabras clave. El contenido del manual deberá ser de solo lectura para Turistas y Prestadores, mientras que el Administrador podrá gestionarlo.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Usuario accede al módulo de "Ayuda y Soporte" y entra al Manual | Que el sistema despliegue un índice o menú lateral con las categorías principales de ayuda disponibles | - |
| El Usuario seleccione una categoría dentro del mismo | Que el sistema muestre la información correspondiente a la categoría seleccionada | - |
| El Usuario navega entre secciones | Que la navegación sea clara e intuitiva | - |
| El Usuario utiliza la barra de búsqueda del manual e ingresa una palabra clave válida (ej. "Itinerario") | Que el sistema filtre dinámicamente y muestre una lista de artículos o secciones que coinciden con la búsqueda | - |
| El Usuario selecciona un artículo específico del manual | Que el sistema muestre el contenido completo de este artículo, incluyendo las instrucciones paso a paso | - |
| El Usuario busca un término que no tiene coincidencias en el manual | Que el sistema muestre un mensaje de "No encontramos artículos relacionados" y ofrezca un botón de acceso directo al Canal de Contacto | - |
| Un Administrador ingresa al Manual de Usuario | Que el sistema habilite opciones adicionales (botones de edición/creación) para gestionar los artículos y categorías del manual. | - |
