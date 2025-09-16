# Dashboard BI Financiero

Este proyecto muestra un panel de Power BI incrustado para el Grupo Automotores con un diseño moderno, modo claro/oscuro, carga diferida del informe y un logo corporativo vectorial.

## Estructura de carpetas

- `index.html`: página principal que arma la estructura del documento.
- `css/main.css`: estilos de la interfaz (tarjeta hero, botones, contenedor del informe y variantes de tema).
- `js/app.js`: lógica para solicitar el token, cargar el reporte bajo demanda, cerrar el visor y alternar entre modo claro/oscuro.
- `server.js`: backend Express que genera el Embed Token de Power BI y sirve los archivos estáticos.
- `assets/img/logo-automotores.svg`: logo vectorial utilizado en el encabezado.

## Cómo ejecutarlo en local

### 1. Configurar credenciales de Power BI

1. Registra una aplicación en Azure AD con acceso a la API de Power BI (se recomienda usar un service principal).
2. Copia el archivo `.env.example` a `.env` y completa los valores requeridos:

   ```env
   POWERBI_TENANT_ID="<tu-tenant-id>"
   POWERBI_CLIENT_ID="<app-id>"
   POWERBI_CLIENT_SECRET="<client-secret>"
   POWERBI_WORKSPACE_ID="<id-del-workspace>"
   POWERBI_REPORT_ID="<id-del-reporte>"
   ```

### 2. Instalar dependencias y arrancar el backend

```bash
npm install
npm start
```

El servidor Express sirve los archivos estáticos y expone el endpoint `POST /api/embed-token`, que genera el **Embed Token** mediante `@azure/msal-node` y la API de Power BI.

### 3. Abrir la interfaz

Con el servidor ejecutándose, abre el navegador en:

```
http://localhost:8080/
```

El panel se incrusta con `powerbi-client` al pulsar "Ver informe de Power BI" y utiliza el token emitido por el backend.

## Recomendaciones

- Si el backend devuelve 401/403 al solicitar el Embed Token, la aplicación redirige al login oficial de Power BI (`https://app.powerbi.com`).
- Para personalizar colores o textos, edita las variables CSS en `css/main.css` y los textos del bloque hero en `index.html`.
