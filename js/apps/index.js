/**
 * Apps Registry
 * Sistema centralizado para registrar y gestionar apps disponibles
 * 
 * Las apps pueden ser:
 * - 'game-mode': Modos de juego que usan el sistema de game modes
 * - 'app': Otras aplicaciones independientes
 * 
 * CÓMO REGISTRAR UNA APP:
 * 
 * 1. Para un modo de juego:
 *    registerApp({
 *        id: 'classic',
 *        name: 'Classic Mode',
 *        description: 'Modo de juego clásico',
 *        type: 'game-mode',
 *        gameModeId: 'classic'  // ID del game mode
 *    });
 * 
 * 2. Para otra app:
 *    registerApp({
 *        id: 'my-app',
 *        name: 'My App',
 *        description: 'Descripción de mi app',
 *        type: 'app',
 *        launch: async () => { // lógica de la app }
 *    });
 */

/**
 * Registry de apps disponibles
 */
const appsRegistry = new Map();

/**
 * Registra una app
 * @param {Object} appConfig - Configuración de la app
 * @param {string} appConfig.id - ID único de la app
 * @param {string} appConfig.name - Nombre de la app
 * @param {string} appConfig.description - Descripción de la app
 * @param {string} appConfig.type - Tipo: 'game-mode' o 'app'
 * @param {string} [appConfig.icon] - URL del icono (opcional)
 * @param {string} [appConfig.gameModeId] - ID del game mode (si type es 'game-mode')
 * @param {Function} [appConfig.launch] - Función de lanzamiento (si type es 'app')
 */
export function registerApp(appConfig) {
    const { id, name, description, type } = appConfig;
    
    if (!id || !name || !description || !type) {
        throw new Error('App config must include id, name, description, and type');
    }
    
    if (type === 'game-mode' && !appConfig.gameModeId) {
        throw new Error('Game mode apps must include gameModeId');
    }
    
    if (type === 'app' && !appConfig.launch) {
        throw new Error('App type apps must include launch function');
    }
    
    if (appsRegistry.has(id)) {
        console.warn(`App ${id} is already registered. Overwriting...`);
    }
    
    appsRegistry.set(id, appConfig);
}

/**
 * Obtiene la lista de apps disponibles
 * @returns {Array} - Array de configuraciones de apps
 */
export function getAvailableApps() {
    return Array.from(appsRegistry.values());
}

/**
 * Obtiene una app por ID
 * @param {string} appId - ID de la app
 * @returns {Object|null} - Configuración de la app o null si no existe
 */
export function getApp(appId) {
    return appsRegistry.get(appId) || null;
}

/**
 * Verifica si una app está registrada
 * @param {string} appId - ID de la app
 * @returns {boolean} - true si está registrada
 */
export function isAppRegistered(appId) {
    return appsRegistry.has(appId);
}

/**
 * Lanza una app
 * @param {string} appId - ID de la app a lanzar
 * @returns {Promise} - Promise que se resuelve cuando la app se lanza
 */
export async function launchApp(appId) {
    const app = appsRegistry.get(appId);
    if (!app) {
        throw new Error(`App ${appId} is not registered`);
    }
    
    if (app.type === 'game-mode') {
        // Para game modes, retornamos la información necesaria
        // La lógica de lanzamiento se maneja en welcome.js
        return {
            type: 'game-mode',
            gameModeId: app.gameModeId,
            appId: app.id
        };
    } else if (app.type === 'app') {
        // Para otras apps, ejecutamos la función launch
        if (typeof app.launch === 'function') {
            return await app.launch();
        } else {
            throw new Error(`App ${appId} does not have a launch function`);
        }
    } else {
        throw new Error(`Unknown app type: ${app.type}`);
    }
}

// Registrar apps por defecto
// El modo 'classic' se registra aquí
registerApp({
    id: 'classic',
    name: 'Classic Mode',
    description: 'Modo de juego clásico con reinos, generales y provincias',
    type: 'game-mode',
    gameModeId: 'classic'
});

// Registrar app de biblioteca de datos
registerApp({
    id: 'data-library',
    name: 'Biblioteca de Datos',
    description: 'Explora todos los datos de reinos, generales y provincias',
    type: 'app',
    launch: async () => {
        const { DataLibraryApp } = await import('./dataLibrary.js');
        const app = new DataLibraryApp();
        await app.launch();
        return app;
    }
});
