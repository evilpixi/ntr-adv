/**
 * ClassicGameMode - Implementación del modo de juego clásico
 * Contiene toda la lógica de gameplay: combate, capturas, esclavización, etc.
 */

import { ClassicGameState, General, Province, Kingdom } from './ClassicGameState.js';
import * as Combat from './ClassicCombat.js';
import { makeAIDecisions, decideCaptureType } from './ClassicAI.js';

export class ClassicGameMode {
    constructor(gameData) {
        this.gameData = gameData;
        this.gameState = new ClassicGameState();
    }

    /**
     * Inicializa el estado del juego usando los datos proporcionados
     */
    initialize(gameData) {
        const kingdoms = gameData.getKingdoms();
        const generals = gameData.getGenerals();
        const provinces = gameData.getProvinces();
        const gameRules = gameData.getGameRules();

        this.gameState.initializeFromData(kingdoms, generals, provinces, gameRules);
        return this.gameState;
    }

    /**
     * Valida una acción del jugador
     */
    validateAction(generalId, actionType, targetId) {
        const general = this.getGeneral(generalId);
        if (!general) return { valid: false, error: 'General not found' };
        
        if (!this.isGeneralAvailable(general)) {
            return { valid: false, error: 'General not available' };
        }

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
            const capital = kingdom.provinces.find(p => p.isCapital);
            if (!capital) return { valid: false, error: 'Capital not found' };
        }

        return { valid: true };
    }

    /**
     * Procesa una acción del jugador
     */
    processPlayerAction(action) {
        const general = this.getGeneral(action.generalId);
        if (!general || !this.isGeneralAvailable(general)) {
            return { success: false, events: [] };
        }

        const gameRules = this.gameData.getGameRules();
        const events = [];

        if (action.actionType === 'attack' || action.actionType === 'defend') {
            const province = this.getProvince(action.targetId);
            if (!province) return { success: false, events: [] };

            // Buscar defensora si es ataque
            let defender = null;
            if (action.actionType === 'attack') {
                defender = this.findDefender(province);
            }

            const result = Combat.processProvinceAttack(general, province, defender, gameRules);
            events.push(...result.events);

            general.location = province.id;
        } else if (['rest', 'date', 'train'].includes(action.actionType)) {
            const result = Combat.processCapitalAction(general, action.actionType, gameRules);
            events.push(...result.events);
            general.location = 'capital';
        }

        return { success: true, events };
    }

    /**
     * Procesa las acciones de la IA
     */
    processAIActions(kingdomId) {
        return makeAIDecisions(this.gameState, kingdomId);
    }

    /**
     * Procesa un turno completo
     */
    processTurn(playerActions) {
        const turnEvents = [];

        // Process player actions
        for (const action of playerActions) {
            const result = this.processPlayerAction(action);
            turnEvents.push(...result.events);
        }

        // Process AI actions
        const aiKingdoms = this.getAIKingdoms();
        for (const kingdom of aiKingdoms) {
            const actions = this.processAIActions(kingdom.id);

            for (const action of actions) {
                const general = this.getGeneral(action.generalId);
                if (!general || !this.isGeneralAvailable(general)) continue;

                const gameRules = this.gameData.getGameRules();

                if (action.actionType === 'attack' || action.actionType === 'defend') {
                    const province = this.getProvince(action.targetId);
                    if (!province) continue;

                    let defender = null;
                    if (action.actionType === 'attack') {
                        defender = this.findDefender(province);
                    }

                    const result = Combat.processProvinceAttack(general, province, defender, gameRules);
                    turnEvents.push(...result.events);

                    general.location = province.id;
                } else if (['rest', 'date', 'train'].includes(action.actionType)) {
                    const result = Combat.processCapitalAction(general, action.actionType, gameRules);
                    turnEvents.push(...result.events);
                    general.location = 'capital';
                }
            }

            // Procesar capturas de la IA
            this.processAICaptures(kingdom);
        }

        // Process enslavements
        this.processEnslavements(turnEvents);

        return { events: turnEvents, turnEvents };
    }

    /**
     * Procesa las capturas de la IA
     */
    processAICaptures(kingdom) {
        const capturedGenerals = kingdom.generals.filter(g => g.status === 'captured' && g.captor === kingdom.id);
        const gameRules = this.gameData.getGameRules();

        for (const general of capturedGenerals) {
            const decision = decideCaptureType(general, kingdom.id);
            if (decision === 'enslavement' && general.captureType !== 'enslavement') {
                Combat.processEnslavement(general, kingdom.id, gameRules);
            }
        }
    }

    /**
     * Procesa las esclavizaciones
     */
    processEnslavements(turnEvents) {
        const allGenerals = this.getAllGenerals();
        const enslavedGenerals = allGenerals.filter(g => g.captureType === 'enslavement');
        const gameRules = this.gameData.getGameRules();

        for (const general of enslavedGenerals) {
            const result = this.decreaseLove(general, gameRules.loveDecreaseOnEnslavement);
            if (result.converted) {
                turnEvents.push({
                    type: 'enslavement_conversion',
                    general: general.id,
                    oldKingdom: result.oldKingdom,
                    newKingdom: result.newKingdom
                });
            }
        }
    }

    /**
     * Encuentra un defensor en una provincia
     */
    findDefender(province) {
        const allGenerals = this.getAllGenerals();
        return allGenerals.find(g => {
            if (!this.isGeneralAvailable(g)) return false;
            if (province.isCapital && g.location === 'capital' && g.kingdom === province.kingdom) {
                return true;
            }
            return g.location === province.id && g.kingdom === province.kingdom;
        });
    }

    /**
     * Verifica condiciones de victoria/derrota
     */
    checkVictoryConditions() {
        return Combat.checkVictoryConditions(this.gameState);
    }

    /**
     * Serializa el estado del juego para guardar
     */
    serializeState() {
        const state = {
            turn: this.gameState.turn,
            winner: this.gameState.winner,
            gameOver: this.gameState.gameOver,
            kingdoms: Array.from(this.gameState.kingdoms.values()).map(k => k.toJSON())
        };
        localStorage.setItem('ntrAdvGameState', JSON.stringify(state));
        return state;
    }

    /**
     * Deserializa el estado del juego desde un objeto guardado
     */
    deserializeState(savedState) {
        try {
            this.gameState.turn = savedState.turn || 0;
            this.gameState.winner = savedState.winner || null;
            this.gameState.gameOver = savedState.gameOver || false;

            this.gameState.kingdoms.clear();
            savedState.kingdoms.forEach(kingdomData => {
                const kingdom = new Kingdom(kingdomData);
                
                kingdomData.generals.forEach(genData => {
                    const general = new General(genData);
                    if (!general.location) {
                        general.location = 'capital';
                    }
                    kingdom.addGeneral(general);
                });

                kingdomData.provinces.forEach(provData => {
                    const province = new Province(provData);
                    kingdom.addProvince(province);
                });

                this.gameState.kingdoms.set(kingdomData.id, kingdom);
            });

            return true;
        } catch (e) {
            console.error('Error loading state:', e);
            return false;
        }
    }

    // Métodos de acceso delegados al gameState
    getGeneral(generalId) {
        return this.gameState.getGeneral(generalId);
    }

    getProvince(provinceId) {
        return this.gameState.getProvince(provinceId);
    }

    getKingdom(kingdomId) {
        return this.gameState.getKingdom(kingdomId);
    }

    getPlayerKingdom() {
        return this.gameState.getPlayerKingdom();
    }

    getAIKingdoms() {
        return this.gameState.getAIKingdoms();
    }

    getAllGenerals() {
        return this.gameState.getAllGenerals();
    }

    getAllProvinces() {
        return this.gameState.getAllProvinces();
    }

    getGeneralsAtProvince(provinceId) {
        return this.gameState.getGeneralsAtProvince(provinceId);
    }

    /**
     * Obtiene el estado del juego
     * @returns {Object} - Estado del juego
     */
    getGameState() {
        return this.gameState;
    }

    // Métodos de gameplay (lógica que estaba en las clases General, Province, Kingdom)

    /**
     * Verifica si un general está disponible
     */
    isGeneralAvailable(general) {
        return general.status === 'free' && general.hp > 0;
    }

    /**
     * Verifica si un general está capturado
     */
    isGeneralCaptured(general) {
        return general.status === 'captured' || general.status === 'slave';
    }

    /**
     * Aplica daño a un general
     */
    takeDamage(general, amount) {
        general.hp = Math.max(0, general.hp - amount);
        return general.hp <= 0;
    }

    /**
     * Cura a un general
     */
    heal(general, amount) {
        general.hp = Math.min(general.maxHp, general.hp + amount);
    }

    /**
     * Aumenta el amor de un general
     */
    increaseLove(general, amount) {
        general.love = Math.min(100, general.love + amount);
    }

    /**
     * Disminuye el amor de un general
     */
    decreaseLove(general, amount) {
        general.love = Math.max(0, general.love - amount);
        if (general.love === 0 && general.status === 'captured') {
            general.status = 'slave';
            const oldKingdom = general.kingdom;
            general.kingdom = general.captor;
            return { converted: true, oldKingdom, newKingdom: general.captor };
        }
        return { converted: false };
    }

    /**
     * Aumenta la fuerza de un general
     */
    increaseStrength(general, amount) {
        general.strength += amount;
    }

    /**
     * Aplica daño a una provincia
     */
    takeProvinceDamage(province, amount = 1) {
        province.hp = Math.max(0, province.hp - amount);
        return province.hp <= 0;
    }

    /**
     * Verifica si una provincia está conquistada
     */
    isProvinceConquered(province) {
        return province.hp <= 0;
    }

    /**
     * Cambia el dueño de una provincia
     */
    changeProvinceOwner(province, newOwner) {
        province.kingdom = newOwner;
        province.hp = province.maxHp; // Restore HP when changing owner
    }

    /**
     * Obtiene la capital de un reino
     */
    getCapital(kingdom) {
        return kingdom.provinces.find(p => p.isCapital);
    }

    /**
     * Obtiene los generales disponibles de un reino
     */
    getAvailableGenerals(kingdom) {
        return kingdom.generals.filter(g => this.isGeneralAvailable(g));
    }

    /**
     * Verifica si un reino tiene generales
     */
    hasGenerals(kingdom) {
        return kingdom.generals.some(g => g.hp > 0);
    }

    /**
     * Verifica si un reino está derrotado
     */
    isKingdomDefeated(kingdom) {
        const capital = this.getCapital(kingdom);
        return !this.hasGenerals(kingdom) || (capital && this.isProvinceConquered(capital));
    }
}
