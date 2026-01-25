// Centralized exporter and configuration validator
import { kingdoms } from './kingdoms.js';
import { generals } from './generals.js';
import { provinceNames } from './provinces.js';
import { gameRules } from './game-rules.js';
import { aiConfig, promptTemplate } from './ai-config.js';

/**
 * Validates that all IDs are unique
 */
function validateUniqueIds() {
    const kingdomIds = new Set();
    const generalIds = new Set();
    
    // Validate kingdoms
    for (const kingdom of kingdoms) {
        if (kingdomIds.has(kingdom.id)) {
            console.warn(`Duplicate kingdom: ${kingdom.id}`);
            return false;
        }
        kingdomIds.add(kingdom.id);
        
        if (!kingdom.id || !kingdom.name) {
            console.warn(`Invalid kingdom: missing id or name`, kingdom);
            return false;
        }
    }
    
    // Validate generals
    for (const general of generals) {
        if (generalIds.has(general.id)) {
            console.warn(`Duplicate general: ${general.id}`);
            return false;
        }
        generalIds.add(general.id);
        
        if (!general.id || !general.name) {
            console.warn(`Invalid general: missing id or name`, general);
            return false;
        }
        
        // Validate that the general's kingdom exists
        if (!kingdomIds.has(general.kingdom)) {
            console.warn(`General ${general.id} references non-existent kingdom: ${general.kingdom}`);
            return false;
        }
    }
    
    return true;
}

/**
 * Validates image URL format
 */
function validateImageUrls() {
    // Accepts: http/https, data:image/, absolute paths (/), relative paths (../ or ./), 
    // and simple filenames (which will be built automatically)
    // Simple filenames must have a valid image extension
    const urlPattern = /^(https?:\/\/|data:image\/|\/|\.\.\/|\.\/)/;
    const filenamePattern = /\.(png|jpg|jpeg|gif|svg|webp)$/i;
    
    for (const kingdom of kingdoms) {
        if (kingdom.imageUrl && !urlPattern.test(kingdom.imageUrl) && !filenamePattern.test(kingdom.imageUrl)) {
            console.warn(`Invalid image URL for kingdom ${kingdom.id}: ${kingdom.imageUrl}. Must be a full URL or a filename with valid extension.`);
        }
    }
    
    for (const general of generals) {
        if (general.imageUrl && !urlPattern.test(general.imageUrl) && !filenamePattern.test(general.imageUrl)) {
            console.warn(`Invalid image URL for general ${general.id}: ${general.imageUrl}. Must be a full URL or a filename with valid extension.`);
        }
    }
    
    for (const kingdomId in provinceNames) {
        for (const province of provinceNames[kingdomId]) {
            if (province.imageUrl && !urlPattern.test(province.imageUrl) && !filenamePattern.test(province.imageUrl)) {
                console.warn(`Invalid image URL for province ${province.name}: ${province.imageUrl}. Must be a full URL or a filename with valid extension.`);
            }
        }
    }
}

/**
 * Provides default values
 */
function applyDefaults() {
    // Ensure all generals have maxHp if not defined
    for (const general of generals) {
        if (!general.maxHp) {
            general.maxHp = general.hp || 100;
        }
    }
}

// Run validations
applyDefaults();
const isValid = validateUniqueIds();
validateImageUrls();

if (!isValid) {
    console.error('Configuration validation errors. Check the console.');
}

// Export validated configurations
// This data will be loaded by dataLoader.js and stored in memory
export const KINGDOMS = kingdoms;
export const GENERALS = generals;
export const PROVINCE_NAMES = provinceNames;
export const GAME_CONFIG = gameRules;
export const AI_CONFIG = aiConfig;
export const PROMPT_TEMPLATE = promptTemplate;

// Also export helper functions for compatibility
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

// Helper to get image of a general (deprecated - use getGeneralsImage)
export function getGeneralImage(generalId) {
    const general = generals.find(g => g.id === generalId);
    return general?.imageUrl || null;
}

// Helper to get image of a kingdom (deprecated - use getKingdomsImage)
export function getKingdomImage(kingdomId) {
    const kingdom = kingdoms.find(k => k.id === kingdomId);
    return kingdom?.imageUrl || null;
}

// Helper to get image of a province (deprecated - use getProvincesImage)
export function getProvinceImage(kingdomId, provinceIndex) {
    const provinces = provinceNames[kingdomId] || [];
    if (provinces[provinceIndex]) {
        return provinces[provinceIndex].imageUrl || null;
    }
    return null;
}

// Helper to get description of a province
export function getProvinceDescription(kingdomId, provinceIndex) {
    const provinces = provinceNames[kingdomId] || [];
    if (provinces[provinceIndex]) {
        return provinces[provinceIndex].description || null;
    }
    return null;
}

// Helper to get prompt of a province
export function getProvincePrompt(kingdomId, provinceIndex) {
    const provinces = provinceNames[kingdomId] || [];
    if (provinces[provinceIndex]) {
        return provinces[provinceIndex].prompt || null;
    }
    return null;
}

// Helper to get all information of a province
export function getProvinceInfo(kingdomId, provinceIndex) {
    const provinces = provinceNames[kingdomId] || [];
    if (provinces[provinceIndex]) {
        return provinces[provinceIndex];
    }
    return null;
}
