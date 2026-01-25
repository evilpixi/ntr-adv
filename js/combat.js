import { getGameRules } from './config.js';

/**
 * Calculates the result of combat between two generals
 * @param {General} attacker - Attacking general
 * @param {General} defender - Defending general
 * @returns {Object} - { winner: General, loser: General, damage: number }
 */
export function calculateCombat(attacker, defender) {
    const gameRules = getGameRules();
    const baseDamage = gameRules.combatDamageBase;
    const randomDamage = Math.floor(Math.random() * (gameRules.combatDamageRandom + 1));
    const damage = baseDamage + attacker.strength + randomDamage - (defender.strength / 2);
    
    const finalDamage = Math.max(1, Math.floor(damage));
    
    const attackerDead = attacker.takeDamage(Math.floor(finalDamage * 0.3)); // Attacker receives reduced damage
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
        // If no one died, winner is whoever has more remaining HP
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
 * Processes an attack on a province
 * @param {General} attacker - Attacking general
 * @param {Province} province - Target province
 * @param {General|null} defender - Defending general (optional)
 * @returns {Object} - Attack result
 */
export function processProvinceAttack(attacker, province, defender = null) {
    const events = [];
    
    if (defender) {
        // There is combat
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
            // The loser is captured
            processCapture(combatResult.loser, combatResult.winner);
            events.push({
                type: 'capture',
                general: combatResult.loser.id,
                captor: combatResult.winner.id
            });
        }
        
        // If the attacker won, they can damage the province
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
        // No defense, direct attack
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
 * Processes the capture of a general
 * @param {General} general - Captured general
 * @param {General} captor - Captor general
 */
export function processCapture(general, captor) {
    general.status = 'captured';
    general.captor = captor.kingdom;
    general.location = captor.location || 'capital';
    // By default, AI decides to put her in isolation
    // Player can decide later
    general.captureType = 'isolation';
}

/**
 * Processes the enslavement of a captured general
 * @param {General} general - Enslaved general
 * @param {string} captorKingdom - Captor kingdom
 * @returns {Object} - Enslavement result
 */
export function processEnslavement(general, captorKingdom) {
    if (general.status !== 'captured') {
        return { success: false, error: 'The general is not captured' };
    }
    
    general.captureType = 'enslavement';
    general.location = 'capital';
    
    const gameRules = getGameRules();
    const result = general.decreaseLove(gameRules.loveDecreaseOnEnslavement);
    
    if (result.converted) {
        return {
            success: true,
            converted: true,
            message: `${general.name} has been converted into a slave of ${captorKingdom}`
        };
    }
    
    return {
        success: true,
        converted: false,
        love: general.love,
        message: `${general.name} is being enslaved. Love: ${general.love}`
    };
}

/**
 * Checks victory/defeat conditions
 * @param {GameState} gameState - Game state
 * @returns {Object} - { gameOver: boolean, winner: string|null, loser: string|null }
 */
export function checkVictoryConditions(gameState) {
    const playerKingdom = gameState.getPlayerKingdom();
    
    // Check if player lost
    if (playerKingdom.isDefeated()) {
        return {
            gameOver: true,
            winner: null,
            loser: 'player',
            message: 'You have been defeated. Your kingdom has fallen.'
        };
    }
    
    // Check if any AI kingdom lost
    const aiKingdoms = gameState.getAIKingdoms();
    const defeatedKingdoms = aiKingdoms.filter(k => k.isDefeated());
    
    if (defeatedKingdoms.length > 0) {
        // Transfer all generals and provinces to player
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
        
        // Remove defeated kingdoms
        defeatedKingdoms.forEach(kingdom => {
            gameState.kingdoms.delete(kingdom.id);
        });
    }
    
    // Check if player won (all AI kingdoms defeated)
    const remainingAIKingdoms = gameState.getAIKingdoms();
    if (remainingAIKingdoms.length === 0) {
        return {
            gameOver: true,
            winner: 'player',
            loser: null,
            message: 'Victory! You have conquered all kingdoms.'
        };
    }
    
    return {
        gameOver: false,
        winner: null,
        loser: null
    };
}

/**
 * Processes capital actions (rest, date, train)
 * @param {General} general - General performing the action
 * @param {string} actionType - Action type: 'rest', 'date', 'train'
 * @returns {Object} - Action result
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
            return { success: false, error: 'Invalid action', events: [] };
    }
    
    return { success: true, events };
}
