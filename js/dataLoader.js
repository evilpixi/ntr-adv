/**
 * GameDataLoader - Singleton to load and store all game data in memory
 * All data is loaded once at start and can be modified at runtime
 */

class GameDataLoader {
    constructor() {
        this.kingdoms = [];
        this.generals = [];
        this.provinces = {};
        this.gameRules = {};
        this.aiConfig = {};
        this.promptTemplate = '';
        this.loaded = false;
    }

    /**
     * Loads all game data at start
     */
    async load() {
        if (this.loaded) {
            console.warn('Data already loaded');
            return;
        }

        try {
            // Load default data
            const defaultData = await import('../data/index.js');
            
            // Initialize with default data
            this.kingdoms = [...(defaultData.KINGDOMS || [])];
            this.generals = [...(defaultData.GENERALS || [])];
            this.provinces = { ...(defaultData.PROVINCE_NAMES || {}) };
            this.gameRules = { ...(defaultData.GAME_CONFIG || {}) };
            this.aiConfig = { ...(defaultData.AI_CONFIG || {}) };
            this.promptTemplate = defaultData.PROMPT_TEMPLATE || '';

            // Try to load custom data if exists
            try {
                const customData = await import('../data/custom-data.js');
                
                // Merge kingdoms (custom overrides defaults)
                if (customData.customKingdoms && customData.customKingdoms.length > 0) {
                    this.kingdoms = this.mergeArrays(this.kingdoms, customData.customKingdoms, 'id');
                }
                
                // Merge generals
                if (customData.customGenerals && customData.customGenerals.length > 0) {
                    this.generals = this.mergeArrays(this.generals, customData.customGenerals, 'id');
                }
                
                // Merge provinces
                if (customData.customProvinces) {
                    this.provinces = { ...this.provinces, ...customData.customProvinces };
                }
                
                // Merge game rules
                if (customData.customGameRules) {
                    this.gameRules = { ...this.gameRules, ...customData.customGameRules };
                }
                
                // Merge AI configuration
                if (customData.customAIConfig) {
                    this.aiConfig = { ...this.aiConfig, ...customData.customAIConfig };
                }
                
                console.log('Custom data loaded and merged');
            } catch (e) {
                // custom-data.js doesn't exist, continue with default data
                console.log('custom-data.js not found, using default data');
            }

            // Validate loaded data
            this.validate();

            this.loaded = true;
            console.log('Game data loaded successfully in memory');
        } catch (error) {
            console.error('Error loading game data:', error);
            throw error;
        }
    }

    /**
     * Merges two arrays, overwriting elements with the same id
     */
    mergeArrays(baseArray, overrideArray, idKey) {
        const result = [...baseArray];
        overrideArray.forEach(overrideItem => {
            const index = result.findIndex(item => item[idKey] === overrideItem[idKey]);
            if (index >= 0) {
                result[index] = { ...result[index], ...overrideItem };
            } else {
                result.push(overrideItem);
            }
        });
        return result;
    }

    /**
     * Validates that loaded data is valid
     */
    validate() {
        const kingdomIds = new Set();
        const generalIds = new Set();
        
        // Validate kingdoms
        for (const kingdom of this.kingdoms) {
            if (kingdomIds.has(kingdom.id)) {
                console.warn(`Duplicate kingdom: ${kingdom.id}`);
            }
            kingdomIds.add(kingdom.id);
        }
        
        // Validate generals
        for (const general of this.generals) {
            if (generalIds.has(general.id)) {
                console.warn(`Duplicate general: ${general.id}`);
            }
            generalIds.add(general.id);
            
            if (!kingdomIds.has(general.kingdom)) {
                console.warn(`General ${general.id} references non-existent kingdom: ${general.kingdom}`);
            }
        }
    }

    // Getters
    getKingdoms() {
        return this.kingdoms;
    }

    getGenerals() {
        return this.generals;
    }

    getProvinces() {
        return this.provinces;
    }

    getGameRules() {
        return this.gameRules;
    }

    getAIConfig() {
        return this.aiConfig;
    }

    getPromptTemplate() {
        return this.promptTemplate;
    }

    getKingdomById(id) {
        return this.kingdoms.find(k => k.id === id);
    }

    getGeneralsByKingdom(kingdomId) {
        return this.generals.filter(g => g.kingdom === kingdomId);
    }

    getProvinceNames(kingdomId) {
        const provinces = this.provinces[kingdomId] || [];
        return provinces.map(p => typeof p === 'string' ? p : p.name);
    }

    getGeneralImage(generalId) {
        const general = this.generals.find(g => g.id === generalId);
        return general?.imageUrl || null;
    }

    getKingdomImage(kingdomId) {
        const kingdom = this.kingdoms.find(k => k.id === kingdomId);
        return kingdom?.imageUrl || null;
    }

    getProvinceImage(kingdomId, provinceIndex) {
        const provinces = this.provinces[kingdomId] || [];
        if (provinces[provinceIndex]) {
            const province = provinces[provinceIndex];
            return typeof province === 'string' ? null : (province.imageUrl || null);
        }
        return null;
    }

    getProvinceDescription(kingdomId, provinceIndex) {
        const provinces = this.provinces[kingdomId] || [];
        if (provinces[provinceIndex]) {
            const province = provinces[provinceIndex];
            return typeof province === 'string' ? null : (province.description || null);
        }
        return null;
    }

    getProvincePrompt(kingdomId, provinceIndex) {
        const provinces = this.provinces[kingdomId] || [];
        if (provinces[provinceIndex]) {
            const province = provinces[provinceIndex];
            return typeof province === 'string' ? null : (province.prompt || null);
        }
        return null;
    }

    getProvinceInfo(kingdomId, provinceIndex) {
        const provinces = this.provinces[kingdomId] || [];
        if (provinces[provinceIndex]) {
            const province = provinces[provinceIndex];
            return typeof province === 'string' ? { name: province } : province;
        }
        return null;
    }

    // Setters to modify data at runtime
    setKingdoms(kingdoms) {
        this.kingdoms = kingdoms;
    }

    setGenerals(generals) {
        this.generals = generals;
    }

    setProvinces(provinces) {
        this.provinces = provinces;
    }

    setGameRules(rules) {
        this.gameRules = rules;
    }

    setAIConfig(config) {
        this.aiConfig = config;
    }

    // Methods to add/modify individual elements
    addKingdom(kingdom) {
        this.kingdoms.push(kingdom);
    }

    updateKingdom(id, updates) {
        const index = this.kingdoms.findIndex(k => k.id === id);
        if (index >= 0) {
            this.kingdoms[index] = { ...this.kingdoms[index], ...updates };
        }
    }

    addGeneral(general) {
        this.generals.push(general);
    }

    updateGeneral(id, updates) {
        const index = this.generals.findIndex(g => g.id === id);
        if (index >= 0) {
            this.generals[index] = { ...this.generals[index], ...updates };
        }
    }
}

// Exportar instancia singleton
export const gameData = new GameDataLoader();
