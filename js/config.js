// Configuración del juego
// Este archivo actúa como wrapper de compatibilidad
// El acceso principal a los datos es a través de gameData en memoria

import { gameData } from './dataLoader.js';

// Re-exportar funciones que acceden a gameData en memoria
export function getKingdoms() {
    return gameData.getKingdoms();
}

export function getGenerals() {
    return gameData.getGenerals();
}

export function getProvinces() {
    return gameData.getProvinces();
}

export function getGameRules() {
    return gameData.getGameRules();
}

export function getAIConfig() {
    return gameData.getAIConfig();
}

export function getPromptTemplate() {
    return gameData.getPromptTemplate();
}

// Funciones helper que acceden a datos en memoria
export function getKingdomById(id) {
    return gameData.getKingdomById(id);
}

export function getGeneralsByKingdom(kingdomId) {
    return gameData.getGeneralsByKingdom(kingdomId);
}

export function getProvinceNames(kingdomId) {
    return gameData.getProvinceNames(kingdomId);
}

export function getCapitalName(kingdomId) {
    const names = getProvinceNames(kingdomId);
    return names[0] || 'Capital';
}

export function getGeneralImage(generalId) {
    return gameData.getGeneralImage(generalId);
}

export function getKingdomImage(kingdomId) {
    return gameData.getKingdomImage(kingdomId);
}

export function getProvinceImage(kingdomId, provinceIndex) {
    return gameData.getProvinceImage(kingdomId, provinceIndex);
}

// Exportar constantes para compatibilidad usando getters
// Estas propiedades acceden a gameData en memoria
// Nota: Solo funcionan después de que gameData.load() haya sido llamado

// Crear objetos con getters para compatibilidad
const createGetter = (getterFn) => {
    return {
        get value() { return getterFn(); }
    };
};

// Para arrays, crear proxies que actúan como arrays
function createArrayLike(getterFn) {
    const handler = {
        get(target, prop) {
            const arr = getterFn();
            if (prop === 'length') return arr.length;
            if (prop === Symbol.iterator) return arr[Symbol.iterator].bind(arr);
            if (typeof prop === 'string' && !isNaN(prop)) {
                return arr[parseInt(prop)];
            }
            if (typeof arr[prop] === 'function') {
                return arr[prop].bind(arr);
            }
            return arr[prop];
        },
        has(target, prop) {
            const arr = getterFn();
            return prop in arr || prop === 'length';
        }
    };
    return new Proxy([], handler);
}

export const KINGDOMS = createArrayLike(() => gameData.getKingdoms());
export const GENERALS = createArrayLike(() => gameData.getGenerals());
export const PROVINCE_NAMES = new Proxy({}, {
    get(target, prop) {
        return gameData.getProvinces()[prop];
    },
    has(target, prop) {
        return prop in gameData.getProvinces();
    },
    ownKeys(target) {
        return Object.keys(gameData.getProvinces());
    }
});

export const GAME_CONFIG = new Proxy({}, {
    get(target, prop) {
        return gameData.getGameRules()[prop];
    },
    has(target, prop) {
        return prop in gameData.getGameRules();
    }
});

export const AI_CONFIG = new Proxy({}, {
    get(target, prop) {
        return gameData.getAIConfig()[prop];
    },
    has(target, prop) {
        return prop in gameData.getAIConfig();
    }
});

// PROMPT_TEMPLATE es un string, crear getter
const promptTemplateGetter = () => gameData.getPromptTemplate();
export const PROMPT_TEMPLATE = new Proxy('', {
    get(target, prop) {
        const str = promptTemplateGetter();
        if (prop === 'valueOf' || prop === Symbol.toPrimitive) {
            return () => str;
        }
        if (typeof String.prototype[prop] === 'function') {
            return String.prototype[prop].bind(str);
        }
        return str[prop];
    },
    valueOf() {
        return promptTemplateGetter();
    },
    toString() {
        return promptTemplateGetter();
    }
});

// Nota: Para acceso directo a los datos, usa gameData directamente
// import { gameData } from './dataLoader.js';
// const kingdoms = gameData.getKingdoms();
