import { GameState } from './gameState.js';
import { processProvinceAttack, processCapitalAction, checkVictoryConditions, processEnslavement } from './combat.js';
import { makeAIDecisions, decideCaptureType } from './ai.js';
import { generateStory } from './aiIntegration.js';
import { createImageElement } from './ui/imageHelper.js';
import { getGeneralImage, getKingdomImage, getProvinceImage } from './config.js';
import { gameData } from './dataLoader.js';

class Game {
    constructor() {
        this.gameState = new GameState();
        this.playerActions = [];
        this.turnEvents = [];
        this.isProcessing = false;
        this.selectedGeneral = null;
        
        this.initializeUI();
    }

    async start() {
        // Cargar todos los datos al inicio
        if (!gameData.loaded) {
            await gameData.load();
        }
        
        // Intentar cargar partida guardada
        if (!this.gameState.loadState()) {
            // Pasar datos cargados a GameState
            this.gameState.initialize(gameData);
        }
        
        await this.renderAll();
        // No generar historia automáticamente - esperar a que el usuario presione el botón
        this.setupHotReload();
    }
    
    setupHotReload() {
        // Conectar a Server-Sent Events para hot reload
        if (typeof EventSource !== 'undefined') {
            const eventSource = new EventSource('/api/hot-reload');
            
            eventSource.onmessage = (event) => {
                if (event.data === 'reload') {
                    console.log('Recargando página por cambios en archivos...');
                    // Recargar después de un pequeño delay para que los archivos se actualicen
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }
            };
            
            eventSource.onerror = (error) => {
                console.warn('Error en hot reload:', error);
                eventSource.close();
            };
        }
    }

    initializeUI() {
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Botones
        document.getElementById('generateInitialStoryBtn').addEventListener('click', () => this.generateInitialStory());
        document.getElementById('nextTurnBtn').addEventListener('click', () => this.nextTurn());
        document.getElementById('saveGameBtn').addEventListener('click', () => this.saveGame());
        document.getElementById('loadGameBtn').addEventListener('click', () => this.loadGame());

        // Modal
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('actionModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    switchTab(tabName) {
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
    }

    async generateInitialStory() {
        const btn = document.getElementById('generateInitialStoryBtn');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Generando...';
        
        this.showLoading('Generando historia inicial...');
        try {
            const story = await generateStory(this.gameState, []);
            this.addToHistory(story);
            // Ocultar el botón después de generar la historia inicial
            btn.style.display = 'none';
        } catch (error) {
            console.error('Error generando historia:', error);
            this.addToHistory('El reino despierta. La aventura comienza...');
            btn.disabled = false;
            btn.textContent = originalText;
            alert('Error al generar la historia. Verifica tu configuración de IA.');
        } finally {
            this.hideLoading();
        }
    }

    async nextTurn() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.showLoading('Procesando turno...');
        
        try {
            // Procesar acciones del jugador
            await this.processPlayerActions();
            
            // Procesar acciones de la IA
            await this.processAIActions();
            
            // Procesar esclavización
            this.processEnslavements();
            
            // Verificar condiciones de victoria
            const victoryCheck = checkVictoryConditions(this.gameState);
            if (victoryCheck.gameOver) {
                this.endGame(victoryCheck);
                return;
            }
            
            // Generar nueva historia
            this.showLoading('Generando historia...');
            const story = await generateStory(this.gameState, this.turnEvents);
            this.addToHistory(story);
            
            // Limpiar acciones y eventos
            this.playerActions = [];
            this.turnEvents = [];
            this.gameState.turn++;
            
            // Actualizar UI
            await this.renderAll();
            
        } catch (error) {
            console.error('Error procesando turno:', error);
            alert('Error procesando el turno: ' + error.message);
        } finally {
            this.hideLoading();
            this.isProcessing = false;
        }
    }

    async processPlayerActions() {
        const playerKingdom = this.gameState.getPlayerKingdom();
        
        for (const action of this.playerActions) {
            const general = this.gameState.getGeneral(action.generalId);
            if (!general || !general.isAvailable()) continue;
            
            if (action.actionType === 'attack' || action.actionType === 'defend') {
                const province = this.gameState.getProvince(action.targetId);
                if (!province) continue;
                
                // Buscar defensora si es ataque
                let defender = null;
                if (action.actionType === 'attack') {
                    defender = this.findDefender(province);
                }
                
                const result = processProvinceAttack(general, province, defender);
                this.turnEvents.push(...result.events);
                
                general.location = province.id;
            } else if (['rest', 'date', 'train'].includes(action.actionType)) {
                const result = processCapitalAction(general, action.actionType);
                this.turnEvents.push(...result.events);
                general.location = 'capital';
            }
        }
    }

    async processAIActions() {
        const aiKingdoms = this.gameState.getAIKingdoms();
        
        for (const kingdom of aiKingdoms) {
            const actions = makeAIDecisions(this.gameState, kingdom.id);
            
            for (const action of actions) {
                const general = this.gameState.getGeneral(action.generalId);
                if (!general || !general.isAvailable()) continue;
                
                if (action.actionType === 'attack' || action.actionType === 'defend') {
                    const province = this.gameState.getProvince(action.targetId);
                    if (!province) continue;
                    
                    let defender = null;
                    if (action.actionType === 'attack') {
                        defender = this.findDefender(province);
                    }
                    
                    const result = processProvinceAttack(general, province, defender);
                    this.turnEvents.push(...result.events);
                    
                    general.location = province.id;
                } else if (['rest', 'date', 'train'].includes(action.actionType)) {
                    const result = processCapitalAction(general, action.actionType);
                    this.turnEvents.push(...result.events);
                    general.location = 'capital';
                }
            }
            
            // Procesar capturas de la IA
            this.processAICaptures(kingdom);
        }
    }

    processAICaptures(kingdom) {
        const capturedGenerals = kingdom.generals.filter(g => g.status === 'captured' && g.captor === kingdom.id);
        
        for (const general of capturedGenerals) {
            const decision = decideCaptureType(general, kingdom.id);
            if (decision === 'enslavement' && general.captureType !== 'enslavement') {
                processEnslavement(general, kingdom.id);
            }
        }
    }

    processEnslavements() {
        const allGenerals = this.gameState.getAllGenerals();
        const enslavedGenerals = allGenerals.filter(g => g.captureType === 'enslavement');
        
        for (const general of enslavedGenerals) {
            const result = general.decreaseLove(10);
            if (result.converted) {
                this.turnEvents.push({
                    type: 'enslavement_conversion',
                    general: general.id,
                    oldKingdom: result.oldKingdom,
                    newKingdom: result.newKingdom
                });
            }
        }
    }

    findDefender(province) {
        const allGenerals = this.gameState.getAllGenerals();
        return allGenerals.find(g => 
            g.location === province.id && 
            g.kingdom === province.kingdom &&
            g.isAvailable()
        );
    }

    endGame(result) {
        this.gameState.gameOver = true;
        this.gameState.winner = result.winner;
        
        let message = result.message || 'El juego ha terminado.';
        if (result.winner === 'player') {
            message = '¡Victoria! Has conquistado todos los reinos.';
        } else if (result.loser === 'player') {
            message = 'Derrota. Tu reino ha caído.';
        }
        
        this.addToHistory(`\n\n=== ${message} ===\n\n`);
        alert(message);
    }

    async renderAll() {
        this.renderKingdoms();
        this.renderGenerals();
        this.renderProvinces();
        this.renderActions();
    }

    renderKingdoms() {
        const container = document.getElementById('kingdomsList');
        container.innerHTML = '';
        
        for (const kingdom of this.gameState.kingdoms.values()) {
            // Obtener datos del reino desde gameData para acceder a theme, description, color
            const kingdomData = gameData.getKingdomById(kingdom.id);
            
            const card = document.createElement('div');
            card.className = `kingdom-card ${kingdom.owner}`;
            
            // Aplicar color del tema si existe
            if (kingdomData?.color) {
                card.style.borderLeftColor = kingdomData.color;
                card.style.borderLeftWidth = '4px';
            }
            
            const generalsCount = kingdom.generals.length;
            const provincesCount = kingdom.provinces.length;
            const availableGenerals = kingdom.getAvailableGenerals().length;
            
            // Obtener imagen del reino
            const kingdomImageUrl = getKingdomImage(kingdom.id);
            const imageElement = createImageElement(
                kingdomImageUrl,
                kingdom.name,
                'kingdom-image',
                { placeholderText: kingdom.name }
            );
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'card-content';
            
            let themeBadge = '';
            if (kingdomData?.theme) {
                themeBadge = `<span class="kingdom-theme" style="background-color: ${kingdomData.color || '#4a9eff'}">${kingdomData.theme}</span>`;
            }
            
            let descriptionText = '';
            if (kingdomData?.description) {
                descriptionText = `<p class="kingdom-description">${kingdomData.description}</p>`;
            }
            
            contentDiv.innerHTML = `
                <div class="kingdom-header">
                    <h4>${kingdom.name}</h4>
                    ${themeBadge}
                </div>
                ${descriptionText}
                <div class="stats">
                    <div class="stat">
                        <span class="stat-label">Generales:</span>
                        <span class="stat-value">${generalsCount} (${availableGenerals} disponibles)</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Provincias:</span>
                        <span class="stat-value">${provincesCount}</span>
                    </div>
                </div>
            `;
            
            card.appendChild(imageElement);
            card.appendChild(contentDiv);
            container.appendChild(card);
        }
    }

    renderGenerals() {
        const playerContainer = document.getElementById('playerGeneralsList');
        const enemyContainer = document.getElementById('enemyGeneralsList');
        
        playerContainer.innerHTML = '';
        enemyContainer.innerHTML = '';
        
        const playerKingdom = this.gameState.getPlayerKingdom();
        const aiKingdoms = this.gameState.getAIKingdoms();
        
        // Generales del jugador
        playerKingdom.generals.forEach(general => {
            const card = this.createGeneralCard(general, true);
            playerContainer.appendChild(card);
        });
        
        // Generales enemigas
        aiKingdoms.forEach(kingdom => {
            kingdom.generals.forEach(general => {
                const card = this.createGeneralCard(general, false);
                enemyContainer.appendChild(card);
            });
        });
    }

    createGeneralCard(general, isPlayer) {
        const card = document.createElement('div');
        card.className = `general-card ${general.status}`;
        if (isPlayer && general.isAvailable()) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => this.selectGeneral(general));
        }
        
        const hpPercent = (general.hp / general.maxHp) * 100;
        const lovePercent = general.love;
        
        let statusText = 'Libre';
        if (general.status === 'captured') statusText = 'Capturada';
        if (general.status === 'slave') statusText = 'Esclava';
        
        // Obtener datos de la general desde gameData para acceder a description
        const generalData = gameData.getGenerals().find(g => g.id === general.id);
        
        // Obtener imagen de la general
        const generalImageUrl = getGeneralImage(general.id);
        const imageElement = createImageElement(
            generalImageUrl,
            general.name,
            'general-image',
            { placeholderText: general.name }
        );
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';
        
        let descriptionText = '';
        if (generalData?.description) {
            descriptionText = `<p class="general-description">${generalData.description}</p>`;
        }
        
        contentDiv.innerHTML = `
            <h4>${general.name}</h4>
            ${descriptionText}
            <div class="stats">
                <div class="stat">
                    <span class="stat-label">HP:</span>
                    <span class="stat-value">${general.hp}/${general.maxHp}</span>
                </div>
                <div class="hp-bar">
                    <div class="hp-bar-fill" style="width: ${hpPercent}%"></div>
                </div>
                <div class="stat">
                    <span class="stat-label">Amor:</span>
                    <span class="stat-value">${general.love}</span>
                </div>
                <div class="love-bar">
                    <div class="love-bar-fill" style="width: ${lovePercent}%"></div>
                </div>
                <div class="stat">
                    <span class="stat-label">Fuerza:</span>
                    <span class="stat-value">${general.strength}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Estado:</span>
                    <span class="stat-value">${statusText}</span>
                </div>
                ${general.location ? `<div class="stat"><span class="stat-label">Ubicación:</span><span class="stat-value">${general.location}</span></div>` : ''}
            </div>
        `;
        
        card.appendChild(imageElement);
        card.appendChild(contentDiv);
        return card;
    }

    renderProvinces() {
        const container = document.getElementById('provincesMap');
        container.innerHTML = '';
        
        for (const kingdom of this.gameState.kingdoms.values()) {
            kingdom.provinces.forEach((province, index) => {
                const card = document.createElement('div');
                card.className = `province-card ${province.isCapital ? 'capital' : ''}`;
                
                const hpIndicators = Array.from({ length: province.maxHp }, (_, i) => 
                    `<div class="hp-indicator ${i < province.hp ? 'active' : ''}"></div>`
                ).join('');
                
                // Obtener imagen de la provincia
                const provinceImageUrl = getProvinceImage(kingdom.id, index);
                const imageElement = createImageElement(
                    provinceImageUrl,
                    province.name,
                    'province-image',
                    { placeholderText: province.name }
                );
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'card-content';
                contentDiv.innerHTML = `
                    <h4>${province.name}</h4>
                    <div class="stats">
                        <div class="stat">
                            <span class="stat-label">Reino:</span>
                            <span class="stat-value">${kingdom.name}</span>
                        </div>
                        <div class="province-hp">
                            <span class="stat-label">HP:</span>
                            <div class="hp-indicators">${hpIndicators}</div>
                        </div>
                    </div>
                `;
                
                card.appendChild(imageElement);
                card.appendChild(contentDiv);
                container.appendChild(card);
            });
        }
    }

    renderActions() {
        const container = document.getElementById('assignedActions');
        container.innerHTML = '';
        
        if (this.playerActions.length === 0) {
            container.innerHTML = '<p>No hay acciones asignadas. Selecciona una general para asignar una acción.</p>';
            return;
        }
        
        this.playerActions.forEach((action, index) => {
            const general = this.gameState.getGeneral(action.generalId);
            if (!general) return;
            
            const item = document.createElement('div');
            item.className = 'action-item';
            
            let targetName = 'Capital';
            if (action.targetId) {
                const province = this.gameState.getProvince(action.targetId);
                if (province) targetName = province.name;
            }
            
            const actionNames = {
                attack: 'Atacar',
                defend: 'Defender',
                rest: 'Descansar',
                date: 'Cita',
                train: 'Entrenar'
            };
            
            item.innerHTML = `
                <div class="action-info">
                    <div class="action-type">${general.name}: ${actionNames[action.actionType]}</div>
                    <div class="action-target">${targetName}</div>
                </div>
                <button onclick="game.removeAction(${index})">Eliminar</button>
            `;
            
            container.appendChild(item);
        });
    }

    selectGeneral(general) {
        if (!general.isAvailable()) {
            alert('Esta general no está disponible');
            return;
        }
        
        this.selectedGeneral = general;
        this.showActionModal(general);
    }

    showActionModal(general) {
        const modal = document.getElementById('actionModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = `Asignar Acción - ${general.name}`;
        
        const kingdom = this.gameState.getKingdom(general.kingdom);
        const capital = kingdom.getCapital();
        const allProvinces = this.gameState.getAllProvinces();
        const ownProvinces = kingdom.provinces;
        const enemyProvinces = allProvinces.filter(p => p.kingdom !== general.kingdom);
        
        let html = '<form class="action-form" id="actionForm">';
        html += '<div class="form-group">';
        html += '<label>Tipo de Acción:</label>';
        html += '<select id="actionType" required>';
        html += '<option value="">Selecciona una acción</option>';
        html += '<option value="attack">Atacar Provincia</option>';
        html += '<option value="defend">Defender Provincia</option>';
        html += '<option value="rest">Descansar (Capital)</option>';
        html += '<option value="date">Cita (Capital)</option>';
        html += '<option value="train">Entrenar (Capital)</option>';
        html += '</select>';
        html += '</div>';
        
        html += '<div class="form-group" id="targetGroup" style="display:none;">';
        html += '<label>Provincia Objetivo:</label>';
        html += '<select id="targetProvince"></select>';
        html += '</div>';
        
        html += '<div class="form-actions">';
        html += '<button type="submit" class="btn btn-primary">Asignar</button>';
        html += '<button type="button" class="btn btn-secondary" onclick="game.closeModal()">Cancelar</button>';
        html += '</div>';
        html += '</form>';
        
        modalBody.innerHTML = html;
        modal.classList.add('active');
        
        // Event listener para el select de acción
        document.getElementById('actionType').addEventListener('change', (e) => {
            const actionType = e.target.value;
            const targetGroup = document.getElementById('targetGroup');
            const targetSelect = document.getElementById('targetProvince');
            
            if (['attack', 'defend'].includes(actionType)) {
                targetGroup.style.display = 'block';
                targetSelect.innerHTML = '';
                
                const provinces = actionType === 'attack' ? enemyProvinces : ownProvinces;
                provinces.forEach(province => {
                    const option = document.createElement('option');
                    option.value = province.id;
                    option.textContent = province.name;
                    targetSelect.appendChild(option);
                });
            } else {
                targetGroup.style.display = 'none';
            }
        });
        
        // Event listener para el formulario
        document.getElementById('actionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.assignAction(general);
        });
    }

    assignAction(general) {
        const actionType = document.getElementById('actionType').value;
        if (!actionType) return;
        
        let targetId = null;
        if (['attack', 'defend'].includes(actionType)) {
            targetId = document.getElementById('targetProvince').value;
            if (!targetId) {
                alert('Selecciona una provincia');
                return;
            }
        } else {
            // Para acciones de capital, usar null
            const kingdom = this.gameState.getKingdom(general.kingdom);
            const capital = kingdom.getCapital();
            if (capital) {
                targetId = capital.id;
            }
        }
        
        const validation = this.gameState.validateAction(general.id, actionType, targetId);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }
        
        // Verificar si ya hay una acción para esta general
        const existingIndex = this.playerActions.findIndex(a => a.generalId === general.id);
        if (existingIndex >= 0) {
            this.playerActions[existingIndex] = { generalId: general.id, actionType, targetId };
        } else {
            this.playerActions.push({ generalId: general.id, actionType, targetId });
        }
        
        this.closeModal();
        this.renderActions();
    }

    removeAction(index) {
        this.playerActions.splice(index, 1);
        this.renderActions();
    }

    closeModal() {
        document.getElementById('actionModal').classList.remove('active');
        this.selectedGeneral = null;
    }

    showLoading(text = 'Cargando...') {
        const modal = document.getElementById('loadingModal');
        document.getElementById('loadingText').textContent = text;
        modal.classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingModal').classList.remove('active');
    }

    addToHistory(text) {
        const container = document.getElementById('historyContent');
        const p = document.createElement('p');
        p.textContent = text;
        container.appendChild(p);
        container.scrollTop = container.scrollHeight;
    }

    saveGame() {
        this.gameState.saveState();
        alert('Partida guardada');
    }

    loadGame() {
        if (this.gameState.loadState()) {
            this.renderAll();
            alert('Partida cargada');
        } else {
            alert('No hay partida guardada');
        }
    }
}

// Inicializar juego cuando el DOM esté listo
let game;
document.addEventListener('DOMContentLoaded', async () => {
    game = new Game();
    await game.start();
    
    // Hacer game disponible globalmente para los event handlers
    window.game = game;
});
