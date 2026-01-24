// GameState ahora recibe datos como parámetros en lugar de importarlos
// Esto permite que los datos sean modificables en runtime
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
            // Cambiar de reino al captor
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
        this.hp = this.maxHp; // Restaurar HP al cambiar de dueño
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
     * Inicializa el estado del juego con datos parametrizados
     * @param {Object} gameData - Objeto con datos del juego (kingdoms, generals, provinces)
     */
    initialize(gameData) {
        // Obtener datos de gameData
        const kingdoms = gameData.getKingdoms();
        const generals = gameData.getGenerals();
        const provinces = gameData.getProvinces();

        // Crear reinos
        kingdoms.forEach(kingdomData => {
            const kingdom = new Kingdom(kingdomData);
            
            // Agregar generales
            generals.filter(g => g.kingdom === kingdomData.id).forEach(genData => {
                const general = new General(genData);
                kingdom.addGeneral(general);
            });

            // Agregar provincias
            const provinceData = provinces[kingdomData.id] || [];
            provinceData.forEach((provinceInfo, index) => {
                const provinceName = typeof provinceInfo === 'string' ? provinceInfo : provinceInfo.name;
                const province = new Province({
                    id: `${kingdomData.id}_province_${index}`,
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

    validateAction(generalId, actionType, targetId) {
        const general = this.getGeneral(generalId);
        if (!general) return { valid: false, error: 'General no encontrada' };
        if (!general.isAvailable()) return { valid: false, error: 'General no disponible' };

        if (actionType === 'attack' || actionType === 'defend') {
            const province = this.getProvince(targetId);
            if (!province) return { valid: false, error: 'Provincia no encontrada' };
            if (actionType === 'defend' && province.kingdom !== general.kingdom) {
                return { valid: false, error: 'No puedes defender provincias enemigas' };
            }
            if (actionType === 'attack' && province.kingdom === general.kingdom) {
                return { valid: false, error: 'No puedes atacar tus propias provincias' };
            }
        }

        if (['rest', 'date', 'train'].includes(actionType)) {
            const kingdom = this.getKingdom(general.kingdom);
            const capital = kingdom.getCapital();
            if (!capital) return { valid: false, error: 'Capital no encontrada' };
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
            console.error('Error cargando estado:', e);
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
