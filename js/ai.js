/**
 * Sistema de IA para tomar decisiones enemigas
 * Prioridades:
 * 1. Secuestrar generales (atacar generales enemigas)
 * 2. Atacar/reconquistar provincias
 * 3. Defender provincias propias
 */

/**
 * Genera decisiones para un reino AI
 * @param {GameState} gameState - Estado del juego
 * @param {string} kingdomId - ID del reino AI
 * @returns {Array} - Array de acciones asignadas
 */
export function makeAIDecisions(gameState, kingdomId) {
    const kingdom = gameState.getKingdom(kingdomId);
    if (!kingdom || kingdom.owner !== 'ai') {
        return [];
    }
    
    const availableGenerals = kingdom.getAvailableGenerals();
    if (availableGenerals.length === 0) {
        return [];
    }
    
    const actions = [];
    const usedGenerals = new Set();
    
    // Prioridad 1: Secuestrar generales enemigas
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
                reason: `Atacar a ${target.name} para capturarla`
            });
            usedGenerals.add(general.id);
        }
    }
    
    // Prioridad 2: Atacar provincias enemigas vulnerables
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
                reason: `Atacar provincia ${province.name}`
            });
            usedGenerals.add(general.id);
        }
    }
    
    // Prioridad 3: Reconquistar provincias propias perdidas
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
                reason: `Reconquistar ${province.name}`
            });
            usedGenerals.add(general.id);
        }
    }
    
    // Prioridad 4: Defender provincias propias amenazadas
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
                reason: `Defender ${province.name}`
            });
            usedGenerals.add(general.id);
        }
    }
    
    // Si quedan generales disponibles, enviarlas a la capital para recuperar
    const remainingGenerals = availableGenerals.filter(g => !usedGenerals.has(g.id));
    for (const general of remainingGenerals) {
        if (general.hp < general.maxHp * 0.5) {
            // Si tiene menos del 50% HP, descansar
            actions.push({
                generalId: general.id,
                actionType: 'rest',
                targetId: null,
                priority: 5,
                reason: 'Recuperar HP'
            });
        } else if (general.strength < 15) {
            // Si tiene poca fuerza, entrenar
            actions.push({
                generalId: general.id,
                actionType: 'train',
                targetId: null,
                priority: 5,
                reason: 'Entrenar'
            });
        }
    }
    
    return actions;
}

/**
 * Encuentra generales enemigas vulnerables para capturar
 */
function findVulnerableEnemyGenerals(gameState, kingdomId) {
    const targets = [];
    const allGenerals = gameState.getAllGenerals();
    
    for (const general of allGenerals) {
        if (general.kingdom === kingdomId) continue; // No atacar propias
        if (!general.isAvailable()) continue; // No atacar capturadas
        
        const province = general.location ? gameState.getProvince(general.location) : null;
        if (!province) continue;
        
        // Priorizar generales con menos HP o en provincias vulnerables
        const vulnerability = (100 - general.hp) + (province.hp <= 1 ? 50 : 0);
        
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
    
    // Ordenar por vulnerabilidad
    return targets.sort((a, b) => b.vulnerability - a.vulnerability).slice(0, 3);
}

/**
 * Encuentra provincias enemigas vulnerables
 */
function findVulnerableProvinces(gameState, kingdomId) {
    const allProvinces = gameState.getAllProvinces();
    const targets = [];
    
    for (const province of allProvinces) {
        if (province.kingdom === kingdomId) continue; // No atacar propias
        if (province.isCapital) {
            // Priorizar capitales
            targets.push({
                ...province,
                priority: province.hp + 100
            });
        } else {
            targets.push({
                ...province,
                priority: province.hp
            });
        }
    }
    
    // Ordenar por prioridad (menos HP = más vulnerable)
    return targets.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

/**
 * Encuentra provincias propias que fueron perdidas
 */
function findLostProvinces(gameState, kingdomId) {
    const kingdom = gameState.getKingdom(kingdomId);
    const allProvinces = gameState.getAllProvinces();
    
    // Provincias que originalmente pertenecían a este reino pero ahora no
    return allProvinces.filter(p => {
        // Verificar si el nombre sugiere que era de este reino
        const nameMatch = p.name.toLowerCase().includes(kingdom.name.toLowerCase().split(' ')[0]);
        return p.kingdom !== kingdomId && nameMatch;
    }).slice(0, 3);
}

/**
 * Encuentra provincias propias amenazadas (con poco HP o siendo atacadas)
 */
function findThreatenedProvinces(gameState, kingdomId) {
    const kingdom = gameState.getKingdom(kingdomId);
    return kingdom.provinces
        .filter(p => p.hp < p.maxHp)
        .sort((a, b) => a.hp - b.hp)
        .slice(0, 3);
}

/**
 * Encuentra la mejor general para un objetivo específico
 */
function findBestGeneralForTarget(availableGenerals, target, actionType) {
    if (availableGenerals.length === 0) return null;
    
    // Filtrar generales que ya tienen una acción asignada
    const candidates = availableGenerals.filter(g => g.hp > 0);
    if (candidates.length === 0) return null;
    
    // Para captura, priorizar generales fuertes
    if (actionType === 'capture') {
        return candidates.sort((a, b) => {
            const scoreA = a.strength + (a.hp / 10);
            const scoreB = b.strength + (b.hp / 10);
            return scoreB - scoreA;
        })[0];
    }
    
    // Para ataque/defensa, balancear fuerza y HP
    return candidates.sort((a, b) => {
        const scoreA = a.strength * 0.6 + (a.hp / 10) * 0.4;
        const scoreB = b.strength * 0.6 + (b.hp / 10) * 0.4;
        return scoreB - scoreA;
    })[0];
}

/**
 * Decide qué hacer con una general capturada
 * @param {General} capturedGeneral - General capturada
 * @param {string} captorKingdomId - ID del reino captor
 * @returns {string} - 'isolation' o 'enslavement'
 */
export function decideCaptureType(capturedGeneral, captorKingdomId) {
    // La IA prefiere esclavizar si la general tiene mucho amor (más difícil de convertir)
    // O poner en aislamiento si tiene poco amor (más fácil de convertir después)
    if (capturedGeneral.love > 30) {
        return 'enslavement'; // Esclavizar para reducir amor más rápido
    } else {
        return 'isolation'; // Aislamiento para mantenerla segura
    }
}
