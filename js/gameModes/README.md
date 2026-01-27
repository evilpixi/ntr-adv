# Game Modes - Guía para Crear Nuevos Modos de Juego

## Introducción

Cada modo de juego es un **entorno de ejecución completamente independiente**. Solo tiene acceso a `gameData` (la base de datos del juego) y puede implementar su propia lógica sin depender de otros modos.

## Cómo Crear un Nuevo Modo de Juego

### 1. Crear la Estructura

Crea una nueva carpeta en `js/gameModes/` con el nombre de tu modo:

```
js/gameModes/
  ├── classic/          (modo existente)
  │   ├── ClassicGameMode.js
  │   ├── ClassicGameState.js
  │   ├── ClassicCombat.js
  │   └── ClassicAI.js
  └── tu-modulo/        (tu nuevo modo)
      ├── TuGameMode.js
      └── ... (tus archivos)
```

### 2. Crear la Clase del Modo

Tu clase debe seguir esta estructura básica:

```javascript
export class TuGameMode {
    constructor(gameData) {
        this.gameData = gameData;  // Único acceso a datos compartidos
        // Inicializa tu estado interno aquí
    }

    // Implementa los métodos requeridos (ver abajo)
}
```

### 3. Registrar el Modo

En `js/gameModes/index.js`, agrega:

```javascript
import { TuGameMode } from './tu-modulo/TuGameMode.js';

// Al final del archivo, antes de los exports:
registerGameMode('tu-mod-id', TuGameMode);
```

## Interfaz de gameData

Tu modo solo tiene acceso a `gameData`, que proporciona:

### Métodos de Lectura
- `gameData.getKingdoms()` - Array de reinos
- `gameData.getGenerals()` - Array de generales  
- `gameData.getProvinces()` - Objeto con provincias por reino
- `gameData.getGameRules()` - Reglas del juego
- `gameData.getAIConfig()` - Configuración de IA
- `gameData.getPromptTemplate()` - Template de prompts

### Métodos de Búsqueda
- `gameData.getKingdomById(id)` - Obtiene un reino por ID
- `gameData.getGeneralsByKingdom(kingdomId)` - Generales de un reino
- `gameData.getProvinceNames(kingdomId)` - Nombres de provincias
- `gameData.getProvinceInfo(kingdomId, index)` - Info de una provincia

### Métodos de Imágenes
- `gameData.getGeneralsImage(generalId)`
- `gameData.getKingdomsImage(kingdomId)`
- `gameData.getProvincesImage(kingdomId, index)`

## Métodos Requeridos

Tu clase debe implementar estos métodos que el sistema principal espera:

### Inicialización
- `initialize(gameData)` - Inicializa el estado del juego
- `getGameState()` - Retorna el estado del juego

### Validación y Procesamiento
- `validateAction(generalId, actionType, targetId)` - Valida una acción
  - Retorna: `{ valid: boolean, error?: string }`
- `processTurn(playerActions)` - Procesa un turno completo
  - Retorna: `{ events: Array, turnEvents: Array }`
- `checkVictoryConditions()` - Verifica victoria/derrota
  - Retorna: `{ gameOver: boolean, winner?: string, loser?: string, message?: string }`

### Persistencia
- `serializeState()` - Serializa el estado para guardar
  - Retorna: Objeto serializable
- `deserializeState(savedState)` - Carga un estado guardado
  - Retorna: `boolean` (true si se cargó correctamente)

### Acceso a Entidades
- `getGeneral(generalId)` - Obtiene un general
- `getProvince(provinceId)` - Obtiene una provincia
- `getKingdom(kingdomId)` - Obtiene un reino
- `getPlayerKingdom()` - Obtiene el reino del jugador
- `getAIKingdoms()` - Obtiene todos los reinos de IA
- `getAllGenerals()` - Obtiene todos los generales
- `getAllProvinces()` - Obtiene todas las provincias
- `getGeneralsAtProvince(provinceId)` - Generales en una provincia

### Utilidades
- `isGeneralAvailable(general)` - Verifica si un general está disponible
- `getCapital(kingdom)` - Obtiene la capital de un reino

## Independencia Total

✅ **PERMITIDO:**
- Usar `gameData` para acceder a datos
- Crear tus propios archivos en tu carpeta
- Implementar tu propia lógica de combate, IA, estado, etc.

❌ **NO PERMITIDO:**
- Importar código de otros modos de juego
- Depender de clases base compartidas
- Acceder directamente a archivos fuera de tu carpeta (excepto gameData)

## Ejemplo Mínimo

```javascript
export class MinimalGameMode {
    constructor(gameData) {
        this.gameData = gameData;
        this.state = { turn: 0 };
    }

    initialize(gameData) {
        // Tu lógica de inicialización
        return this.state;
    }

    getGameState() {
        return this.state;
    }

    validateAction(generalId, actionType, targetId) {
        return { valid: true };
    }

    processTurn(playerActions) {
        this.state.turn++;
        return { events: [], turnEvents: [] };
    }

    checkVictoryConditions() {
        return { gameOver: false };
    }

    serializeState() {
        return this.state;
    }

    deserializeState(savedState) {
        this.state = savedState;
        return true;
    }

    // ... implementa todos los métodos de acceso requeridos
    getGeneral(id) { return null; }
    getProvince(id) { return null; }
    getKingdom(id) { return null; }
    getPlayerKingdom() { return null; }
    getAIKingdoms() { return []; }
    getAllGenerals() { return []; }
    getAllProvinces() { return []; }
    getGeneralsAtProvince(id) { return []; }
    isGeneralAvailable(g) { return false; }
    getCapital(k) { return null; }
}
```

## Ver Referencia

Mira `js/gameModes/classic/ClassicGameMode.js` como ejemplo completo de implementación.
