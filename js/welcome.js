/**
 * Welcome View
 * Maneja la pantalla de bienvenida con lista de apps disponibles
 */

import { getAvailableApps, launchApp } from './apps/index.js';
import { gameData } from './dataLoader.js';

class WelcomeView {
    constructor() {
        this.container = document.getElementById('welcomeView');
        this.gameContainer = document.getElementById('gameContainer');
        this.currentApp = null;
    }

    /**
     * Renderiza la vista de bienvenida
     */
    async render() {
        const apps = getAvailableApps();
        
        const welcomeHTML = `
            <div class="welcome-content">
                <h1 class="welcome-title">NTR Adventure</h1>
                <p class="welcome-subtitle">Selecciona una aplicación para comenzar</p>
                
                <div class="apps-grid" id="appsGrid">
                    ${apps.map(app => this.createAppCard(app)).join('')}
                </div>
            </div>
        `;
        
        this.container.innerHTML = welcomeHTML;
        
        // Agregar event listeners a las cards
        const appCards = this.container.querySelectorAll('.app-card');
        appCards.forEach(card => {
            card.addEventListener('click', () => {
                const appId = card.dataset.appId;
                this.showApp(appId);
            });
        });
    }

    /**
     * Crea el HTML para una card de app
     * @param {Object} app - Configuración de la app
     * @returns {string} - HTML de la card
     */
    createAppCard(app) {
        const iconHTML = app.icon 
            ? `<img src="${app.icon}" alt="${app.name}" class="app-icon">`
            : `<div class="app-icon-placeholder">${app.name.charAt(0)}</div>`;
        
        const typeBadge = app.type === 'game-mode' 
            ? '<span class="app-type-badge">Modo de Juego</span>'
            : '<span class="app-type-badge">Aplicación</span>';
        
        return `
            <div class="app-card" data-app-id="${app.id}">
                <div class="app-card-header">
                    ${iconHTML}
                    <div class="app-card-info">
                        <h3 class="app-name">${app.name}</h3>
                        ${typeBadge}
                    </div>
                </div>
                <p class="app-description">${app.description}</p>
            </div>
        `;
    }

    /**
     * Muestra una app seleccionada
     * @param {string} appId - ID de la app a mostrar
     */
    async showApp(appId) {
        try {
            const result = await launchApp(appId);
            
            if (result && result.type === 'game-mode') {
                // Ocultar vista de bienvenida
                this.container.classList.add('hidden');
                
                // Mostrar contenedor del juego
                this.gameContainer.classList.remove('hidden');
                
                // Inicializar el juego con el modo seleccionado
                if (!window.game) {
                    // Si el juego no existe, importarlo y crearlo
                    const { Game } = await import('./game.js');
                    window.game = new Game();
                }
                
                await window.game.initializeGame(result.gameModeId);
                this.currentApp = appId;
            } else {
                // Para otras apps, la función launch se encarga de todo
                this.container.classList.add('hidden');
                this.currentApp = appId;
            }
        } catch (error) {
            console.error('Error launching app:', error);
            alert(`Error al iniciar la aplicación: ${error.message}`);
        }
    }

    /**
     * Vuelve a la vista de bienvenida
     */
    showWelcome() {
        this.container.classList.remove('hidden');
        this.gameContainer.classList.add('hidden');
        this.currentApp = null;
    }
}

export { WelcomeView };
