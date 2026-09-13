# US-GIT-06: Gestión de Multimedia como Administrador

## Información General
- **Identificador:** US-GIT-06
- **Actor:** Administrador
- **Puntos de Historia:** 2
- **Precondiciones:**
  - El Administrador debe estar autenticado con rol de Administrador.
  - El POI debe existir previamente en el sistema.
- **Historias de Usuario Relacionadas:** US-ACC-03, US-GIT-07, US-GIT-09, US-GIT-10

---

## Descripción General
**Como** Administrador  
**Quiero** gestionar las imágenes asociadas a un POI, pudiendo cargar imágenes desde mi dispositivo o incorporar URLs de imágenes provenientes de fuentes externas  
**Para** mantener una galería representativa y actualizada del lugar para los usuarios de la plataforma.

---

## Descripción Funcional
El Administrador accede al detalle de un POI existente y selecciona la opción “Cargar imágenes al POI”. El sistema presenta un único formulario desde el cual el Administrador puede incorporar una o varias imágenes. Para cada imagen podrá optar por: seleccionar un archivo desde su dispositivo o ingresar una URL pública correspondiente a una imagen proveniente de una fuente externa.
Si el Administrador selecciona un archivo desde su dispositivo, el sistema valida que corresponda a un formato de imagen permitido y, una vez cargado correctamente, lo almacena mediante el mecanismo de almacenamiento multimedia propio de la plataforma y lo asocia al POI.
Si el Administrador ingresa una URL externa, el sistema valida que tenga un formato válido, que sea accesible públicamente y que corresponda a una imagen antes de permitir su guardado. En este caso, la imagen no se descarga ni se almacena en el almacenamiento multimedia propio de la plataforma, sino que se conserva únicamente la URL pública asociada al POI.
Para cada imagen se deberá utilizar únicamente uno de los dos mecanismos de carga: archivo o URL. El Administrador podrá incorporar varias imágenes en una misma operación, pudiendo combinar imágenes cargadas desde su dispositivo con imágenes incorporadas mediante URL.
Una vez guardadas correctamente, todas las imágenes quedan asociadas al POI y podrán visualizarse en la galería pública del lugar cuando el POI se encuentre disponible públicamente.

---

## Criterios de Aceptación
| Cuando | Espero | Pantalla |
| :--- | :--- | :--- |
| El Administrador selecciona un POI específico y presiona el botón “Cargar imágenes al POI” | El sistema presenta un formulario que permite incorporar una o varias imágenes mediante archivo o URL externa | - |
| El Administrador selecciona un archivo de imagen válido desde su dispositivo y presiona “Guardar” | El sistema almacena correctamente la imagen mediante el almacenamiento multimedia de la plataforma, la asocia al POI seleccionado y la deja disponible para su galería | - |
| El Administrador selecciona varias imágenes válidas desde su dispositivo | El sistema carga y asocia correctamente todas las imágenes al POI seleccionado | - |
| El Administrador selecciona un archivo que no corresponde a un formato de imagen permitido | El sistema informa por pantalla “El formato del archivo no es válido” y bloquea la carga de dicha imagen | - |
| Se produce un error durante la carga de una imagen desde el dispositivo | El sistema informa que no fue posible cargar la imagen y evita registrar una imagen incompleta asociada al POI | - |
| El Administrador ingresa una URL válida, pública y accesible correspondiente a una imagen y presiona “Guardar” | El sistema almacena la URL en la información multimedia asociada al POI, sin descargar la imagen al almacenamiento propio de la plataforma | - |
| El Administrador ingresa una URL con formato inválido | El sistema muestra “La URL ingresada no tiene un formato válido” y bloquea el guardado de dicha imagen | - |
| El Administrador ingresa una URL válida pero la imagen no es accesible o el recurso no corresponde a una imagen | El sistema muestra “No fue posible acceder a la imagen. Verificá que la URL sea pública y esté disponible” y no registra la imagen | - |
| El Administrador no selecciona un archivo ni ingresa una URL para una imagen | El sistema bloquea el guardado e informa que debe seleccionar una imagen o ingresar una URL | - |
| El Administrador intenta proporcionar simultáneamente un archivo y una URL para la misma imagen | El sistema bloquea el guardado de esa imagen e informa que debe seleccionar únicamente uno de los dos mecanismos de carga | - |
| El Administrador agrega varias imágenes combinando archivos desde su dispositivo y URLs externas | El sistema procesa cada imagen según el mecanismo seleccionado y asocia correctamente todas las imágenes válidas al mismo POI | - |
| El Administrador guarda correctamente las imágenes asociadas al POI | Las imágenes quedan vinculadas al POI y pueden formar parte de la galería pública cuando el lugar se encuentre disponible públicamente | - |
