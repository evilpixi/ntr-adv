# API del Game Server

Este documento describe cómo está implementada la API y el servidor del juego en este proyecto.

## Resumen

El **game server** es un servidor HTTP en Node.js (`server.js`) que cumple dos roles:

1. **Servir la aplicación**: archivos estáticos y enrutamiento SPA.
2. **API de desarrollo**: dos endpoints para hot reload y recarga de variables de entorno.

El juego **no** expone una API REST de datos ni de IA: los datos se cargan desde módulos en `data/` en el cliente, y las llamadas a IA se hacen desde el navegador directamente a los proveedores (OpenAI, DeepSeek, Grok, Ollama).

---

## Stack del servidor

- **Runtime**: Node.js (módulos nativos `http`, `fs`, `path`).
- **Dependencias**: `dotenv` (variables de entorno), `chokidar` (observación de archivos para hot reload).
- **Puerto**: `process.env.PORT` o `5173`.
- **Directorio público**: la raíz del proyecto (`__dirname`).

---

## Endpoints de la API

### 1. `GET /api/hot-reload` — Server-Sent Events (Hot Reload)

**Propósito**: notificar al cliente cuando cambian archivos para recargar la página en desarrollo.

**Comportamiento**:

- Responde con `Content-Type: text/event-stream`.
- Mantiene la conexión abierta y registra el cliente en un `Set`.
- Cuando `chokidar` detecta cambios en `js/**/*.js`, `css/**/*.css`, `data/**/*.js` o `index.html`, el servidor envía a todos los clientes el evento `data: reload\n\n`.
- Si el archivo modificado es `.env`, se vuelve a cargar con `require('dotenv').config({ override: true })`.
- Al cerrar la conexión, el cliente se elimina del `Set`.

**Headers de respuesta** (entre otros):

- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`
- `Access-Control-Allow-Origin: *`

**Uso en el cliente**: en `js/game.js`, `Game` abre `new EventSource('/api/hot-reload')` y, al recibir `reload`, hace `window.location.reload()`.

---

### 2. `POST /api/reload-env` — Recargar variables de entorno

**Propósito**: recargar el archivo `.env` en caliente sin reiniciar el servidor.

**Comportamiento**:

- Solo acepta `POST`.
- Ejecuta `require('dotenv').config({ override: true })`.
- Responde `200` con cuerpo JSON: `{ "success": true }`.

**Uso**: útil en desarrollo tras editar `.env` para que la siguiente petición de `index.html` reciba ya las nuevas variables inyectadas.

---

## Servicio de archivos estáticos

- Cualquier ruta que **no** sea `/api/hot-reload` ni `/api/reload-env` se trata como petición de archivo.
- **Seguridad**: se comprueba que la ruta resuelta esté dentro de `PUBLIC_DIR`; si no, se responde `403 Forbidden`.
- **MIME types**: se usa un mapa en `server.js` para extensiones habituales (`.html`, `.js`, `.css`, `.json`, imágenes, fuentes, `.wasm`, etc.); el resto se sirve como `application/octet-stream`.

---

## Enrutamiento SPA (Single Page Application)

Para que el enrutado del frontend funcione al recargar o abrir enlaces directos:

- Si la URL comienza por `/generals/`, `/kingdoms/` o `/province/`, el servidor responde siempre con el contenido de `index.html`.
- El resto de rutas se resuelven como archivos bajo el directorio público (p. ej. `/` → `index.html`).

Así, todas las “rutas de la app” sirven el mismo HTML y el enrutador del cliente puede actuar correctamente.

---

## Inyección de variables de entorno en `index.html`

- Al servir **solo** `index.html`, el servidor no devuelve el contenido tal cual.
- `getEnvVars()` construye un objeto con las variables usadas por el juego (claves de API, modelos, URLs base, idioma, etc.) leyendo `process.env`.
- En el HTML se busca el bloque `window.__ENV__ = { ... };` y se reemplaza por `window.__ENV__ = <JSON de getEnvVars()>;`.
- El cliente usa `window.__ENV__` (p. ej. en `js/aiIntegration.js` con `loadEnvConfig()`) para saber qué proveedor de IA usar y con qué claves/URLs.

Variables que se inyectan (nombres y valores por defecto si no hay `.env`) incluyen, entre otras:

- `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`
- `DEEPSEEK_*`, `GROK_*`
- `OLLAMA_BASE_URL`, `OLLAMA_MODEL`
- `DEFAULT_AI_SERVICE`, `GAME_LANGUAGE`

---

## Lo que no hace este servidor

- **No hay API REST de partida/reinos/generales**: los datos del juego viven en `data/*.js` y se cargan en el navegador vía `js/dataLoader.js` (módulos ES).
- **No hay proxy de IA**: las llamadas a OpenAI, DeepSeek, Grok y Ollama se hacen desde el frontend con `fetch` a las URLs y endpoints configurados en `data/ai-config.js` y en `window.__ENV__`. Por ejemplo, Ollama se llama a `OLLAMA_BASE_URL + '/api/chat'` (no a un `/api/chat` del game server).

---

## Flujo de una petición

```
Cliente solicita URL
        │
        ▼
¿Es GET /api/hot-reload?  ──Sí──► Abrir SSE, registrar cliente, mantener conexión
        │ No
        ▼
¿Es POST /api/reload-env? ──Sí──► Recargar .env, responder { "success": true }
        │ No
        ▼
¿Ruta /generals/*, /kingdoms/* o /province/*? ──Sí──► filePath = index.html
        │ No
        ▼
filePath = PUBLIC_DIR + req.url (o index.html si req.url === '/')
        │
        ▼
¿filePath dentro de PUBLIC_DIR? ──No──► 403 Forbidden
        │ Sí
        ▼
Leer archivo
        │
        ▼
¿Es index.html? ──Sí──► Sustituir window.__ENV__ por getEnvVars()
        │
        ▼
Responder 200 con Content-Type y contenido (y cabeceras no-cache para .js/.css/.html)
```

---

## Cómo ejecutar el servidor

```bash
npm start
# o
node server.js
```

El servidor escucha en `http://localhost:5173` (o en el puerto definido en `PORT`). Para desarrollo, con hot reload activo, los cambios en `js/`, `css/`, `data/` e `index.html` provocan un aviso por SSE y la recarga automática en el cliente si está conectado a `/api/hot-reload`.
