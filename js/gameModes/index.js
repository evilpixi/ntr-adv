/**
 * Game Modes Registry
 * Sistema centralizado para registrar y crear instancias de modos de juego
 * 
 * CÓMO CREAR UN NUEVO MODO DE JUEGO:
 * 
 * 1. Crea una nueva carpeta en js/gameModes/ con el nombre de tu modo (ej: 'speed', 'campaign')
 * 2. Crea tu clase de modo de juego en esa carpeta (ej: SpeedGameMode.js)
 * 3. Tu clase debe:
 *    - Recibir gameData en el constructor: constructor(gameData) { this.gameData = gameData; }
 *    - Implementar los métodos que el sistema principal necesita (ver ClassicGameMode.js como referencia)
 *    - Ser completamente independiente: solo puede usar gameData y sus propios archivos
 * 4. Importa y registra tu modo aquí abajo con: registerGameMode('tu-mod-id', TuGameModeClass)
 * 
 * INTERFAZ DE gameData (lo único a lo que tienes acceso):
 * - gameData.getKingdoms() - Array de reinos
 * - gameData.getGenerals() - Array de generales
 * - gameData.getProvinces() - Objeto con provincias por reino
 * - gameData.getGameRules() - Reglas del juego
 * - gameData.getAIConfig() - Configuración de IA
 * - gameData.getPromptTemplate() - Template de prompts
 * 
 * Cada modo es un entorno de ejecución completamente independiente.
 * No hay dependencias entre modos, solo comparten el acceso a gameData.
 */

import { ClassicGameMode } from './classic/ClassicGameMode.js';

/**
 * Registry de modos de juego disponibles
 */
const gameModesRegistry = new Map();

/**
 * Registra un modo de juego
 * @param {string} modeId - ID único del modo
 * @param {Function} ModeClass - Clase del modo de juego
 */
export function registerGameMode(modeId, ModeClass) {
    if (gameModesRegistry.has(modeId)) {
        console.warn(`Game mode ${modeId} is already registered. Overwriting...`);
    }
    gameModesRegistry.set(modeId, ModeClass);
}

/**
 * Crea una instancia de un modo de juego
 * @param {string} modeId - ID del modo a crear
 * @param {Object} gameData - Datos del juego
 * @returns {Object} - Instancia del modo de juego
 */
export function createGameMode(modeId, gameData) {
    const ModeClass = gameModesRegistry.get(modeId);
    if (!ModeClass) {
        throw new Error(`Game mode ${modeId} is not registered`);
    }
    return new ModeClass(gameData);
}

/**
 * Obtiene la lista de modos de juego registrados
 * @returns {Array} - Array de IDs de modos disponibles
 */
export function getAvailableGameModes() {
    return Array.from(gameModesRegistry.keys());
}

/**
 * Verifica si un modo está registrado
 * @param {string} modeId - ID del modo
 * @returns {boolean} - true si está registrado
 */
export function isGameModeRegistered(modeId) {
    return gameModesRegistry.has(modeId);
}

// Registrar modos por defecto
registerGameMode('classic', ClassicGameMode);

// Exportar el modo clásico como default para compatibilidad
export { ClassicGameMode };
