/**
 * AI system for enemy decision making
 * Priorities:
 * 1. Capture generals (attack enemy generals)
 * 2. Attack/reconquer provinces
 * 3. Defend own provinces
 */

/**
 * Generates decisions for an AI kingdom
 * @param {GameState} gameState - Game state
 * @param {string} kingdomId - AI kingdom ID
 * @returns {Array} - Array of assigned actions
 */
export function makeAIDecisions(gameState, kingdomId) {
    const kingdom = gameState.getKingdom(kingdomId);
    if (!kingdom || kingdom.owner !== 'ai') {
        return [];
    }
    
    // Helper to check if general is available
    const isGeneralAvailable = (general) => {
        return general.status === 'free' && general.hp > 0;
    };
    
    const availableGenerals = kingdom.generals.filter(g => isGeneralAvailable(g));
    if (availableGenerals.length === 0) {
        return [];
    }
    
    const actions = [];
    const usedGenerals = new Set();
    
    // Priority 1: Capture enemy generals
    const enemyGenerals = findVulnerableEnemyGenerals(gameState, kingdomId);
    for (const target of enemyGenerals) {
        if (usedGenerals.size >= availableGenerals.length) break;
        
        const general = findBestGeneralForTarget(availableGenerals, target, 'capture');
        if (general && !usedGenerals.has(general.id)) {
            actions.push({
                generalId: general.id,
                actionType: 'attack',
                targetId: target.location || target.provinceId,
                priority: 1,
                reason: `Attack ${target.name} to capture her`
            });
            usedGenerals.add(general.id);
        }
    }
    
    // Priority 2: Attack vulnerable enemy provinces
    const vulnerableProvinces = findVulnerableProvinces(gameState, kingdomId);
    for (const province of vulnerableProvinces) {
        if (usedGenerals.size >= availableGenerals.length) break;
        
        const general = findBestGeneralForTarget(availableGenerals, province, 'attack');
        if (general && !usedGenerals.has(general.id)) {
            actions.push({
                generalId: general.id,
                actionType: 'attack',
                targetId: province.id,
                priority: 2,
                reason: `Attack province ${province.name}`
            });
            usedGenerals.add(general.id);
        }
    }
    
    // Priority 3: Reconquer lost own provinces
    const lostProvinces = findLostProvinces(gameState, kingdomId);
    for (const province of lostProvinces) {
        if (usedGenerals.size >= availableGenerals.length) break;
        
        const general = findBestGeneralForTarget(availableGenerals, province, 'reconquer');
        if (general && !usedGenerals.has(general.id)) {
            actions.push({
                generalId: general.id,
                actionType: 'attack',
                targetId: province.id,
                priority: 3,
                reason: `Reconquer ${province.name}`
            });
            usedGenerals.add(general.id);
        }
    }
    
    // Priority 4: Defend threatened own provinces
    const threatenedProvinces = findThreatenedProvinces(gameState, kingdomId);
    for (const province of threatenedProvinces) {
        if (usedGenerals.size >= availableGenerals.length) break;
        
        const general = findBestGeneralForTarget(availableGenerals, province, 'defend');
        if (general && !usedGenerals.has(general.id)) {
            actions.push({
                generalId: general.id,
                actionType: 'defend',
                targetId: province.id,
                priority: 4,
                reason: `Defend ${province.name}`
            });
            usedGenerals.add(general.id);
        }
    }
    
    // If generals remain available, send them to capital to recover
    const remainingGenerals = availableGenerals.filter(g => !usedGenerals.has(g.id));
    for (const general of remainingGenerals) {
        if (general.hp < general.maxHp * 0.5) {
            // If has less than 50% HP, rest
            actions.push({
                generalId: general.id,
                actionType: 'rest',
                targetId: null,
                priority: 5,
                reason: 'Recover HP'
            });
        } else if (general.strength < 15) {
            // If has low strength, train
            actions.push({
                generalId: general.id,
                actionType: 'train',
                targetId: null,
                priority: 5,
                reason: 'Train'
            });
        }
    }
    
    return actions;
}

/**
 * Find vulnerable enemy generals to capture
 * Enemies act independently - each AI kingdom only attacks generals that are not from their kingdom
 * No coordination between AI kingdoms
 */
function findVulnerableEnemyGenerals(gameState, kingdomId) {
    const targets = [];
    const allGenerals = gameState.getAllGenerals();
    const playerKingdom = gameState.getPlayerKingdom();
    
    for (const general of allGenerals) {
        if (general.kingdom === kingdomId) continue; // Don't attack own
        if (!general.isAvailable()) continue; // Don't attack captured
        
        const province = general.location ? gameState.getProvince(general.location) : null;
        if (!province) continue;
        
        // Prioritize player generals over other AI kingdoms
        const generalKingdom = gameState.getKingdom(general.kingdom);
        const isPlayerGeneral = generalKingdom && generalKingdom.owner === 'player';
        const priorityBonus = isPlayerGeneral ? 30 : 0; // Prioritize attacking player
        
        // Prioritize generals with less HP or in vulnerable provinces
        const vulnerability = (100 - general.hp) + (province.hp <= 1 ? 50 : 0) + priorityBonus;
        
        targets.push({
            general: general,
            name: general.name,
            id: general.id,
            location: general.location,
            provinceId: general.location,
            vulnerability: vulnerability,
            hp: general.hp,
            strength: general.strength
        });
    }
    
    // Sort by vulnerability
    return targets.sort((a, b) => b.vulnerability - a.vulnerability).slice(0, 3);
}

/**
 * Find vulnerable enemy provinces
 * Enemies act independently - each AI kingdom attacks provinces that are not from their kingdom
 * Prioritizes player provinces over other AI kingdoms, but can attack anyone
 */
function findVulnerableProvinces(gameState, kingdomId) {
    const allProvinces = gameState.getAllProvinces();
    const targets = [];
    const playerKingdom = gameState.getPlayerKingdom();
    
    for (const province of allProvinces) {
        if (province.kingdom === kingdomId) continue; // Don't attack own
        
        // Prioritize player provinces over other AI kingdoms
        const provinceKingdom = gameState.getKingdom(province.kingdom);
        const isPlayerProvince = provinceKingdom && provinceKingdom.owner === 'player';
        const playerBonus = isPlayerProvince ? 50 : 0; // Prioritize attacking player
        
        if (province.isCapital) {
            // Prioritize capitals
            targets.push({
                ...province,
                priority: province.hp + 100 - playerBonus
            });
        } else {
            targets.push({
                ...province,
                priority: province.hp - playerBonus
            });
        }
    }
    
    // Sort by priority (less HP = more vulnerable, prioritize player)
    return targets.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

/**
 * Find own provinces that were lost
 */
function findLostProvinces(gameState, kingdomId) {
    const kingdom = gameState.getKingdom(kingdomId);
    const allProvinces = gameState.getAllProvinces();
    
    // Provinces that originally belonged to this kingdom but now don't
    return allProvinces.filter(p => {
        // Check if name suggests it was from this kingdom
        const nameMatch = p.name.toLowerCase().includes(kingdom.name.toLowerCase().split(' ')[0]);
        return p.kingdom !== kingdomId && nameMatch;
    }).slice(0, 3);
}

/**
 * Find threatened own provinces (with low HP or being attacked)
 */
function findThreatenedProvinces(gameState, kingdomId) {
    const kingdom = gameState.getKingdom(kingdomId);
    return kingdom.provinces
        .filter(p => p.hp < p.maxHp)
        .sort((a, b) => a.hp - b.hp)
        .slice(0, 3);
}

/**
 * Find the best general for a specific target
 */
function findBestGeneralForTarget(availableGenerals, target, actionType) {
    if (availableGenerals.length === 0) return null;
    
    // Filter generals that already have an action assigned
    const candidates = availableGenerals.filter(g => g.hp > 0);
    if (candidates.length === 0) return null;
    
    // For capture, prioritize strong generals
    if (actionType === 'capture') {
        return candidates.sort((a, b) => {
            const scoreA = a.strength + (a.hp / 10);
            const scoreB = b.strength + (b.hp / 10);
            return scoreB - scoreA;
        })[0];
    }
    
    // For attack/defense, balance strength and HP
    return candidates.sort((a, b) => {
        const scoreA = a.strength * 0.6 + (a.hp / 10) * 0.4;
        const scoreB = b.strength * 0.6 + (b.hp / 10) * 0.4;
        return scoreB - scoreA;
    })[0];
}

/**
 * Decide what to do with a captured general
 * @param {General} capturedGeneral - Captured general
 * @param {string} captorKingdomId - Captor kingdom ID
 * @returns {string} - 'isolation' or 'enslavement'
 */
export function decideCaptureType(capturedGeneral, captorKingdomId) {
    // AI prefers to enslave if general has high love (harder to convert)
    // Or put in isolation if has low love (easier to convert later)
    if (capturedGeneral.love > 30) {
        return 'enslavement'; // Enslave to reduce love faster
    } else {
        return 'isolation'; // Isolation to keep her safe
    }
}
