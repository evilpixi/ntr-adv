import { getGameRules } from './config.js';

/**
 * Calcula el resultado de un combate entre dos generales
 * @param {General} attacker - General atacante
 * @param {General} defender - General defensora
 * @returns {Object} - { winner: General, loser: General, damage: number }
 */
export function calculateCombat(attacker, defender) {
    const gameRules = getGameRules();
    const baseDamage = gameRules.combatDamageBase;
    const randomDamage = Math.floor(Math.random() * (gameRules.combatDamageRandom + 1));
    const damage = baseDamage + attacker.strength + randomDamage - (defender.strength / 2);
    
    const finalDamage = Math.max(1, Math.floor(damage));
    
    const attackerDead = attacker.takeDamage(Math.floor(finalDamage * 0.3)); // Atacante recibe daño reducido
    const defenderDead = defender.takeDamage(finalDamage);
    
    if (defenderDead) {
        return {
            winner: attacker,
            loser: defender,
            damage: finalDamage,
            attackerHp: attacker.hp,
            defenderHp: 0
        };
    } else if (attackerDead) {
        return {
            winner: defender,
            loser: attacker,
            damage: Math.floor(finalDamage * 0.3),
            attackerHp: 0,
            defenderHp: defender.hp
        };
    } else {
        // Si nadie murió, el ganador es quien tiene más HP restante
        if (attacker.hp > defender.hp) {
            return {
                winner: attacker,
                loser: defender,
                damage: finalDamage,
                attackerHp: attacker.hp,
                defenderHp: defender.hp
            };
        } else {
            return {
                winner: defender,
                loser: attacker,
                damage: Math.floor(finalDamage * 0.3),
                attackerHp: attacker.hp,
                defenderHp: defender.hp
            };
        }
    }
}

/**
 * Procesa un ataque a una provincia
 * @param {General} attacker - General atacante
 * @param {Province} province - Provincia objetivo
 * @param {General|null} defender - General defensora (opcional)
 * @returns {Object} - Resultado del ataque
 */
export function processProvinceAttack(attacker, province, defender = null) {
    const events = [];
    
    if (defender) {
        // Hay combate
        const combatResult = calculateCombat(attacker, defender);
        events.push({
            type: 'combat',
            attacker: attacker.id,
            defender: defender.id,
            winner: combatResult.winner.id,
            loser: combatResult.loser.id,
            damage: combatResult.damage
        });
        
        if (combatResult.loser.hp <= 0) {
            // La perdedora es capturada
            processCapture(combatResult.loser, combatResult.winner);
            events.push({
                type: 'capture',
                general: combatResult.loser.id,
                captor: combatResult.winner.id
            });
        }
        
        // Si el atacante ganó, puede dañar la provincia
        if (combatResult.winner.id === attacker.id) {
            const provinceDestroyed = province.takeDamage();
            events.push({
                type: 'province_damage',
                province: province.id,
                damage: 1,
                destroyed: provinceDestroyed
            });
            
            if (provinceDestroyed) {
                province.changeOwner(attacker.kingdom);
                events.push({
                    type: 'province_conquered',
                    province: province.id,
                    newOwner: attacker.kingdom
                });
            }
        }
    } else {
        // No hay defensa, ataque directo
        const provinceDestroyed = province.takeDamage();
        events.push({
            type: 'province_damage',
            province: province.id,
            damage: 1,
            destroyed: provinceDestroyed
        });
        
        if (provinceDestroyed) {
            province.changeOwner(attacker.kingdom);
            events.push({
                type: 'province_conquered',
                province: province.id,
                newOwner: attacker.kingdom
            });
        }
    }
    
    return { events, success: true };
}

/**
 * Procesa la captura de una general
 * @param {General} general - General capturada
 * @param {General} captor - General captora
 */
export function processCapture(general, captor) {
    general.status = 'captured';
    general.captor = captor.kingdom;
    general.location = captor.location || 'capital';
    // Por defecto, la IA decide ponerla en aislamiento
    // El jugador puede decidir después
    general.captureType = 'isolation';
}

/**
 * Procesa la esclavización de una general capturada
 * @param {General} general - General esclavizada
 * @param {string} captorKingdom - Reino captor
 * @returns {Object} - Resultado de la esclavización
 */
export function processEnslavement(general, captorKingdom) {
    if (general.status !== 'captured') {
        return { success: false, error: 'La general no está capturada' };
    }
    
    general.captureType = 'enslavement';
    general.location = 'capital';
    
    const gameRules = getGameRules();
    const result = general.decreaseLove(gameRules.loveDecreaseOnEnslavement);
    
    if (result.converted) {
        return {
            success: true,
            converted: true,
            message: `${general.name} se ha convertido en esclava de ${captorKingdom}`
        };
    }
    
    return {
        success: true,
        converted: false,
        love: general.love,
        message: `${general.name} está siendo esclavizada. Amor: ${general.love}`
    };
}

/**
 * Verifica las condiciones de victoria/derrota
 * @param {GameState} gameState - Estado del juego
 * @returns {Object} - { gameOver: boolean, winner: string|null, loser: string|null }
 */
export function checkVictoryConditions(gameState) {
    const playerKingdom = gameState.getPlayerKingdom();
    
    // Verificar si el jugador perdió
    if (playerKingdom.isDefeated()) {
        return {
            gameOver: true,
            winner: null,
            loser: 'player',
            message: 'Has sido derrotado. Tu reino ha caído.'
        };
    }
    
    // Verificar si algún reino AI perdió
    const aiKingdoms = gameState.getAIKingdoms();
    const defeatedKingdoms = aiKingdoms.filter(k => k.isDefeated());
    
    if (defeatedKingdoms.length > 0) {
        // Transferir todas las generales y provincias al jugador
        defeatedKingdoms.forEach(kingdom => {
            kingdom.generals.forEach(general => {
                general.kingdom = 'player';
                general.status = 'free';
                general.captor = null;
                general.captureType = null;
                playerKingdom.addGeneral(general);
            });
            
            kingdom.provinces.forEach(province => {
                province.changeOwner('player');
                playerKingdom.addProvince(province);
            });
        });
        
        // Eliminar reinos derrotados
        defeatedKingdoms.forEach(kingdom => {
            gameState.kingdoms.delete(kingdom.id);
        });
    }
    
    // Verificar si el jugador ganó (todos los reinos AI derrotados)
    const remainingAIKingdoms = gameState.getAIKingdoms();
    if (remainingAIKingdoms.length === 0) {
        return {
            gameOver: true,
            winner: 'player',
            loser: null,
            message: '¡Victoria! Has conquistado todos los reinos.'
        };
    }
    
    return {
        gameOver: false,
        winner: null,
        loser: null
    };
}

/**
 * Procesa las acciones de capital (descansar, cita, entrenar)
 * @param {General} general - General que realiza la acción
 * @param {string} actionType - Tipo de acción: 'rest', 'date', 'train'
 * @returns {Object} - Resultado de la acción
 */
export function processCapitalAction(general, actionType) {
    const events = [];
    const gameRules = getGameRules();
    
    switch (actionType) {
        case 'rest':
            const healed = Math.min(gameRules.hpRecoveryOnRest, general.maxHp - general.hp);
            general.heal(gameRules.hpRecoveryOnRest);
            events.push({
                type: 'rest',
                general: general.id,
                hpRecovered: healed,
                newHp: general.hp
            });
            break;
            
        case 'date':
            general.increaseLove(gameRules.loveIncreaseOnDate);
            events.push({
                type: 'date',
                general: general.id,
                loveIncreased: gameRules.loveIncreaseOnDate,
                newLove: general.love
            });
            break;
            
        case 'train':
            general.increaseStrength(gameRules.strengthIncreaseOnTrain);
            events.push({
                type: 'train',
                general: general.id,
                strengthIncreased: gameRules.strengthIncreaseOnTrain,
                newStrength: general.strength
            });
            break;
            
        default:
            return { success: false, error: 'Acción inválida', events: [] };
    }
    
    return { success: true, events };
}
