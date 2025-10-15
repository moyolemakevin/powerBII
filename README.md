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
- Los cambios de permisos dentro de Power BI pueden tardar unos minutos en propagarse. Si necesitas que el acceso se refleje al instante:
  1. Abre el **workspace** donde está publicado el informe y, tras agregar o quitar a una persona, haz clic en **Actualizar ahora** sobre el dataset para forzar la actualización de credenciales.
  2. Si compartes el reporte mediante una **app de Power BI**, entra en la app y usa **Actualizar aplicación** para que los cambios lleguen a todos los usuarios.
  3. Para páginas con datos en vivo, habilita **Actualización de página automática** (Auto page refresh) en el panel de **Formato** del reporte, definiendo un intervalo acorde al origen de datos.
  4. Comprueba en la pestaña **Permisos** del dataset que el usuario aparece con el rol correcto; de lo contrario, quita y vuelve a asignar el acceso.
  Estos pasos obligan al servicio de Power BI a renovar la caché y a sincronizar los permisos, logrando que el iframe embebido muestre el cambio sin tener que esperar a la propagación automática.
