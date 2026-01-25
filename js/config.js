// Game configuration
// This file acts as a compatibility wrapper
// Main data access is through gameData in memory

import { gameData } from './dataLoader.js';

// Re-export functions that access gameData in memory
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

// Helper functions that access data in memory
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

export function getGeneralsImage(generalId) {
    return gameData.getGeneralsImage(generalId);
}

export function getKingdomsImage(kingdomId) {
    return gameData.getKingdomsImage(kingdomId);
}

export function getProvincesImage(kingdomId, provinceIndex) {
    return gameData.getProvincesImage(kingdomId, provinceIndex);
}

// Maintain compatibility with old names (deprecated)
export function getGeneralImage(generalId) {
    return gameData.getGeneralsImage(generalId);
}

export function getKingdomImage(kingdomId) {
    return gameData.getKingdomsImage(kingdomId);
}

export function getProvinceImage(kingdomId, provinceIndex) {
    return gameData.getProvincesImage(kingdomId, provinceIndex);
}

export function getProvinceDescription(kingdomId, provinceIndex) {
    return gameData.getProvinceDescription(kingdomId, provinceIndex);
}

export function getProvincePrompt(kingdomId, provinceIndex) {
    return gameData.getProvincePrompt(kingdomId, provinceIndex);
}

export function getProvinceInfo(kingdomId, provinceIndex) {
    return gameData.getProvinceInfo(kingdomId, provinceIndex);
}

// Export constants for compatibility using getters
// These properties access gameData in memory
// Note: Only work after gameData.load() has been called

// Create objects with getters for compatibility
const createGetter = (getterFn) => {
    return {
        get value() { return getterFn(); }
    };
};

// For arrays, create proxies that act as arrays
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
export const PROMPT_TEMPLATE = new Proxy({}, {
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

// Note: For direct data access, use gameData directly
// import { gameData } from './dataLoader.js';
// const kingdoms = gameData.getKingdoms();
