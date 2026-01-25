// GameState now receives data as parameters instead of importing them
// This allows data to be modifiable at runtime
import { getGameRules } from './config.js';

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

    isAvailable() {
        return this.status === 'free' && this.hp > 0;
    }

    isCaptured() {
        return this.status === 'captured' || this.status === 'slave';
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp <= 0;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    increaseLove(amount) {
        this.love = Math.min(100, this.love + amount);
    }

    decreaseLove(amount) {
        this.love = Math.max(0, this.love - amount);
        if (this.love === 0 && this.status === 'captured') {
            this.status = 'slave';
            // Change kingdom to captor
            const oldKingdom = this.kingdom;
            this.kingdom = this.captor;
            return { converted: true, oldKingdom, newKingdom: this.captor };
        }
        return { converted: false };
    }

    increaseStrength(amount) {
        this.strength += amount;
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

export class Province {
    constructor(data) {
        const gameRules = getGameRules();
        this.id = data.id;
        this.name = data.name;
        this.kingdom = data.kingdom;
        this.hp = data.hp || gameRules.provinceMaxHp;
        this.maxHp = gameRules.provinceMaxHp;
        this.isCapital = data.isCapital || false;
    }

    takeDamage(amount = 1) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp <= 0;
    }

    isConquered() {
        return this.hp <= 0;
    }

    changeOwner(newOwner) {
        this.kingdom = newOwner;
        this.hp = this.maxHp; // Restore HP when changing owner
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

    getCapital() {
        return this.provinces.find(p => p.isCapital);
    }

    getAvailableGenerals() {
        return this.generals.filter(g => g.isAvailable());
    }

    hasGenerals() {
        return this.generals.some(g => g.hp > 0);
    }

    isDefeated() {
        return !this.hasGenerals() || this.getCapital()?.isConquered();
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

export class GameState {
    constructor() {
        this.kingdoms = new Map();
        this.turn = 0;
        this.winner = null;
        this.gameOver = false;
        this.history = [];
    }

    /**
     * Initializes game state with parameterized data
     * @param {Object} gameData - Object with game data (kingdoms, generals, provinces)
     */
    initialize(gameData) {
        // Get data from gameData
        const kingdoms = gameData.getKingdoms();
        const generals = gameData.getGenerals();
        const provinces = gameData.getProvinces();

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
                    isCapital: index === 0
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

    validateAction(generalId, actionType, targetId) {
        const general = this.getGeneral(generalId);
        if (!general) return { valid: false, error: 'General not found' };
        if (!general.isAvailable()) return { valid: false, error: 'General not available' };

        if (actionType === 'attack' || actionType === 'defend') {
            const province = this.getProvince(targetId);
            if (!province) return { valid: false, error: 'Province not found' };
            if (actionType === 'defend' && province.kingdom !== general.kingdom) {
                return { valid: false, error: 'You cannot defend enemy provinces' };
            }
            if (actionType === 'attack' && province.kingdom === general.kingdom) {
                return { valid: false, error: 'You cannot attack your own provinces' };
            }
        }

        if (['rest', 'date', 'train'].includes(actionType)) {
            const kingdom = this.getKingdom(general.kingdom);
            const capital = kingdom.getCapital();
            if (!capital) return { valid: false, error: 'Capital not found' };
        }

        return { valid: true };
    }

    saveState() {
        const state = {
            turn: this.turn,
            winner: this.winner,
            gameOver: this.gameOver,
            kingdoms: Array.from(this.kingdoms.values()).map(k => k.toJSON())
        };
        localStorage.setItem('ntrAdvGameState', JSON.stringify(state));
        return state;
    }

    loadState() {
        const saved = localStorage.getItem('ntrAdvGameState');
        if (!saved) return false;

        try {
            const state = JSON.parse(saved);
            this.turn = state.turn || 0;
            this.winner = state.winner || null;
            this.gameOver = state.gameOver || false;

            this.kingdoms.clear();
            state.kingdoms.forEach(kingdomData => {
                const kingdom = new Kingdom(kingdomData);
                
                kingdomData.generals.forEach(genData => {
                    const general = new General(genData);
                    // If no location assigned, assign to capital by default
                    if (!general.location) {
                        general.location = 'capital';
                    }
                    kingdom.addGeneral(general);
                });

                kingdomData.provinces.forEach(provData => {
                    const province = new Province(provData);
                    kingdom.addProvince(province);
                });

                this.kingdoms.set(kingdomData.id, kingdom);
            });

            return true;
        } catch (e) {
            console.error('Error loading state:', e);
            return false;
        }
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
