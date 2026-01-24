/**
 * GameDataLoader - Singleton para cargar y almacenar todos los datos del juego en memoria
 * Todos los datos se cargan una vez al inicio y pueden modificarse en runtime
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
     * Carga todos los datos del juego al inicio
     */
    async load() {
        if (this.loaded) {
            console.warn('Los datos ya están cargados');
            return;
        }

        try {
            // Cargar datos predeterminados
            const defaultData = await import('../data/index.js');
            
            // Inicializar con datos predeterminados
            this.kingdoms = [...(defaultData.KINGDOMS || [])];
            this.generals = [...(defaultData.GENERALS || [])];
            this.provinces = { ...(defaultData.PROVINCE_NAMES || {}) };
            this.gameRules = { ...(defaultData.GAME_CONFIG || {}) };
            this.aiConfig = { ...(defaultData.AI_CONFIG || {}) };
            this.promptTemplate = defaultData.PROMPT_TEMPLATE || '';

            // Intentar cargar datos personalizados si existen
            try {
                const customData = await import('../data/custom-data.js');
                
                // Fusionar reinos (custom sobrescribe predeterminados)
                if (customData.customKingdoms && customData.customKingdoms.length > 0) {
                    this.kingdoms = this.mergeArrays(this.kingdoms, customData.customKingdoms, 'id');
                }
                
                // Fusionar generales
                if (customData.customGenerals && customData.customGenerals.length > 0) {
                    this.generals = this.mergeArrays(this.generals, customData.customGenerals, 'id');
                }
                
                // Fusionar provincias
                if (customData.customProvinces) {
                    this.provinces = { ...this.provinces, ...customData.customProvinces };
                }
                
                // Fusionar reglas del juego
                if (customData.customGameRules) {
                    this.gameRules = { ...this.gameRules, ...customData.customGameRules };
                }
                
                // Fusionar configuración de IA
                if (customData.customAIConfig) {
                    this.aiConfig = { ...this.aiConfig, ...customData.customAIConfig };
                }
                
                console.log('Datos personalizados cargados y fusionados');
            } catch (e) {
                // custom-data.js no existe, continuar con datos predeterminados
                console.log('No se encontró custom-data.js, usando datos predeterminados');
            }

            // Validar datos cargados
            this.validate();

            this.loaded = true;
            console.log('Datos del juego cargados exitosamente en memoria');
        } catch (error) {
            console.error('Error cargando datos del juego:', error);
            throw error;
        }
    }

    /**
     * Fusiona dos arrays, sobrescribiendo elementos con el mismo id
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
     * Valida que los datos cargados sean válidos
     */
    validate() {
        const kingdomIds = new Set();
        const generalIds = new Set();

        // Validar reinos
        for (const kingdom of this.kingdoms) {
            if (kingdomIds.has(kingdom.id)) {
                console.warn(`Reino duplicado: ${kingdom.id}`);
            }
            kingdomIds.add(kingdom.id);
        }

        // Validar generales
        for (const general of this.generals) {
            if (generalIds.has(general.id)) {
                console.warn(`General duplicado: ${general.id}`);
            }
            generalIds.add(general.id);

            if (!kingdomIds.has(general.kingdom)) {
                console.warn(`General ${general.id} referencia reino inexistente: ${general.kingdom}`);
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

    // Setters para modificar datos en runtime
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

    // Métodos para agregar/modificar elementos individuales
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
