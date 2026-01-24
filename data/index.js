// Exportador centralizado y validador de configuración
import { kingdoms } from './kingdoms.js';
import { generals } from './generals.js';
import { provinceNames } from './provinces.js';
import { gameRules } from './game-rules.js';
import { aiConfig, promptTemplate } from './ai-config.js';

/**
 * Valida que todos los IDs sean únicos
 */
function validateUniqueIds() {
    const kingdomIds = new Set();
    const generalIds = new Set();
    
    // Validar reinos
    for (const kingdom of kingdoms) {
        if (kingdomIds.has(kingdom.id)) {
            console.warn(`Reino duplicado: ${kingdom.id}`);
            return false;
        }
        kingdomIds.add(kingdom.id);
        
        if (!kingdom.id || !kingdom.name) {
            console.warn(`Reino inválido: falta id o name`, kingdom);
            return false;
        }
    }
    
    // Validar generales
    for (const general of generals) {
        if (generalIds.has(general.id)) {
            console.warn(`General duplicado: ${general.id}`);
            return false;
        }
        generalIds.add(general.id);
        
        if (!general.id || !general.name) {
            console.warn(`General inválido: falta id o name`, general);
            return false;
        }
        
        // Validar que el reino de la general exista
        if (!kingdomIds.has(general.kingdom)) {
            console.warn(`General ${general.id} referencia reino inexistente: ${general.kingdom}`);
            return false;
        }
    }
    
    return true;
}

/**
 * Valida formato de URLs de imagen
 */
function validateImageUrls() {
    const urlPattern = /^(https?:\/\/|data:image\/|\/)/;
    
    for (const kingdom of kingdoms) {
        if (kingdom.imageUrl && !urlPattern.test(kingdom.imageUrl)) {
            console.warn(`URL de imagen inválida para reino ${kingdom.id}: ${kingdom.imageUrl}`);
        }
    }
    
    for (const general of generals) {
        if (general.imageUrl && !urlPattern.test(general.imageUrl)) {
            console.warn(`URL de imagen inválida para general ${general.id}: ${general.imageUrl}`);
        }
    }
    
    for (const kingdomId in provinceNames) {
        for (const province of provinceNames[kingdomId]) {
            if (province.imageUrl && !urlPattern.test(province.imageUrl)) {
                console.warn(`URL de imagen inválida para provincia ${province.name}: ${province.imageUrl}`);
            }
        }
    }
}

/**
 * Proporciona valores por defecto
 */
function applyDefaults() {
    // Asegurar que todas las generales tengan maxHp si no está definido
    for (const general of generals) {
        if (!general.maxHp) {
            general.maxHp = general.hp || 100;
        }
    }
}

// Ejecutar validaciones
applyDefaults();
const isValid = validateUniqueIds();
validateImageUrls();

if (!isValid) {
    console.error('Errores de validación en la configuración. Revisa la consola.');
}

// Exportar configuraciones validadas
// Estos datos serán cargados por dataLoader.js y almacenados en memoria
export const KINGDOMS = kingdoms;
export const GENERALS = generals;
export const PROVINCE_NAMES = provinceNames;
export const GAME_CONFIG = gameRules;
export const AI_CONFIG = aiConfig;
export const PROMPT_TEMPLATE = promptTemplate;

// Exportar también funciones helper para compatibilidad
export function getKingdomById(id) {
    return kingdoms.find(k => k.id === id);
}

export function getGeneralsByKingdom(kingdomId) {
    return generals.filter(g => g.kingdom === kingdomId);
}

export function getProvinceNames(kingdomId) {
    const provinces = provinceNames[kingdomId] || [];
    return provinces.map(p => p.name);
}

export function getCapitalName(kingdomId) {
    const names = getProvinceNames(kingdomId);
    return names[0] || 'Capital';
}

// Helper para obtener imagen de una general
export function getGeneralImage(generalId) {
    const general = generals.find(g => g.id === generalId);
    return general?.imageUrl || null;
}

// Helper para obtener imagen de un reino
export function getKingdomImage(kingdomId) {
    const kingdom = kingdoms.find(k => k.id === kingdomId);
    return kingdom?.imageUrl || null;
}

// Helper para obtener imagen de una provincia
export function getProvinceImage(kingdomId, provinceIndex) {
    const provinces = provinceNames[kingdomId] || [];
    if (provinces[provinceIndex]) {
        return provinces[provinceIndex].imageUrl || null;
    }
    return null;
}
