import { createGameMode } from './gameModes/index.js';
import { generateStory } from './aiIntegration.js';
import { createImageElement } from './ui/imageHelper.js';
import { getGeneralImage, getKingdomImage, getProvinceImage } from './config.js';
import { gameData } from './dataLoader.js';
import { t } from './i18n-classic.js';

class Game {
    /**
     * @param {Object} [options]
     * @param {HTMLElement} [options.rootElement] - Root DOM element containing the game UI (title bar, tabs, modals). When provided, all getElementById/querySelector are scoped to this root. Omit for legacy full-document behavior.
     */
    constructor(options = {}) {
        this.root = options.rootElement ?? document.body;
        this.gameMode = null; // Will be initialized in initializeGame()
        this.currentGameModeId = null; // ID del modo de juego actual
        this.playerActions = [];
        this.turnEvents = [];
        this.isProcessing = false;
        this.selectedGeneral = null;

        this.getEl = (id) => this.root.querySelector?.('#' + id) ?? document.getElementById?.(id);
        this.getAll = (sel) => this.root.querySelectorAll?.(sel) ?? document.querySelectorAll?.(sel) ?? [];

        this.initializeUI();
    }

    /**
     * Inicializa el juego con un modo específico
     * @param {string} gameModeId - ID del modo de juego a inicializar
     */
    async initializeGame(gameModeId = 'classic') {
        this.currentGameModeId = gameModeId;
        
        // Load all data at start
        if (!gameData.loaded) {
            await gameData.load();
        }
        
        // Create game mode
        this.gameMode = createGameMode(gameModeId, gameData);
        
        // Try to load saved game
        const saved = localStorage.getItem('ntrAdvGameState');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                // Only load if the saved game is for the same mode
                if (state.gameMode === gameModeId && this.gameMode.deserializeState(state)) {
                    // Successfully loaded saved game
                } else if (state.gameMode !== gameModeId) {
                    // Different mode, initialize fresh
                    this.gameMode.initialize(gameData);
                } else {
                    // Same mode but deserialization failed, initialize fresh
                    this.gameMode.initialize(gameData);
                }
            } catch (e) {
                console.error('Error loading saved game:', e);
                this.gameMode.initialize(gameData);
            }
        } else {
            // Initialize fresh game
            this.gameMode.initialize(gameData);
        }
        
        await this.renderAll();
        // Don't generate story automatically - wait for user to press button
        this.setupHotReload();
        this.setupRouting();
    }

    /**
     * Método start() mantenido para compatibilidad
     * @deprecated Use initializeGame() instead
     */
    async start() {
        await this.initializeGame('classic');
    }
    
    setupHotReload() {
        // Connect to Server-Sent Events for hot reload
        if (typeof EventSource !== 'undefined') {
            const eventSource = new EventSource('/api/hot-reload');
            
            eventSource.onmessage = (event) => {
                if (event.data === 'reload') {
                    console.log('Reloading page due to file changes...');
                    // Reload after a small delay for files to update
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }
            };
            
            eventSource.onerror = (error) => {
                // Silent error - server may not have hot-reload enabled
                // Just close connection without showing error in console
                eventSource.close();
            };
        }
    }

    initializeUI() {
        // Tabs
        this.getAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Botones
        this.getEl('generateInitialStoryBtn')?.addEventListener('click', () => this.generateInitialStory());
        this.getEl('nextTurnBtn')?.addEventListener('click', () => this.nextTurn());
        this.getEl('saveGameBtn')?.addEventListener('click', () => this.saveGame());
        this.getEl('loadGameBtn')?.addEventListener('click', () => this.loadGame());

        // Modal
        this.getAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    if (modal.id === 'kingdomDetailModal') {
                        this.closeKingdomModal();
                    } else if (modal.id === 'generalDetailModal') {
                        this.closeGeneralModal();
                    } else if (modal.id === 'provinceDetailModal') {
                        this.closeProvinceModal();
                    } else {
                        this.closeModal();
                    }
                }
            });
        });
        
        this._boundWindowClick = (e) => {
            const actionModal = this.getEl('actionModal');
            const kingdomModal = this.getEl('kingdomDetailModal');
            const generalModal = this.getEl('generalDetailModal');
            const provinceModal = this.getEl('provinceDetailModal');
            if (e.target === actionModal) {
                this.closeModal();
            } else if (e.target === kingdomModal) {
                this.closeKingdomModal();
            } else if (e.target === generalModal) {
                this.closeGeneralModal();
            } else if (e.target === provinceModal) {
                this.closeProvinceModal();
            }
        };
        window.addEventListener('click', this._boundWindowClick);
    }
    
    setupRouting() {
        // Handle route changes
        this._boundPopState = () => this.handleRouteChange();
        window.addEventListener('popstate', this._boundPopState);
        
        // Handle initial route
        this.handleRouteChange();
    }

    /**
     * Remove window listeners. Call when unmounting the game (e.g. when leaving Classic app in React shell).
     */
    destroy() {
        if (this._boundWindowClick) {
            window.removeEventListener('click', this._boundWindowClick);
            this._boundWindowClick = null;
        }
        if (this._boundPopState) {
            window.removeEventListener('popstate', this._boundPopState);
            this._boundPopState = null;
        }
    }
    
    handleRouteChange() {
        const path = window.location.pathname;
        
        // Check if it's /generals/:id
        const generalMatch = path.match(/^\/generals\/(.+)$/);
        if (generalMatch) {
            const generalId = generalMatch[1];
            const general = this.gameMode.getGeneral(generalId);
            if (general) {
                // Switch to generals tab if not active
                this.switchTab('generals');
                // Wait a moment for render to finish
                setTimeout(() => {
                    // Show general details
                    this.showGeneralDetail(generalId);
                }, 100);
                return;
            }
        }
        
        // Check if it's /kingdoms/:id
        const kingdomMatch = path.match(/^\/kingdoms\/(.+)$/);
        if (kingdomMatch) {
            const kingdomId = kingdomMatch[1];
            const kingdom = this.gameMode.getKingdom(kingdomId);
            if (kingdom) {
                // Switch to kingdoms tab if not active
                this.switchTab('kingdoms');
                // Wait a moment for render to finish
                setTimeout(() => {
                    // Show kingdom details
                    this.showKingdomDetail(kingdomId);
                }, 100);
                return;
            }
        }
        
        // Check if it's /province/:id
        const provinceMatch = path.match(/^\/province\/(.+)$/);
        if (provinceMatch) {
            const provinceId = provinceMatch[1];
            const province = this.gameMode.getProvince(provinceId);
            if (province) {
                // Switch to provinces tab if not active
                this.switchTab('provinces');
                // Wait a moment for render to finish
                setTimeout(() => {
                    // Show province details
                    this.showProvinceDetail(provinceId);
                }, 100);
                return;
            }
        }
        
        // If no valid route, close modals if open
        const kingdomModal = this.getEl('kingdomDetailModal');
        const generalModal = this.getEl('generalDetailModal');
        const provinceModal = this.getEl('provinceDetailModal');
        if (kingdomModal && kingdomModal.classList.contains('active')) {
            this.closeKingdomModal();
        }
        if (generalModal && generalModal.classList.contains('active')) {
            this.closeGeneralModal();
        }
        if (provinceModal && provinceModal.classList.contains('active')) {
            this.closeProvinceModal();
        }
    }
    
    showKingdomDetail(kingdomId) {
        const kingdom = this.gameMode.getKingdom(kingdomId);
        if (!kingdom) {
            console.error('Kingdom not found:', kingdomId);
            // Clear route if kingdom doesn't exist
            if (window.location.pathname.startsWith('/kingdoms/')) {
                window.history.pushState(null, '', '/');
            }
            return;
        }
        
        // Update URL with /kingdoms/
        window.history.pushState(null, '', `/kingdoms/${kingdomId}`);
        
        const kingdomData = gameData.getKingdomById(kingdomId);
        if (!kingdomData) {
            console.error('Kingdom data not found:', kingdomId);
            return;
        }
        
        const modal = this.getEl('kingdomDetailModal');
        const content = this.getEl('kingdomDetailContent');
        
        const generalsCount = kingdom.generals.length;
        const provincesCount = kingdom.provinces.length;
        const availableGenerals = this.gameMode.getAvailableGenerals(kingdom).length;
        
        // Get kingdom image
        const kingdomImageUrl = getKingdomImage(kingdomId);
        
        // Determine label based on whether it's ally or enemy
        const ownerLabel = kingdom.owner === 'player' ? t('classic.ally') : t('classic.enemy');
        
        // Create provinces list
        let provincesList = '';
        if (kingdom.provinces.length > 0) {
            provincesList = `<div class="kingdom-provinces-list">
                <h5>${t('classic.provincesCount')} (${provincesCount}):</h5>
                <ul class="provinces-list-items">`;
            kingdom.provinces.forEach(province => {
                provincesList += `<li class="province-list-item">${province.name}</li>`;
            });
            provincesList += `</ul></div>`;
        }
        
        content.innerHTML = `
            <div class="kingdom-detail-header">
                <h2>${kingdom.name}</h2>
                <div class="kingdom-detail-badges">
                    ${kingdomData.theme ? `<span class="kingdom-theme">${kingdomData.theme}</span>` : ''}
                    <span class="kingdom-owner-badge">${ownerLabel}</span>
                </div>
            </div>
            
            <div class="kingdom-detail-image" id="kingdomDetailImageContainer">
            </div>
            
            <div class="kingdom-detail-description">
                <p>${kingdomData.description || t('classic.noDescription')}</p>
            </div>
            
            <div class="kingdom-detail-stats">
                <h3>${t('classic.statistics')}</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">${t('classic.generalsLabel')}</span>
                        <span class="stat-value">${generalsCount} (${availableGenerals} ${t('classic.available')})</span>
                    </div>
                </div>
            </div>
            
            ${provincesList}
            
            <div class="kingdom-detail-sections">
                <div class="detail-section">
                    <h3>${t('dataLibrary.architecture')}</h3>
                    <p>${kingdomData.architecturalStyle || t('classic.noInfoAvailable')}</p>
                </div>
                
                <div class="detail-section">
                    <h3>${t('dataLibrary.biome')}</h3>
                    <p>${kingdomData.biome || t('classic.noInfoAvailable')}</p>
                </div>
                
                <div class="detail-section">
                    <h3>${t('dataLibrary.governmentType')}</h3>
                    <p>${kingdomData.governmentType || t('classic.noInfoAvailable')}</p>
                </div>
                
                <div class="detail-section">
                    <h3>${t('dataLibrary.society')}</h3>
                    <p>${kingdomData.socialDescription || t('classic.noInfoAvailable')}</p>
                </div>
            </div>
        `;
        
        // Agregar imagen después de crear el contenido
        const imageContainer = this.getEl('kingdomDetailImageContainer');
        const imageElement = createImageElement(
            kingdomImageUrl,
            kingdom.name,
            'kingdom-detail-image',
            { placeholderText: kingdom.name }
        );
        imageContainer?.appendChild(imageElement);
        
        modal.classList.add('active');
    }
    
    closeKingdomModal() {
        const modal = this.getEl('kingdomDetailModal');
        modal.classList.remove('active');
        // Clear route if modal is closed
        if (window.location.pathname.startsWith('/kingdoms/')) {
            window.history.pushState(null, '', '/');
        }
    }
    
    showGeneralDetail(generalId) {
        const general = this.gameMode.getGeneral(generalId);
        if (!general) {
            console.error('General not found:', generalId);
            // Clear route if general doesn't exist
            if (window.location.pathname.startsWith('/generals/')) {
                window.history.pushState(null, '', '/');
            }
            return;
        }
        
        // Update URL with /generals/
        window.history.pushState(null, '', `/generals/${generalId}`);
        
        const generalData = gameData.getGenerals().find(g => g.id === generalId);
        if (!generalData) {
            console.error('General data not found:', generalId);
            return;
        }
        
        const modal = this.getEl('generalDetailModal');
        const content = this.getEl('generalDetailContent');
        
        const hpPercent = (general.hp / general.maxHp) * 100;
        const lovePercent = general.love;
        
        let statusText = t('classic.free');
        let statusClass = '';
        if (general.status === 'captured') {
            statusText = t('classic.captured');
            statusClass = 'captured';
        }
        if (general.status === 'slave') {
            statusText = t('classic.slave');
            statusClass = 'slave';
        }
        
        const kingdom = this.gameMode.getKingdom(general.kingdom);
        const isPlayerGeneral = kingdom.owner === 'player';
        
        // Get general image
        const generalImageUrl = getGeneralImage(generalId);
        
        // Determine border color based on whether it's ally or enemy
        const borderColor = isPlayerGeneral ? '#4ade80' : '#ff4a4a';
        const ownerLabel = isPlayerGeneral ? t('classic.ally') : t('classic.enemy');
        
        let assignActionButton = '';
        if (isPlayerGeneral && this.gameMode.isGeneralAvailable(general)) {
            assignActionButton = `
                <div class="general-detail-actions">
                    <button class="btn btn-primary" id="assignActionBtn">${t('classic.assignActionBtn')}</button>
                </div>
            `;
        }
        
        content.innerHTML = `
            <div class="general-detail-header" style="border-left: 4px solid ${borderColor};">
                <h2>${general.name}</h2>
                <div class="kingdom-detail-badges">
                    <span class="general-status-badge ${statusClass}">${statusText}</span>
                    <span class="kingdom-owner-badge" style="background-color: ${borderColor};">${ownerLabel}</span>
                </div>
            </div>
            
            <div class="general-detail-content-wrapper">
                <div class="general-detail-image-container">
                    <div class="general-detail-image" id="generalDetailImageContainer">
                    </div>
                    ${assignActionButton}
                </div>
                
                <div class="general-detail-data">
                    <div class="kingdom-detail-stats">
                        <h3>${t('classic.statistics')}</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">${t('dataLibrary.hp')}</span>
                                <span class="stat-value">${general.hp}/${general.maxHp}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">${t('dataLibrary.love')}</span>
                                <span class="stat-value">${general.love}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">${t('dataLibrary.strength')}</span>
                                <span class="stat-value">${general.strength}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">${t('classic.kingdom')}</span>
                                <span class="stat-value">${kingdom.name}</span>
                            </div>
                            ${general.location ? `
                            <div class="stat-item">
                                <span class="stat-label">${t('classic.location')}</span>
                                <span class="stat-value">${general.location}</span>
                            </div>
                            ` : ''}
                        </div>
                        <div style="margin-top: 15px;">
                            <div class="stat">
                                <span class="stat-label">${t('dataLibrary.hp')}</span>
                                <span class="stat-value">${general.hp}/${general.maxHp}</span>
                            </div>
                            <div class="hp-bar">
                                <div class="hp-bar-fill" style="width: ${hpPercent}%"></div>
                            </div>
                            <div class="stat" style="margin-top: 10px;">
                                <span class="stat-label">${t('dataLibrary.love')}</span>
                                <span class="stat-value">${general.love}</span>
                            </div>
                            <div class="love-bar">
                                <div class="love-bar-fill" style="width: ${lovePercent}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    ${generalData.description ? `
                    <div class="kingdom-detail-description">
                        <p>${generalData.description}</p>
                    </div>
                    ` : ''}
                    
                    <div class="kingdom-detail-sections">
                        ${generalData.personality ? `
                        <div class="detail-section">
                            <h3>${t('dataLibrary.personality')}</h3>
                            <p>${generalData.personality}</p>
                        </div>
                        ` : ''}
                        
                        ${generalData.physicalAppearance ? `
                        <div class="detail-section">
                            <h3>${t('dataLibrary.physicalAppearance')}</h3>
                            <p>${generalData.physicalAppearance}</p>
                        </div>
                        ` : ''}
                        
                        ${generalData.additionalData ? `
                        <div class="detail-section">
                            <h3>${t('dataLibrary.additionalInfo')}</h3>
                            <p><strong>${t('dataLibrary.age')}</strong> ${generalData.additionalData.age || 'N/A'}</p>
                            <p><strong>${t('dataLibrary.specialty')}</strong> ${generalData.additionalData.specialty || 'N/A'}</p>
                            <p><strong>${t('dataLibrary.favoriteWeapon')}</strong> ${generalData.additionalData.favoriteWeapon || 'N/A'}</p>
                            ${generalData.additionalData.background ? `<p><strong>${t('dataLibrary.background')}</strong> ${generalData.additionalData.background}</p>` : ''}
                        </div>
                        ` : ''}
                    </div>
                    
                    ${assignActionButton}
                </div>
            </div>
        `;
        
        // Add image after creating content
        const imageContainer = this.getEl('generalDetailImageContainer');
        const imageElement = createImageElement(
            generalImageUrl,
            general.name,
            'general-detail-image',
            { placeholderText: general.name }
        );
        imageContainer?.appendChild(imageElement);
        
        // Add event listener for assign action button
        if (assignActionButton) {
            const assignBtn = this.getEl('assignActionBtn');
            assignBtn.addEventListener('click', () => {
                this.closeGeneralModal();
                this.selectGeneral(general);
            });
        }
        
        modal.classList.add('active');
    }
    
    closeGeneralModal() {
        const modal = this.getEl('generalDetailModal');
        modal.classList.remove('active');
        // Clear route if modal is closed
        if (window.location.pathname.startsWith('/generals/')) {
            window.history.pushState(null, '', '/');
        }
    }
    
    getGeneralsInProvince(provinceId) {
        return this.gameMode.getGeneralsAtProvince(provinceId);
    }
    
    isEnemyProvince(provinceId) {
        const province = this.gameMode.getProvince(provinceId);
        if (!province) return false;
        const playerKingdom = this.gameMode.getPlayerKingdom();
        return province.kingdom !== playerKingdom.id;
    }
    
    quickAssignAttack(generalId, provinceId) {
        const general = this.gameMode.getGeneral(generalId);
        if (!general || !this.gameMode.isGeneralAvailable(general)) {
            alert('This general is not available');
            return;
        }
        
        const validation = this.gameMode.validateAction(generalId, 'attack', provinceId);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }
        
        const existingIndex = this.playerActions.findIndex(a => a.generalId === generalId);
        const action = { generalId: generalId, actionType: 'attack', targetId: provinceId };
        
        if (existingIndex >= 0) {
            this.playerActions[existingIndex] = action;
        } else {
            this.playerActions.push(action);
        }
        
        this.renderActions();
        this.closeProvinceModal();
    }
    
    quickAssignDefend(generalId, provinceId) {
        const general = this.gameMode.getGeneral(generalId);
        if (!general || !this.gameMode.isGeneralAvailable(general)) {
            alert('This general is not available');
            return;
        }
        
        const validation = this.gameMode.validateAction(generalId, 'defend', provinceId);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }
        
        const existingIndex = this.playerActions.findIndex(a => a.generalId === generalId);
        const action = { generalId: generalId, actionType: 'defend', targetId: provinceId };
        
        if (existingIndex >= 0) {
            this.playerActions[existingIndex] = action;
        } else {
            this.playerActions.push(action);
        }
        
        this.renderActions();
        this.closeProvinceModal();
    }
    
    showProvinceDetail(provinceId) {
        const province = this.gameMode.getProvince(provinceId);
        if (!province) {
            console.error('Province not found:', provinceId);
            if (window.location.pathname.startsWith('/province/')) {
                window.history.pushState(null, '', '/');
            }
            return;
        }
        
        // Actualizar URL con /province/
        window.history.pushState(null, '', `/province/${provinceId}`);
        
        const kingdom = this.gameMode.getKingdom(province.kingdom);
        if (!kingdom) {
            console.error('Kingdom not found for province:', provinceId);
            return;
        }
        
        const modal = this.getEl('provinceDetailModal');
        const content = this.getEl('provinceDetailContent');
        
        const generalsAtProvince = this.getGeneralsInProvince(provinceId);
        const playerKingdom = this.gameMode.getPlayerKingdom();
        const isEnemy = this.isEnemyProvince(provinceId);
        const isPlayerProvince = province.kingdom === playerKingdom.id;
        
        const hpPercent = (province.hp / province.maxHp) * 100;
        
        // Determine border color based on whether it's own or enemy
        const borderColor = isPlayerProvince ? '#4ade80' : '#ff4a4a';
        const ownerLabel = isPlayerProvince ? t('classic.own') : t('classic.enemy');
        
        // Obtener imagen de la provincia
        const provinceIndex = kingdom.provinces.findIndex(p => p.id === provinceId);
        const provinceImageUrl = getProvinceImage(kingdom.id, provinceIndex);
        
        // Create miniatures of present generals
        let generalsList = '';
        if (generalsAtProvince.length > 0) {
            generalsList = '<div class="province-detail-generals"><h4>' + t('classic.presentGenerals') + '</h4><div class="province-generals-list">';
            generalsAtProvince.forEach(general => {
                const generalImageUrl = getGeneralImage(general.id);
                generalsList += `
                    <div class="general-avatar-mini" title="${general.name} (HP: ${general.hp}/${general.maxHp})">
                        <img src="${generalImageUrl}" alt="${general.name}" onerror="this.style.display='none'">
                    </div>
                `;
            });
            generalsList += '</div></div>';
        }
        
        // Zona de acción rápida
        let quickActionZone = '';
        const availablePlayerGenerals = this.gameMode.getAvailableGenerals(playerKingdom);
        
        if (isEnemy && availablePlayerGenerals.length > 0) {
            quickActionZone = `
                <div class="quick-action-zone">
                    <h4>${t('classic.quickAssignAttack')}</h4>
                    <div class="quick-action-list">
                        ${availablePlayerGenerals.map(g => `
                            <div class="quick-action-item">
                                <span>${g.name}</span>
                                <button class="quick-action-btn btn btn-primary" data-general-id="${g.id}">
                                    ${t('classic.attackProvince', { name: province.name })}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (!isEnemy && availablePlayerGenerals.length > 0) {
            quickActionZone = `
                <div class="quick-action-zone">
                    <h4>${t('classic.quickAssignDefense')}</h4>
                    <div class="quick-action-list">
                        ${availablePlayerGenerals.map(g => `
                            <div class="quick-action-item">
                                <span>${g.name}</span>
                                <button class="quick-action-btn btn btn-primary" data-general-id="${g.id}">
                                    ${t('classic.defendProvince', { name: province.name })}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        content.innerHTML = `
            <div class="province-detail-header" style="border-left: 4px solid ${borderColor};">
                <h2>${province.name}</h2>
                <div class="kingdom-detail-badges">
                    <span class="kingdom-owner-badge" style="background-color: ${borderColor};">${ownerLabel}</span>
                    ${province.isCapital ? '<span class="kingdom-theme">' + t('classic.capital') + '</span>' : ''}
                </div>
            </div>
            
            <div class="province-detail-image" id="provinceDetailImageContainer">
            </div>
            
            <div class="kingdom-detail-stats">
                <h3>${t('classic.statistics')}</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">${t('classic.kingdom')}</span>
                        <span class="stat-value">${kingdom.name}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">${t('dataLibrary.hp')}</span>
                        <span class="stat-value">${province.hp}/${province.maxHp}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">${t('classic.generalsLabel')}</span>
                        <span class="stat-value">${generalsAtProvince.length}</span>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <div class="stat">
                        <span class="stat-label">${t('dataLibrary.hp')}</span>
                        <span class="stat-value">${province.hp}/${province.maxHp}</span>
                    </div>
                    <div class="hp-bar">
                        <div class="hp-bar-fill" style="width: ${hpPercent}%"></div>
                    </div>
                </div>
            </div>
            
            ${generalsList}
            
            ${quickActionZone}
        `;
        
        // Agregar imagen después de crear el contenido
        const imageContainer = this.getEl('provinceDetailImageContainer');
        const imageElement = createImageElement(
            provinceImageUrl,
            province.name,
            'province-detail-image',
            { placeholderText: province.name }
        );
        imageContainer?.appendChild(imageElement);
        
        // Agregar event listeners para botones de acción rápida
        if (quickActionZone) {
            const actionButtons = content.querySelectorAll('.quick-action-btn');
            actionButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const generalId = btn.getAttribute('data-general-id');
                    if (isEnemy) {
                        this.quickAssignAttack(generalId, provinceId);
                    } else {
                        this.quickAssignDefend(generalId, provinceId);
                    }
                });
            });
        }
        
        modal.classList.add('active');
    }
    
    closeProvinceModal() {
        const modal = this.getEl('provinceDetailModal');
        modal.classList.remove('active');
        // Clear route if modal is closed
        if (window.location.pathname.startsWith('/province/')) {
            window.history.pushState(null, '', '/');
        }
    }

    switchTab(tabName) {
        // Update buttons
        this.getAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update content
        this.getAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
    }

    async generateInitialStory() {
        const btn = this.getEl('generateInitialStoryBtn');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = t('classic.generatingBtn');
        
        this.showLoading(t('classic.loadingGenerateStory'));
        try {
            const gameState = this.gameMode.getGameState();
            const story = await generateStory(gameState, []);
            this.addToHistory(story, [], 0);
            // Hide button after generating initial story
            btn.style.display = 'none';
        } catch (error) {
            console.error('Error generating story:', error);
            this.addToHistory(t('classic.kingdomAwakens'), [], 0);
            btn.disabled = false;
            btn.textContent = originalText;
            alert(t('classic.errorGeneratingStory'));
        } finally {
            this.hideLoading();
        }
    }

    async nextTurn() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.showLoading(t('classic.loadingProcessingTurn'));
        
        try {
            // Process turn through game mode
            const result = this.gameMode.processTurn(this.playerActions);
            this.turnEvents = result.turnEvents;
            
            // Check victory conditions
            const victoryCheck = this.gameMode.checkVictoryConditions();
            if (victoryCheck.gameOver) {
                this.endGame(victoryCheck);
                return;
            }
            
            // Generate new story
            this.showLoading(t('classic.loadingGeneratingStory'));
            const gameState = this.gameMode.getGameState();
            const story = await generateStory(gameState, this.turnEvents);
            const dayNumber = gameState.turn + 1;
            this.addToHistory(story, this.turnEvents, dayNumber);
            
            // Clear actions and events
            this.playerActions = [];
            this.turnEvents = [];
            gameState.turn++;
            
            // Update UI
            await this.renderAll();
            
        } catch (error) {
            console.error('Error processing turn:', error);
            alert(t('classic.errorProcessingTurn', { message: error.message }));
        } finally {
            this.hideLoading();
            this.isProcessing = false;
        }
    }

    endGame(result) {
        const gameState = this.gameMode.getGameState();
        gameState.gameOver = true;
        gameState.winner = result.winner;
        
        let message = result.message || t('classic.gameEnded');
        if (result.winner === 'player') {
            message = t('classic.victory');
        } else if (result.loser === 'player') {
            message = t('classic.defeat');
        }
        
        this.addToHistory(`\n\n=== ${message} ===\n\n`, [], null);
        alert(message);
    }

    async renderAll() {
        this.renderKingdoms();
        this.renderGenerals();
        this.renderProvinces();
        this.renderActions();
    }

    renderKingdoms() {
        const container = this.getEl('kingdomsList');
        container.innerHTML = '';
        
        const gameState = this.gameMode.getGameState();
        for (const kingdom of gameState.kingdoms.values()) {
            // Obtener datos del reino desde gameData para acceder a theme, description, color
            const kingdomData = gameData.getKingdomById(kingdom.id);
            
            const card = document.createElement('div');
            card.className = `kingdom-card ${kingdom.owner}`;
            
            
            const generalsCount = kingdom.generals.length;
            const provincesCount = kingdom.provinces.length;
            const availableGenerals = this.gameMode.getAvailableGenerals(kingdom).length;
            
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
                themeBadge = `<span class="kingdom-theme">${kingdomData.theme}</span>`;
            }
            
            let descriptionText = '';
            if (kingdomData?.description) {
                descriptionText = `<p class="kingdom-description">${kingdomData.description}</p>`;
            }
            
            // Crear lista de provincias
            let provincesList = '';
            kingdom.provinces.forEach(province => {
                const generalsAtProvince = this.gameMode.getGeneralsAtProvince(province.id);
                const hasGenerals = generalsAtProvince.length > 0;
                provincesList += `
                    <div class="kingdom-province-item ${hasGenerals ? 'has-generals' : ''}" data-province-id="${province.id}">
                        ${province.name}${hasGenerals ? ` <span class="generals-indicator">(${generalsAtProvince.length})</span>` : ''}
                    </div>
                `;
            });
            
            contentDiv.innerHTML = `
                <div class="kingdom-header">
                    <h4>${kingdom.name}</h4>
                    ${themeBadge}
                </div>
                ${descriptionText}
                <div class="stats">
                    <div class="stat">
                        <span class="stat-label">Generals:</span>
                        <span class="stat-value">${generalsCount} (${availableGenerals} available)</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Provinces:</span>
                        <span class="stat-value">${provincesCount}</span>
                    </div>
                </div>
                <div class="kingdom-provinces-section">
                    <h5>Provinces:</h5>
                    ${provincesList}
                </div>
            `;
            
            card.appendChild(imageElement);
            card.appendChild(contentDiv);
            
            // Agregar event listeners a las provincias
            const provinceItems = card.querySelectorAll('.kingdom-province-item[data-province-id]');
            provinceItems.forEach(item => {
                item.style.cursor = 'pointer';
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const provinceId = item.getAttribute('data-province-id');
                    this.showProvinceDetail(provinceId);
                });
            });
            
            // Agregar click handler para mostrar detalles
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                this.showKingdomDetail(kingdom.id);
            });
            
            container.appendChild(card);
        }
    }

    renderGenerals() {
        const playerContainer = this.getEl('playerGeneralsList');
        const enemyContainer = this.getEl('enemyGeneralsList');
        
        playerContainer.innerHTML = '';
        enemyContainer.innerHTML = '';
        
        const playerKingdom = this.gameMode.getPlayerKingdom();
        const aiKingdoms = this.gameMode.getAIKingdoms();
        
        // Player generals
        playerKingdom.generals.forEach(general => {
            const card = this.createGeneralCard(general, true);
            playerContainer.appendChild(card);
        });
        
        // Enemy generals
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
        // Hacer todas las tarjetas clickeables
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => this.showGeneralDetail(general.id));
        
        const hpPercent = (general.hp / general.maxHp) * 100;
        const lovePercent = general.love;
        
        let statusText = t('classic.free');
        let statusClass = '';
        if (general.status === 'captured') {
            statusText = t('classic.captured');
            statusClass = 'captured';
        }
        if (general.status === 'slave') {
            statusText = t('classic.slave');
            statusClass = 'slave';
        }
        
        // Get general image
        const generalImageUrl = getGeneralImage(general.id);
        const imageElement = createImageElement(
            generalImageUrl,
            general.name,
            'general-image',
            { placeholderText: general.name }
        );
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';
        
        // Status to the right of name, smaller
        contentDiv.innerHTML = `
            <div class="general-card-header">
                <h4>${general.name}</h4>
                <span class="general-status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="stats">
                <div class="stat">
                    <span class="stat-label">HP:</span>
                    <span class="stat-value">${general.hp}/${general.maxHp}</span>
                </div>
                <div class="hp-bar">
                    <div class="hp-bar-fill" style="width: ${hpPercent}%"></div>
                </div>
                <div class="stat">
                    <span class="stat-label">Love:</span>
                    <span class="stat-value">${general.love}</span>
                </div>
                <div class="love-bar">
                    <div class="love-bar-fill" style="width: ${lovePercent}%"></div>
                </div>
                <div class="stat">
                    <span class="stat-label">Strength:</span>
                    <span class="stat-value">${general.strength}</span>
                </div>
                ${general.location ? `<div class="stat"><span class="stat-label">Location:</span><span class="stat-value">${general.location}</span></div>` : ''}
            </div>
        `;
        
        card.appendChild(imageElement);
        card.appendChild(contentDiv);
        return card;
    }

    renderProvinces() {
        const container = this.getEl('provincesMap');
        container.innerHTML = '';
        
        const gameState = this.gameMode.getGameState();
        // Agrupar provincias por reino
        const provincesByKingdom = new Map();
        for (const kingdom of gameState.kingdoms.values()) {
            provincesByKingdom.set(kingdom.id, {
                kingdom: kingdom,
                provinces: []
            });
        }
        
        // Agregar provincias a sus reinos correspondientes
        for (const kingdom of gameState.kingdoms.values()) {
            kingdom.provinces.forEach((province, index) => {
                provincesByKingdom.get(kingdom.id).provinces.push({ province, index });
            });
        }
        
        // Renderizar grupos por reino
        for (const [kingdomId, data] of provincesByKingdom.entries()) {
            const kingdom = data.kingdom;
            
            // Crear grupo de provincias
            const groupDiv = document.createElement('div');
            groupDiv.className = 'province-group';
            
            const groupHeader = document.createElement('div');
            groupHeader.className = 'province-group-header';
            groupHeader.innerHTML = `<h3>${kingdom.name}</h3>`;
            groupDiv.appendChild(groupHeader);
            
            const provincesContainer = document.createElement('div');
            provincesContainer.className = 'provinces-list';
            
            data.provinces.forEach(({ province, index }) => {
                const card = document.createElement('div');
                card.className = `province-card ${province.isCapital ? 'capital' : ''}`;
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => this.showProvinceDetail(province.id));
                
                const hpIndicators = Array.from({ length: province.maxHp }, (_, i) => 
                    `<div class="hp-indicator ${i < province.hp ? 'active' : ''}"></div>`
                ).join('');
                
                // Obtener generales en esta provincia
                const generalsAtProvince = this.gameMode.getGeneralsAtProvince(province.id);
                
                // Crear miniaturas de generales
                let generalsMiniatures = '';
                if (generalsAtProvince.length > 0) {
                    const maxVisible = 5;
                    const visibleGenerals = generalsAtProvince.slice(0, maxVisible);
                    const remaining = generalsAtProvince.length - maxVisible;
                    
                    generalsMiniatures = '<div class="province-generals-list">';
                    visibleGenerals.forEach(general => {
                        const generalImageUrl = getGeneralImage(general.id);
                        generalsMiniatures += `
                            <div class="general-avatar-mini" title="${general.name}">
                                <img src="${generalImageUrl}" alt="${general.name}" onerror="this.style.display='none'">
                            </div>
                        `;
                    });
                    if (remaining > 0) {
                        generalsMiniatures += `<div class="general-avatar-mini more-generals">+${remaining}</div>`;
                    }
                    generalsMiniatures += '</div>';
                }
                
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
                    ${generalsMiniatures}
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
                provincesContainer.appendChild(card);
            });
            
            groupDiv.appendChild(provincesContainer);
            container.appendChild(groupDiv);
        }
    }

    renderActions() {
        const container = this.getEl('assignedActions');
        container.innerHTML = '';
        
        if (this.playerActions.length === 0) {
            container.innerHTML = '<p>' + t('classic.noActionsAssigned') + '</p>';
            return;
        }
        
        this.playerActions.forEach((action, index) => {
            const general = this.gameMode.getGeneral(action.generalId);
            if (!general) return;
            
            const item = document.createElement('div');
            item.className = 'action-item';
            
            let targetName = t('classic.capital');
            if (action.targetId) {
                const province = this.gameMode.getProvince(action.targetId);
                if (province) targetName = province.name;
            }
            
            const actionKey = 'classic.action_' + action.actionType;
            const actionLabel = t(actionKey);
            
            item.innerHTML = `
                <div class="action-info">
                    <div class="action-type">${general.name}: ${actionLabel}</div>
                    <div class="action-target">${targetName}</div>
                </div>
                <button onclick="game.removeAction(${index})">${t('classic.remove')}</button>
            `;
            
            container.appendChild(item);
        });
    }

    selectGeneral(general) {
        if (!this.gameMode.isGeneralAvailable(general)) {
            alert(t('classic.generalNotAvailable'));
            return;
        }
        
        this.selectedGeneral = general;
        this.showActionModal(general);
    }

    showActionModal(general) {
        const modal = this.getEl('actionModal');
        const modalTitle = this.getEl('modalTitle');
        const modalBody = this.getEl('modalBody');
        
        modalTitle.textContent = t('classic.assignActionTitle', { name: general.name });
        
        const kingdom = this.gameMode.getKingdom(general.kingdom);
        const capital = this.gameMode.getCapital(kingdom);
        const allProvinces = this.gameMode.getAllProvinces();
        const ownProvinces = kingdom.provinces;
        const enemyProvinces = allProvinces.filter(p => p.kingdom !== general.kingdom);
        
        let html = '<form class="action-form" id="actionForm">';
        html += '<div class="form-group">';
        html += '<label>' + t('classic.actionTypeLabel') + '</label>';
        html += '<select id="actionType" required>';
        html += '<option value="">' + t('classic.selectAction') + '</option>';
        html += '<option value="attack">' + t('classic.actionType_attack') + '</option>';
        html += '<option value="defend">' + t('classic.actionType_defend') + '</option>';
        html += '<option value="rest">' + t('classic.actionType_restCapital') + '</option>';
        html += '<option value="date">' + t('classic.actionType_dateCapital') + '</option>';
        html += '<option value="train">' + t('classic.actionType_trainCapital') + '</option>';
        html += '</select>';
        html += '</div>';
        
        html += '<div class="form-group" id="targetGroup" style="display:none;">';
        html += '<label>' + t('classic.targetProvince') + '</label>';
        html += '<select id="targetProvince"></select>';
        html += '</div>';
        
        html += '<div class="form-actions">';
        html += '<button type="submit" class="btn btn-primary">' + t('classic.assignBtn') + '</button>';
        html += '<button type="button" class="btn btn-secondary" onclick="game.closeModal()">' + t('classic.cancel') + '</button>';
        html += '</div>';
        html += '</form>';
        
        modalBody.innerHTML = html;
        modal.classList.add('active');
        
        // Event listener for action select
        this.getEl('actionType').addEventListener('change', (e) => {
            const actionType = e.target.value;
            const targetGroup = this.getEl('targetGroup');
            const targetSelect = this.getEl('targetProvince');
            
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
        
        // Event listener for form
        this.getEl('actionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.assignAction(general);
        });
    }

    assignAction(general) {
        const actionType = this.getEl('actionType').value;
        if (!actionType) return;
        
        let targetId = null;
        if (['attack', 'defend'].includes(actionType)) {
            targetId = this.getEl('targetProvince').value;
            if (!targetId) {
                alert(t('classic.selectProvince'));
                return;
            }
        } else {
            // For capital actions, use null
            const kingdom = this.gameMode.getKingdom(general.kingdom);
            const capital = this.gameMode.getCapital(kingdom);
            if (capital) {
                targetId = capital.id;
            }
        }
        
        const validation = this.gameMode.validateAction(general.id, actionType, targetId);
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
        this.getEl('actionModal').classList.remove('active');
        this.selectedGeneral = null;
    }

    showLoading(text) {
        const modal = this.getEl('loadingModal');
        this.getEl('loadingText').textContent = text ?? t('classic.loadingText');
        modal.classList.add('active');
    }

    hideLoading() {
        this.getEl('loadingModal').classList.remove('active');
    }


    addToHistory(text, events = [], dayNumber = null) {
        const container = this.getEl('historyContent');
        
        // Remove welcome message if exists
        const welcomeEntry = container.querySelector('.history-entry .welcome-message');
        if (welcomeEntry) {
            welcomeEntry.closest('.history-entry')?.remove();
        }
        
        // Create new day entry
        const entry = document.createElement('div');
        entry.className = 'history-entry';
        
        // Título del día
        if (dayNumber !== null) {
            const dayTitle = document.createElement('h3');
            dayTitle.className = 'day-title';
            dayTitle.textContent = t('classic.dayTitle', { day: dayNumber });
            entry.appendChild(dayTitle);
        }
        
        // Narrative story
        const storyP = document.createElement('div');
        storyP.className = 'day-story';
        storyP.textContent = text;
        entry.appendChild(storyP);
        
        // Technical summary if there are events
        if (events && events.length > 0) {
            const technicalSummary = this.generateTechnicalSummary(events);
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'technical-summary';
            
            const summaryTitle = document.createElement('h4');
            summaryTitle.textContent = t('classic.technicalSummary');
            summaryDiv.appendChild(summaryTitle);
            
            const summaryContent = document.createElement('pre');
            summaryContent.className = 'summary-content';
            summaryContent.textContent = technicalSummary;
            summaryDiv.appendChild(summaryContent);
            
            entry.appendChild(summaryDiv);
        }
        
        container.appendChild(entry);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    generateTechnicalSummary(events) {
        const summary = [];
        const battles = [];
        const provinceChanges = [];
        const generalChanges = [];
        const captures = [];
        const conversions = [];
        
        // Process events
        for (const event of events) {
            switch (event.type) {
                case 'combat':
                    const attacker = this.gameMode.getGeneral(event.attacker);
                    const defender = this.gameMode.getGeneral(event.defender);
                    const winner = this.gameMode.getGeneral(event.winner);
                    const loser = this.gameMode.getGeneral(event.loser);
                    battles.push({
                        attacker: attacker ? attacker.name : event.attacker,
                        defender: defender ? defender.name : event.defender,
                        winner: winner ? winner.name : event.winner,
                        loser: loser ? loser.name : event.loser,
                        damage: event.damage
                    });
                    break;
                    
                case 'province_damage':
                    const province = this.gameMode.getProvince(event.province);
                    if (province) {
                        provinceChanges.push({
                            name: province.name,
                            hp: province.hp,
                            maxHp: province.maxHp,
                            kingdom: province.kingdom,
                            destroyed: event.destroyed
                        });
                    }
                    break;
                    
                case 'province_conquered':
                    const conqueredProvince = this.gameMode.getProvince(event.province);
                    const newOwner = this.gameMode.getKingdom(event.newOwner);
                    if (conqueredProvince) {
                        provinceChanges.push({
                            name: conqueredProvince.name,
                            hp: conqueredProvince.hp,
                            maxHp: conqueredProvince.maxHp,
                            kingdom: newOwner ? newOwner.name : event.newOwner,
                            conquered: true
                        });
                    }
                    break;
                    
                case 'capture':
                    const capturedGeneral = this.gameMode.getGeneral(event.general);
                    const captorGeneral = this.gameMode.getGeneral(event.captor);
                    if (capturedGeneral) {
                        captures.push({
                            general: capturedGeneral.name,
                            captor: captorGeneral ? captorGeneral.name : event.captor
                        });
                    }
                    break;
                    
                case 'enslavement_conversion':
                    const convertedGeneral = this.gameMode.getGeneral(event.general);
                    const oldKingdom = this.gameMode.getKingdom(event.oldKingdom);
                    const newKingdom = this.gameMode.getKingdom(event.newKingdom);
                    if (convertedGeneral) {
                        conversions.push({
                            general: convertedGeneral.name,
                            oldKingdom: oldKingdom ? oldKingdom.name : event.oldKingdom,
                            newKingdom: newKingdom ? newKingdom.name : event.newKingdom
                        });
                    }
                    break;
                    
                case 'rest':
                    const restedGeneral = this.gameMode.getGeneral(event.general);
                    if (restedGeneral) {
                        generalChanges.push({
                            general: restedGeneral.name,
                            type: 'rest',
                            hpRecovered: event.hpRecovered,
                            newHp: event.newHp || restedGeneral.hp
                        });
                    }
                    break;
                    
                case 'date':
                    const datedGeneral = this.gameMode.getGeneral(event.general);
                    if (datedGeneral) {
                        generalChanges.push({
                            general: datedGeneral.name,
                            type: 'date',
                            loveIncreased: event.loveIncreased,
                            newLove: event.newLove || datedGeneral.love
                        });
                    }
                    break;
                    
                case 'train':
                    const trainedGeneral = this.gameMode.getGeneral(event.general);
                    if (trainedGeneral) {
                        generalChanges.push({
                            general: trainedGeneral.name,
                            type: 'train',
                            strengthIncreased: event.strengthIncreased,
                            newStrength: event.newStrength || trainedGeneral.strength
                        });
                    }
                    break;
            }
        }
        
        // Build summary
        if (battles.length > 0) {
            summary.push('Battles:');
            battles.forEach(battle => {
                summary.push(`  - ${battle.attacker} vs ${battle.defender}: Winner ${battle.winner}, Damage: ${battle.damage}`);
            });
            summary.push('');
        }
        
        if (provinceChanges.length > 0) {
            summary.push('Provinces:');
            const uniqueProvinces = new Map();
            provinceChanges.forEach(change => {
                const key = change.name;
                if (!uniqueProvinces.has(key) || change.conquered) {
                    uniqueProvinces.set(key, change);
                }
            });
            uniqueProvinces.forEach(province => {
                if (province.conquered) {
                    summary.push(`  - ${province.name}: Conquered, New Owner: ${province.kingdom}`);
                } else {
                    summary.push(`  - ${province.name}: HP ${province.hp}/${province.maxHp}, Owner: ${province.kingdom}`);
                }
            });
            summary.push('');
        }
        
        if (captures.length > 0) {
            summary.push('Captures:');
            captures.forEach(capture => {
                summary.push(`  - ${capture.general} captured by ${capture.captor}`);
            });
            summary.push('');
        }
        
        if (conversions.length > 0) {
            summary.push('Conversions:');
            conversions.forEach(conversion => {
                summary.push(`  - ${conversion.general} converted from ${conversion.oldKingdom} to ${conversion.newKingdom}`);
            });
            summary.push('');
        }
        
        if (generalChanges.length > 0) {
            summary.push('General Changes:');
            generalChanges.forEach(change => {
                if (change.type === 'rest') {
                    summary.push(`  - ${change.general}: Recovered ${change.hpRecovered} HP (HP: ${change.newHp})`);
                } else if (change.type === 'date') {
                    summary.push(`  - ${change.general}: Love increased ${change.loveIncreased} (Love: ${change.newLove})`);
                } else if (change.type === 'train') {
                    summary.push(`  - ${change.general}: Strength increased ${change.strengthIncreased} (Strength: ${change.newStrength})`);
                }
            });
            summary.push('');
        }
        
        // Add current status of provinces and generals
        summary.push('Current Status:');
        summary.push('');
        
        summary.push('Provinces:');
        const allProvinces = this.gameMode.getAllProvinces();
        allProvinces.forEach(province => {
            const kingdom = this.gameMode.getKingdom(province.kingdom);
            summary.push(`  - ${province.name}: HP ${province.hp}/${province.maxHp}, Owner: ${kingdom ? kingdom.name : province.kingdom}${province.isCapital ? ' (' + t('classic.capital') + ')' : ''}`);
        });
        summary.push('');
        
        summary.push('Generals:');
        const allGenerals = this.gameMode.getAllGenerals();
        allGenerals.forEach(general => {
            const kingdom = this.gameMode.getKingdom(general.kingdom);
            let statusText = t('classic.free');
            if (general.status === 'captured') statusText = t('classic.captured');
            if (general.status === 'slave') statusText = t('classic.slave');
            summary.push(`  - ${general.name}: HP ${general.hp}/${general.maxHp}, Love: ${general.love}, Strength: ${general.strength}, Status: ${statusText}, Kingdom: ${kingdom ? kingdom.name : general.kingdom}`);
        });
        
        return summary.join('\n');
    }

    saveGame() {
        const state = this.gameMode.serializeState();
        // Add gameMode to saved state
        state.gameMode = this.currentGameModeId;
        localStorage.setItem('ntrAdvGameState', JSON.stringify(state));
        alert(t('classic.gameSaved'));
    }

    loadGame() {
        const saved = localStorage.getItem('ntrAdvGameState');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                if (this.gameMode.deserializeState(state)) {
                    this.renderAll();
                    alert(t('classic.gameLoaded'));
                } else {
                    alert(t('classic.errorLoadingGame'));
                }
            } catch (e) {
                console.error('Error loading game:', e);
                alert(t('classic.errorLoadingGame'));
            }
        } else {
            alert(t('classic.noSavedGame'));
        }
    }
}

// Game instance will be created when an app is selected
// The initialization is handled by welcome.js

// Export Game class for dynamic imports
export { Game };
