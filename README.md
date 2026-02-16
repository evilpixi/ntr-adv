# NTR Adventure - Juego de Estrategia

Un juego web de aventura gráfica basado en texto con sistema de reinos, generales y conquista. Combina estrategia, narrativa generada por IA y mecánicas de captura y esclavización.

## 🎮 Características

- **Sistema de Reinos**: 5 reinos en total, cada uno con sus propias provincias y generales
- **Generales**: Cada reino tiene entre 1 y 5 generales femeninas con estadísticas únicas
- **Sistema de Combate**: Batallas estratégicas entre generales
- **Captura y Esclavización**: Las generales derrotadas pueden ser capturadas y esclavizadas
- **Narrativa Generada por IA**: La historia se genera dinámicamente usando LLMs
- **IA Enemiga**: Sistema de IA que toma decisiones estratégicas priorizando objetivos

## 📋 Requisitos

- Node.js (v14 o superior) y npm
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- **Solo si quieres usar el chat de Narrated Story**: API key de un proveedor de IA. Se configura dentro de la app en **Ajustes → Chat con IA** (OpenAI, DeepSeek, Grok u Ollama). El resto del juego funciona sin configurar nada.

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd ntr-adv
```

2. Instala las dependencias:
```bash
npm install
```

3. Arranca el proyecto (todo en **http://localhost:5173**):
   - **Desarrollo**: `npm run dev` → Vite (hot reload).
   - **Producción**: `npm run build` y luego `npm start` → sirve la carpeta `dist/` con Vite preview.

4. Abre **http://localhost:5173** en el navegador.

Proyecto **standalone**: no hace falta ningún servidor propio. El chat de Narrated Story llama a la IA desde el navegador; cada usuario introduce su API key en **Ajustes → Chat con IA** (se guarda en localStorage).

## ⚙️ Configuración

La configuración del juego está organizada en módulos dentro del directorio `data/` para facilitar la personalización.

### Estructura de Configuración

```
data/
├── kingdoms.js      # Configuración de reinos
├── generals.js      # Configuración de generales
├── provinces.js     # Nombres y configuración de provincias
├── game-rules.js    # Reglas y balance del juego
├── ai-config.js     # Configuración de IA y prompts
└── index.js         # Exportador centralizado y validador
```

### Configuración de Reinos

Edita `data/kingdoms.js` para definir los reinos:

```javascript
export const kingdoms = [
    {
        id: 'player',
        name: 'Tu Reino',
        owner: 'player',
        provinces: 7,
        imageUrl: 'https://example.com/images/player-kingdom.jpg' // opcional
    },
    // ...
];
```

### Configuración de Generales

Edita `data/generals.js` para definir las generales:

```javascript
export const generals = [
    {
        id: 'player_gen1',
        name: 'Aria',
        kingdom: 'player',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: 'https://example.com/images/aria.jpg' // opcional
    },
    // ...
];
```

### Configuración de Provincias

Edita `data/provinces.js` para personalizar nombres e imágenes de provincias:

```javascript
export const provinceNames = {
    player: [
        { name: 'Capital Real', imageUrl: null },
        { name: 'Provincia Norte', imageUrl: 'https://...' },
        // ...
    ],
    // ...
};
```

### Imágenes

Todas las entidades (reinos, generales, provincias) pueden tener una `imageUrl` opcional:
- Si se proporciona una URL válida, se mostrará la imagen
- Si no se proporciona o la imagen falla al cargar, se mostrará un placeholder automático
- Las URLs pueden ser:
  - URLs HTTP/HTTPS: `https://example.com/image.jpg`
  - Data URIs: `data:image/png;base64,...`
  - Rutas relativas: `/images/kingdom.jpg`

### Configuración de Reglas del Juego

Edita `data/game-rules.js` para ajustar el balance:

```javascript
export const gameRules = {
    provinceMaxHp: 3,
    hpRecoveryOnRest: 20,
    loveIncreaseOnDate: 10,
    // ...
};
```

### Configuración de IA

Edita `data/ai-config.js` para configurar:
- El servicio de IA por defecto
- Los modelos a usar
- Las plantillas de prompts
- Los parámetros de generación

## 🔌 Tools stateless e interfaz MCP

Las **tools** están repartidas así:

- **`tools/`** (raíz): tools globales (shell + cardgame): definiciones, `ToolContext`, `runTool(name, args, context)`. Soporte MCP general del proyecto.
- **`src/tools/browserContext.ts`**: implementación de `ToolContext` para el navegador (listApps, getAppInfo, getToolList, cardgame stubs). Usar `createBrowserToolContext()` cuando el frontend necesite el contexto global.
- **`src/apps/narratedStory/tools/`**: tools **solo** de la app Narrated Story: partida y stats. Definiciones en `definitions.ts`, interfaz `NarratedStoryToolContext` en `context.ts`, ejecutor en `run.ts`, contexto navegador en `browserContext.ts` (solo partida/stats, sin tools globales). Se importa desde `@/apps/narratedStory/tools`. **Cuando se ejecuta narratedStory, a la IA solo se le envían estas 4 tools** (no ntr_*, ni cardgame_*).

Un **contexto** (Node con `mcp-data/`, o navegador con IndexedDB) implementa la I/O. Así puedes:

- **En cada "siguiente turno"** (en la app o en un backend): llamar al LLM con las tools; cuando el LLM devuelva `tool_calls`, ejecutar por cada una `runNarratedStoryTool` si el nombre empieza por `narrated_story_`, si no `runTool`. No hace falta un servidor MCP para esto.
- **Opcional: servidor MCP** para Cursor u otro cliente: arranca un proceso que expone todas las tools por stdio usando el contexto Node (`mcp-data/`).

### Uso en "siguiente turno" (app o backend)

**Solo en la app Narrated Story** (la IA solo ve las 4 tools de partida/stats):

```ts
import { runNarratedStoryTool, createNarratedStoryBrowserContext } from '@/apps/narratedStory/tools'

const context = createNarratedStoryBrowserContext() // solo NarratedStoryToolContext
for (const call of response.tool_calls) {
  const result = await runNarratedStoryTool(call.function.name, JSON.parse(call.function.arguments ?? '{}'), context)
  // Enviar result.text de vuelta al modelo como tool result
}
```

**Si mezclas tools globales y de narrated story** (p. ej. un backend que atiende ambas), combina contextos: en Node usa `createNodeContext()` desde `mcp-server/context-node.ts` (implementa `ToolContext` y `NarratedStoryToolContext`). En navegador puedes componer `createBrowserToolContext()` con `createNarratedStoryBrowserContext()` y pasar el objeto combinado a `runTool` y `runNarratedStoryTool` según el prefijo del nombre.

### Arrancar el servidor MCP

```bash
npm run mcp
```

El servidor usa transporte **stdio**: se queda escuchando en stdin/stdout. Para usarlo desde Cursor, configúralo como servidor MCP local.

### Configurar en Cursor

1. Abre **Cursor Settings** → **MCP** (o el archivo de configuración MCP de Cursor).
2. Añade un servidor con **stdio**, por ejemplo:

```json
{
  "mcpServers": {
    "ntr-adv": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "C:\\ruta\\completa\\a\\ntr-adv"
    }
  }
}
```

Ajusta `cwd` a la ruta absoluta de tu clon del proyecto. Así Cursor arranca el proceso y se comunica por stdio.

### Directorio de datos

Las tools que leen/escriben datos usan por defecto el directorio `mcp-data/` en la raíz del proyecto (o la variable de entorno `NTR_MCP_DATA`). Por ejemplo:

- **narrated-story**: `mcp-data/narrated-story/` (partidas, `current.json`, system prompt).
- **cardgame**: `mcp-data/cardgame/` (mazos en JSON).

La app web guarda en IndexedDB; para que la IA vea o modifique datos, puedes exportar a `mcp-data` desde la app (si implementas el botón) o la IA puede escribir ahí y tú importar después.

### Tools disponibles

| Tool | App | Descripción |
|------|-----|-------------|
| `ntr_list_apps` | shell | Lista todas las apps (id, nombre, descripción). |
| `ntr_get_app_info` | shell | Devuelve el manifest de una app por `appId`. |
| `ntr_list_app_tools` | shell | Lista las tools MCP de una app. |
| `narrated_story_list_saves` | narrated-story | Lista saves en `mcp-data/narrated-story/`. |
| `narrated_story_read_save` | narrated-story | Lee el JSON de un save por nombre (usa `saveName: "current"` para la partida en curso). |
| `narrated_story_get_state` | narrated-story | Devuelve el estado actual de la partida (personajes, lugares). |
| `narrated_story_create` | narrated-story | Crea en un solo payload todos los lugares y/o personajes nuevos del turno. |
| `narrated_story_apply_updates` | narrated-story | Aplica en un solo payload todas las actualizaciones: lugares, personajes (stats, ubicaciones). Fuente única para la UI. |
| `cardgame_list_decks` | cardgame | Lista mazos en `mcp-data/cardgame/`. |
| `cardgame_read_deck` | cardgame | Lee un mazo por nombre. |
| `cardgame_write_deck` | cardgame | Escribe un mazo (JSON) en el directorio MCP. |

Para **tools globales**: edita `tools/definitions.ts`, `tools/run.ts` y `tools/context.ts`; implementa en `mcp-server/context-node.ts` y, si aplica, en `src/tools/browserContext.ts`. Para **tools de Narrated Story**: edita `src/apps/narratedStory/tools/` (definitions, context, run, browserContext) y `mcp-server/context-node.ts`. El servidor MCP registra todas vía `mcp-server/register-tools.ts`.

## 🎯 Cómo Jugar

1. **Inicio**: Al iniciar el juego, presiona el botón "Generar Historia Inicial" para crear la narrativa inicial usando IA (esto evita gastar tokens automáticamente)
2. **Asignar Acciones**: Asigna a tus generales acciones como:
   - Atacar provincias enemigas
   - Defender tus provincias
   - Descansar en la capital (recuperar HP)
   - Tener una cita contigo (aumentar amor)
   - Entrenar (aumentar fuerza)
3. **Simulación**: El juego procesa todas las acciones y combates
4. **Resultados**: Se genera una nueva historia basada en los eventos
5. **Repetir**: El ciclo continúa hasta que alguien gane o pierda

### Condiciones de Victoria/Derrota

- **Derrota**: Pierdes si:
  - Te quedas sin generales
  - Tu capital es conquistada
- **Victoria**: Ganas si conquistas todas las capitales enemigas

### Sistema de Captura

- Cuando una general es derrotada, es capturada
- El captor puede:
  - Ponerla en aislamiento (en la provincia)
  - Llevarla a la capital para esclavizarla
- Durante la esclavización, la general pierde amor por turno
- Si el amor llega a 0, se convierte en esclava del captor

## 🏗️ Arquitectura del software

La aplicación tiene dos capas: la **shell React** (entrada principal) y las **apps** que se abren desde el selector. Todo lo que ves (menú, título, “Volver”, selector de apps, ajustes) pertenece a la shell; cada “app” (Classic Mode, Biblioteca de Datos, Mi App, etc.) es una pantalla que se monta dentro de la shell.

### Flujo de entrada

```
index.html
  → src/main.tsx (React root)
    → App.tsx
      → AppProvider (estado global: app actual, ajustes)
      → Shell (barra de título + menú + contenido)
        → import './apps'  (registra todas las apps al cargar)
```

- **AppProvider** (`src/store/AppContext.tsx`): Guarda `currentAppId` (qué app está abierta o `null` = selector), `settings` (resolución, idioma, volumen, etc.) y los setters. Los ajustes se persisten en `localStorage` al cambiar y al cerrar el modal.
- **Shell** (`src/shell/Shell.tsx`): Siempre muestra la barra de título (título “NTR Adventure”, botón “← Volver” si hay app abierta, menú hamburguesa). El contenido es:
  - Si `currentAppId === null` → **AppSelector** (grid de tarjetas “Elige una aplicación”).
  - Si `currentAppId` tiene valor → **AppContainer** renderiza el `Component` de esa app.

### Registro de apps

- **Registry** (`src/apps/registry.ts`): Un `Map` que guarda, por `id`, el **manifest** (nombre, descripción, tipo, `legacy`) y el **Component** de React.
- **Registro** (`src/apps/index.ts`): Aquí se llama a `registerApp()` por cada app. Cada app tiene un `id` único, un manifest y un `Component` que recibe la prop `appId`.
- Las apps se listan en el selector con `getAvailableApps()` (se excluye la de id `_template`). Al hacer clic en una tarjeta se hace `setCurrentAppId(manifest.id)` y el Shell pasa a mostrar esa app dentro de **AppContainer**.

### Dónde está cada cosa

| Qué | Dónde |
|-----|--------|
| Estado global (app actual, ajustes) | `src/store/AppContext.tsx` |
| Persistencia de ajustes | `src/store/settings.ts` (`settingsStore.save/load`) |
| Barra de título, menú, selector de apps | `src/shell/` (Shell.tsx, MainMenu.tsx, AppSelector.tsx) |
| Modal de Ajustes | `src/shell/Settings/SettingsModal.tsx` |
| Definición y registro de cada app | `src/apps/index.ts` + carpeta `src/apps/<id>/` |
| Contenedor que monta la app activa | `src/apps/AppContainer.tsx` |
| Datos del juego (reinos, generales, provincias) para React | `src/data/gameData.ts` (reexporta `js/dataLoader.js` + hook `useGameData()`) |
| Traducciones (es/en) de la shell | `src/i18n.ts` |
| Tokens de diseño (colores, espaciado, fuentes) | `src/theme/tokens.css`, `src/theme/components.css` |
| Lógica legacy del juego clásico | `js/game.js`, `js/gameModes/`, etc. |
| Datos estáticos (reinos, generales, reglas, IA) | `data/*.js` (usados por `js/dataLoader.js`) |

### Tipos de app

- **`type: 'app'`**: App normal (ej. Biblioteca de Datos, Mi App).
- **`type: 'game-mode'`**: Modo de juego (ej. Classic Mode).
- **`legacy: true`** en el manifest: Muestra la etiqueta “Legacy” en el selector (para apps que reutilizan código legacy como Classic o Data Library).

---

## ➕ Implementar una nueva app

Sigue estos pasos para añadir una app nueva que aparezca en “Elige una aplicación” y se abra al hacer clic.

### 1. Crear la carpeta y el componente

Crea una carpeta bajo `src/apps/` con el nombre de tu app (por ejemplo `miJuego`) y dentro un `App.tsx`:

```
src/apps/miJuego/
  App.tsx
```

El componente debe ser un **default export** y recibir la prop `appId: string` (aunque no la uses). Usa las clases y variables CSS del tema para que se vea como el resto de la app:

```tsx
// src/apps/miJuego/App.tsx
import type { ComponentType } from 'react'

const MiJuegoApp: ComponentType<{ appId: string }> = () => (
  <div className="app-blank-page">
    <h2 className="section-title">Mi Juego</h2>
    <p style={{ color: 'var(--color-text-muted)' }}>Contenido aquí.</p>
  </div>
)

export default MiJuegoApp
```

Puedes usar:
- **Clases de la shell**: `app-blank-page`, `section-title`, `btn`, `btn-primary`, etc. (ver `src/theme/components.css` y `src/shell/Shell.css`).
- **Tokens CSS**: `var(--color-text)`, `var(--space-md)`, `var(--font-size-base)`, etc. (`src/theme/tokens.css`).
- **Datos del juego**: `import { useGameData } from '@/data/gameData'` y luego `gameData.getKingdoms()`, etc., cuando `loaded` sea true.
- **Idioma**: `const { settings } = useApp(); t('clave', settings.language)` si añades claves en `src/i18n.ts`.

Puedes copiar **`src/apps/blank/App.tsx`** como base (app vacía con el estilo de la aplicación).

### 2. Registrar la app

En **`src/apps/index.ts`**:

1. Importa tu componente:
   ```ts
   import MiJuegoApp from './miJuego/App'
   ```
2. Llama a `registerApp()` con el manifest y el Component:
   ```ts
   registerApp({
     manifest: {
       id: 'mi-juego',
       name: 'Mi Juego',
       description: 'Descripción breve que verá el usuario en la tarjeta',
       type: 'app',
       // legacy: true   solo si reutilizas código legacy y quieres la etiqueta "Legacy"
     },
     Component: MiJuegoApp,
   })
   ```

El **`id`** debe ser único (solo letras, números y guiones). Es el que se usa internamente (`currentAppId`). El **`name`** y **`description`** son los que se muestran en el selector de apps.

### 3. Probar

1. Arranca el proyecto (`npm run dev` o `npm start` según uses Vite o el servidor clásico).
2. Abre la app en el navegador: deberías ver tu app en la lista “Elige una aplicación”.
3. Haz clic en la tarjeta: la shell debe mostrar la barra de título (con “← Volver”) y tu componente como contenido.

### Resumen de archivos a tocar

| Paso | Archivo | Qué hacer |
|------|---------|-----------|
| Crear app | `src/apps/<nombre>/App.tsx` | Componente React con default export y prop `appId`. |
| Registrar | `src/apps/index.ts` | `import ... from './<nombre>/App'` y `registerApp({ manifest, Component })`. |

Opcional: si tu app usa estilos propios, añade un CSS en su carpeta (ej. `src/apps/miJuego/miJuego.css`) e impórtalo en `App.tsx`. Si necesitas datos de reinos/generales/provincias, usa `useGameData()` desde `@/data/gameData`.

---

## 📁 Estructura del Proyecto

```
ntr-adv/
├── .gitignore
├── .env.example
├── package.json
├── vite.config.ts
├── index.html              # Entrada principal (carga src/main.tsx)
├── index.legacy.html       # Versión legacy (JS + html del juego)
├── README.md
├── src/                    # Aplicación React (shell + apps)
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── i18n.ts             # Traducciones (es/en) de la shell
│   ├── theme/              # Tokens y componentes reutilizables
│   │   ├── tokens.css
│   │   └── components.css
│   ├── store/              # Estado global
│   │   ├── AppContext.tsx  # currentAppId, settings, setters
│   │   └── settings.ts     # Persistencia de ajustes (localStorage)
│   ├── data/
│   │   └── gameData.ts     # Acceso a datos del juego desde React (useGameData)
│   ├── shell/              # Barra de título, menú, selector de apps, ajustes
│   │   ├── Shell.tsx
│   │   ├── AppSelector.tsx
│   │   ├── MainMenu.tsx
│   │   └── Settings/
│   ├── apps/               # Apps que se abren desde el selector
│   │   ├── index.ts        # Registro de todas las apps (registerApp)
│   │   ├── registry.ts
│   │   ├── types.ts
│   │   ├── AppContainer.tsx
│   │   ├── _template/      # Plantilla (no se muestra en selector)
│   │   ├── blank/          # App vacía “Mi App”
│   │   ├── classic/        # Classic Mode (legacy)
│   │   ├── dataLibrary/    # Biblioteca de Datos
│   │   └── <tu-app>/       # Tu nueva app: App.tsx (+ opcional .css)
├── data/                   # Configuración del juego (legacy + gameData)
│   ├── kingdoms.js
│   ├── generals.js
│   ├── provinces.js
│   ├── game-rules.js
│   ├── ai-config.js
│   └── index.js
├── css/
│   └── style.css          # Estilos del juego legacy / Classic
├── js/
│   ├── dataLoader.js
│   ├── config.js
│   ├── game.js
│   ├── gameModes/
│   ├── apps/
│   └── ...
└── scripts/
    └── inject-env.js
```

## 🔧 Desarrollo

### Branches

- `main`: Branch principal con código estable
- `dev`: Branch de desarrollo

### Agregar una nueva app (pantalla en el selector)

Consulta la sección **[Implementar una nueva app](#-implementar-una-nueva-app)** más arriba: crear carpeta en `src/apps/<nombre>/`, exportar el componente y registrarlo en `src/apps/index.ts`.

### Agregar Nuevos Reinos o Generales

1. Edita `data/kingdoms.js` o `data/generals.js`
2. Agrega el reino o general a los arrays correspondientes
3. Asegúrate de que el `id` sea único
4. Si quieres agregar una imagen, agrega el campo `imageUrl`
5. Recarga el juego

### Agregar Imágenes

Para agregar imágenes a reinos, generales o provincias:

1. **Reinos**: Edita `data/kingdoms.js` y agrega `imageUrl: 'tu-url-aqui'`
2. **Generales**: Edita `data/generals.js` y agrega `imageUrl: 'tu-url-aqui'`
3. **Provincias**: Edita `data/provinces.js` y agrega `imageUrl` en el objeto de la provincia

El juego manejará automáticamente:
- Placeholders cuando no hay imagen
- Errores de carga de imagen
- Imágenes que no están disponibles

### Personalizar Prompts de IA

Edita `promptTemplate` en `data/ai-config.js` para cambiar cómo se genera la narrativa.

## 🐛 Solución de Problemas

### La IA no genera historias

- Verifica que tu API key esté correctamente configurada en `.env`
- Asegúrate de que el servicio de IA esté disponible
- Revisa la consola del navegador para errores

### El juego no carga

- Asegúrate de haber ejecutado `npm install` primero
- Verifica que el servidor esté corriendo con `npm start`
- No abras el HTML directamente, siempre usa el servidor (http://localhost:5173)
- Verifica que el archivo `js/env.js` se haya generado correctamente
- Revisa la consola del navegador para errores

### El servidor no inicia

- Verifica que Node.js esté instalado: `node --version`
- Verifica que npm esté instalado: `npm --version`
- Asegúrate de haber ejecutado `npm install` en el directorio del proyecto
- Verifica que el puerto 5173 no esté en uso

## 🌐 Despliegue en GitHub Pages

Este proyecto puede desplegarse en GitHub Pages. El workflow de GitHub Actions se encarga automáticamente de generar el archivo `js/env.js` usando GitHub Secrets.

### Configuración de GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **New repository secret**
4. Agrega los siguientes secrets (solo los que necesites usar):

   **Obligatorios:**
   - `DEFAULT_AI_SERVICE`: El servicio de IA por defecto (`openai`, `deepseek`, `grok`, o `ollama`)
   - `GAME_LANGUAGE`: Idioma del juego (ej: `es`, `en`)

   **Opcionales (solo agrega los del servicio que uses):**
   
   **Para OpenAI:**
   - `OPENAI_API_KEY`: Tu clave API de OpenAI
   - `OPENAI_MODEL`: Modelo a usar (ej: `gpt-4`, `gpt-3.5-turbo`)
   - `OPENAI_BASE_URL`: URL base (por defecto: `https://api.openai.com/v1`)
   
   **Para DeepSeek:**
   - `DEEPSEEK_API_KEY`: Tu clave API de DeepSeek
   - `DEEPSEEK_MODEL`: Modelo a usar (por defecto: `deepseek-chat`)
   - `DEEPSEEK_BASE_URL`: URL base (por defecto: `https://api.deepseek.com/v1`)
   
   **Para Grok (xAI):**
   - `GROK_API_KEY`: Tu clave API de Grok
   - `GROK_MODEL`: Modelo a usar (por defecto: `grok-beta`)
   - `GROK_BASE_URL`: URL base (por defecto: `https://api.x.ai/v1`)
   
   **Para Ollama (local):**
   - `OLLAMA_BASE_URL`: URL de tu servidor Ollama (por defecto: `http://localhost:11434`)
   - `OLLAMA_MODEL`: Modelo a usar (por defecto: `llama2`)

### Habilitar GitHub Pages

1. Ve a **Settings** → **Pages**
2. En **Source**, selecciona:
   - **Source**: `GitHub Actions` (no "Deploy from a branch")
3. El workflow se ejecutará automáticamente cuando hagas push a `main` o `dev`
4. También puedes ejecutarlo manualmente desde la pestaña **Actions**

### Notas Importantes

- ⚠️ **Nunca subas claves API reales al código**. El archivo `js/env.js` en el repositorio solo contiene placeholders.
- Las claves se inyectan automáticamente durante el deploy usando GitHub Secrets.
- Si no configuras los secrets, el juego funcionará pero las funciones de IA no estarán disponibles.
- El workflow está configurado para desplegar desde las ramas `main` y `dev`.

### Despliegue Manual (sin GitHub Actions)

Si prefieres no usar GitHub Actions, puedes:

1. Editar manualmente `js/env.js` con tus claves (⚠️ **NO recomendado para repositorios públicos**)
2. Configurar GitHub Pages para servir desde la rama `main` o `dev`
3. El juego funcionará, pero las claves estarán visibles en el código

**Recomendación**: Usa siempre GitHub Secrets para mantener tus claves seguras.

## 📝 Licencia

Este proyecto es de código abierto. Siéntete libre de modificarlo y usarlo como desees.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

¡Disfruta del juego!
