/**
 * ClassicCombat - Lógica de combate para el modo clásico
 * Contiene toda la lógica de combate, capturas y acciones de capital
 */

/**
 * Calculates the result of combat between two generals
 * @param {General} attacker - Attacking general
 * @param {General} defender - Defending general
 * @param {Object} gameRules - Game rules configuration
 * @returns {Object} - { winner: General, loser: General, damage: number }
 */
export function calculateCombat(attacker, defender, gameRules) {
    const baseDamage = gameRules.combatDamageBase;
    const randomDamage = Math.floor(Math.random() * (gameRules.combatDamageRandom + 1));
    const damage = baseDamage + attacker.strength + randomDamage - (defender.strength / 2);
    
    const finalDamage = Math.max(1, Math.floor(damage));
    
    // Attacker receives reduced damage
    const attackerDamage = Math.floor(finalDamage * 0.3);
    attacker.hp = Math.max(0, attacker.hp - attackerDamage);
    const attackerDead = attacker.hp <= 0;
    
    // Defender receives full damage
    defender.hp = Math.max(0, defender.hp - finalDamage);
    const defenderDead = defender.hp <= 0;
    
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
            damage: attackerDamage,
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
                damage: attackerDamage,
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
 * @param {Object} gameRules - Game rules configuration
 * @returns {Object} - Attack result with events
 */
export function processProvinceAttack(attacker, province, defender, gameRules) {
    const events = [];
    
    if (defender) {
        // There is combat
        const combatResult = calculateCombat(attacker, defender, gameRules);
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
            province.hp = Math.max(0, province.hp - 1);
            const provinceDestroyed = province.hp <= 0;
            events.push({
                type: 'province_damage',
                province: province.id,
                damage: 1,
                destroyed: provinceDestroyed
            });
            
            if (provinceDestroyed) {
                province.kingdom = attacker.kingdom;
                province.hp = province.maxHp; // Restore HP when changing owner
                events.push({
                    type: 'province_conquered',
                    province: province.id,
                    newOwner: attacker.kingdom
                });
            }
        }
    } else {
        // No defense, direct attack
        province.hp = Math.max(0, province.hp - 1);
        const provinceDestroyed = province.hp <= 0;
        events.push({
            type: 'province_damage',
            province: province.id,
            damage: 1,
            destroyed: provinceDestroyed
        });
        
        if (provinceDestroyed) {
            province.kingdom = attacker.kingdom;
            province.hp = province.maxHp; // Restore HP when changing owner
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
 * @param {Object} gameRules - Game rules configuration
 * @returns {Object} - Enslavement result
 */
export function processEnslavement(general, captorKingdom, gameRules) {
    if (general.status !== 'captured') {
        return { success: false, error: 'The general is not captured' };
    }
    
    general.captureType = 'enslavement';
    general.location = 'capital';
    
    // Decrease love
    const loveDecrease = gameRules.loveDecreaseOnEnslavement;
    general.love = Math.max(0, general.love - loveDecrease);
    
    // Check if converted
    if (general.love === 0 && general.status === 'captured') {
        general.status = 'slave';
        const oldKingdom = general.kingdom;
        general.kingdom = captorKingdom;
        return {
            success: true,
            converted: true,
            oldKingdom: oldKingdom,
            newKingdom: captorKingdom,
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
 * Processes capital actions (rest, date, train)
 * @param {General} general - General performing the action
 * @param {string} actionType - Action type: 'rest', 'date', 'train'
 * @param {Object} gameRules - Game rules configuration
 * @returns {Object} - Action result with events
 */
export function processCapitalAction(general, actionType, gameRules) {
    const events = [];
    
    switch (actionType) {
        case 'rest':
            const healed = Math.min(gameRules.hpRecoveryOnRest, general.maxHp - general.hp);
            general.hp = Math.min(general.maxHp, general.hp + gameRules.hpRecoveryOnRest);
            events.push({
                type: 'rest',
                general: general.id,
                hpRecovered: healed,
                newHp: general.hp
            });
            break;
            
        case 'date':
            const loveIncrease = gameRules.loveIncreaseOnDate;
            general.love = Math.min(100, general.love + loveIncrease);
            events.push({
                type: 'date',
                general: general.id,
                loveIncreased: loveIncrease,
                newLove: general.love
            });
            break;
            
        case 'train':
            const strengthIncrease = gameRules.strengthIncreaseOnTrain;
            general.strength += strengthIncrease;
            events.push({
                type: 'train',
                general: general.id,
                strengthIncreased: strengthIncrease,
                newStrength: general.strength
            });
            break;
            
        default:
            return { success: false, error: 'Invalid action', events: [] };
    }
    
    return { success: true, events };
}

/**
 * Checks victory/defeat conditions
 * @param {ClassicGameState} gameState - Game state
 * @returns {Object} - { gameOver: boolean, winner: string|null, loser: string|null }
 */
export function checkVictoryConditions(gameState) {
    const playerKingdom = gameState.getPlayerKingdom();
    
    // Helper to check if kingdom is defeated
    const isKingdomDefeated = (kingdom) => {
        const hasGenerals = kingdom.generals.some(g => g.hp > 0);
        const capital = kingdom.provinces.find(p => p.isCapital);
        const capitalConquered = capital && capital.hp <= 0;
        return !hasGenerals || capitalConquered;
    };
    
    // Check if player lost
    if (isKingdomDefeated(playerKingdom)) {
        return {
            gameOver: true,
            winner: null,
            loser: 'player',
            message: 'You have been defeated. Your kingdom has fallen.'
        };
    }
    
    // Check if any AI kingdom lost
    const aiKingdoms = gameState.getAIKingdoms();
    const defeatedKingdoms = aiKingdoms.filter(k => isKingdomDefeated(k));
    
    if (defeatedKingdoms.length > 0) {
        // Transfer all generals and provinces to player
        defeatedKingdoms.forEach(kingdom => {
            kingdom.generals.forEach(general => {
                general.kingdom = playerKingdom.id;
                general.status = 'free';
                general.captor = null;
                general.captureType = null;
                playerKingdom.addGeneral(general);
            });
            
            kingdom.provinces.forEach(province => {
                province.kingdom = playerKingdom.id;
                province.hp = province.maxHp; // Restore HP when changing owner
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
