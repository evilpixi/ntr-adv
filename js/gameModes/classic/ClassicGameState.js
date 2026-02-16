/**
 * ClassicGameState - Estructuras de datos puras para el modo clásico
 * Solo contiene datos, sin lógica de gameplay
 * La lógica de gameplay está en ClassicGameMode
 */

/**
 * General - Estructura de datos pura para un general
 * Todos los métodos de gameplay están en ClassicGameMode
 */
export class General {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.kingdom = data.kingdom;
        this.hp = data.hp || 100;
        this.maxHp = data.maxHp || 100;
        this.love = data.love || 50;
        this.strength = data.strength || 10;
        this.status = data.status || 'free'; // free, captured, slave
        this.location = data.location || null; // provinceId o 'capital'
        this.captor = data.captor || null; // kingdomId del captor
        this.captureType = data.captureType || null; // isolation o enslavement
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            kingdom: this.kingdom,
            hp: this.hp,
            maxHp: this.maxHp,
            love: this.love,
            strength: this.strength,
            status: this.status,
            location: this.location,
            captor: this.captor,
            captureType: this.captureType
        };
    }
}

/**
 * Province - Estructura de datos pura para una provincia
 * Todos los métodos de gameplay están en ClassicGameMode
 */
export class Province {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.kingdom = data.kingdom;
        this.hp = data.hp !== undefined ? data.hp : data.maxHp || 3;
        this.maxHp = data.maxHp || 3;
        this.isCapital = data.isCapital || false;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            kingdom: this.kingdom,
            hp: this.hp,
            maxHp: this.maxHp,
            isCapital: this.isCapital
        };
    }
}

/**
 * Kingdom - Estructura de datos pura para un reino
 * Todos los métodos de gameplay están en ClassicGameMode
 */
export class Kingdom {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.owner = data.owner; // 'player' o 'ai'
        this.generals = [];
        this.provinces = [];
    }

    addGeneral(general) {
        this.generals.push(general);
    }

    addProvince(province) {
        this.provinces.push(province);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            owner: this.owner,
            generals: this.generals.map(g => g.toJSON()),
            provinces: this.provinces.map(p => p.toJSON())
        };
    }
}

/**
 * ClassicGameState - Estado del juego para el modo clásico
 * Solo maneja almacenamiento y acceso a datos, sin lógica de gameplay
 */
export class ClassicGameState {
    constructor() {
        this.kingdoms = new Map();
        this.turn = 0;
        this.winner = null;
        this.gameOver = false;
        this.history = [];
    }

    /**
     * Inicializa el estado usando datos puros
     * La lógica de inicialización está en ClassicGameMode
     */
    initializeFromData(kingdoms, generals, provinces, gameRules) {
        // Create kingdoms
        kingdoms.forEach(kingdomData => {
            const kingdom = new Kingdom(kingdomData);
            
            // Add generals
            generals.filter(g => g.kingdom === kingdomData.id).forEach(genData => {
                const general = new General(genData);
                // Assign by default to defend the capital
                if (!general.location) {
                    general.location = 'capital';
                }
                kingdom.addGeneral(general);
            });

            // Add provinces
            const provinceData = provinces[kingdomData.id] || [];
            provinceData.forEach((provinceInfo, index) => {
                const provinceName = typeof provinceInfo === 'string' ? provinceInfo : provinceInfo.name;
                // Create descriptive ID based on province name
                const provinceSlug = provinceName
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Remove accents
                    .replace(/[^a-z0-9]+/g, '-') // Replace special characters with hyphens
                    .replace(/^-+|-+$/g, ''); // Remove hyphens at start and end
                const province = new Province({
                    id: `${kingdomData.id}-${provinceSlug}`,
                    name: provinceName,
                    kingdom: kingdomData.id,
                    isCapital: index === 0,
                    maxHp: gameRules.provinceMaxHp
                });
                kingdom.addProvince(province);
            });

            this.kingdoms.set(kingdomData.id, kingdom);
        });

        this.turn = 0;
        this.winner = null;
        this.gameOver = false;
        this.history = [];
    }

    getKingdom(id) {
        return this.kingdoms.get(id);
    }

    getPlayerKingdom() {
        return Array.from(this.kingdoms.values()).find(k => k.owner === 'player');
    }

    getAIKingdoms() {
        return Array.from(this.kingdoms.values()).filter(k => k.owner === 'ai');
    }

    getGeneral(id) {
        for (const kingdom of this.kingdoms.values()) {
            const general = kingdom.generals.find(g => g.id === id);
            if (general) return general;
        }
        return null;
    }

    getProvince(id) {
        for (const kingdom of this.kingdoms.values()) {
            const province = kingdom.provinces.find(p => p.id === id);
            if (province) return province;
        }
        return null;
    }

    getAllProvinces() {
        const provinces = [];
        for (const kingdom of this.kingdoms.values()) {
            provinces.push(...kingdom.provinces);
        }
        return provinces;
    }

    getAllGenerals() {
        const generals = [];
        for (const kingdom of this.kingdoms.values()) {
            generals.push(...kingdom.generals);
        }
        return generals;
    }

    getGeneralsAtProvince(provinceId) {
        const province = this.getProvince(provinceId);
        if (!province) return [];
        
        const allGenerals = this.getAllGenerals();
        const generalsAtProvince = [];
        
        for (const general of allGenerals) {
            // If province is capital and general is at 'capital', or if location matches
            if (province.isCapital && general.location === 'capital' && general.kingdom === province.kingdom) {
                generalsAtProvince.push(general);
            } else if (general.location === provinceId) {
                generalsAtProvince.push(general);
            }
        }
        
        return generalsAtProvince;
    }

    toJSON() {
        return {
            turn: this.turn,
            winner: this.winner,
            gameOver: this.gameOver,
            kingdoms: Array.from(this.kingdoms.values()).map(k => k.toJSON())
        };
    }
}
