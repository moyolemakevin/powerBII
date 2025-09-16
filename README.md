# Dashboard BI Financiero

Este proyecto muestra un panel de Power BI incrustado para el Grupo Automotores con un diseño moderno, modo claro/oscuro, carga diferida del informe y un logo corporativo vectorial.

## Estructura de carpetas

- `index.html`: página principal que arma la estructura del documento.
- `css/main.css`: estilos de la interfaz (tarjeta hero, botones, contenedor del iframe y variantes de tema).
- `js/app.js`: lógica para cargar el report solo bajo demanda, cerrar el iframe y alternar entre modo claro/oscuro.
- `assets/img/logo-automotores.svg`: logo vectorial utilizado en el encabezado.

## Cómo ejecutarlo en local

1. **Usando XAMPP (recomendado)**
   - Copia la carpeta `powerBII` a `C:\xampp\htdocs` (ya está en este repo).
   - Inicia Apache desde el panel de control de XAMPP.
   - Abre el navegador y visita `http://localhost/powerbiwork/powerBII/index.html`.

2. **Servidor ligero con Python**
   - Abre una terminal en la carpeta `powerBII`.
   - Ejecuta `python -m http.server 8080`.
   - Navega a `http://localhost:8080/index.html`.

En ambos casos el informe de Power BI se carga al pulsar el botón "Ver informe de Power BI". Puedes cerrar el iframe con la `×` o la tecla Escape para liberar recursos, y alternar el tema con el botón "Modo claro/oscuro".

## Recomendaciones

- Si el informe embebido requiere autenticación, asegúrate de haber iniciado sesión en Power BI en el mismo navegador.
- Para personalizar colores o textos, edita las variables CSS en `css/main.css` y los textos del bloque hero en `index.html`.
