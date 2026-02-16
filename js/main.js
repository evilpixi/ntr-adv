/**
 * Main Entry Point
 * Inicializa la aplicación mostrando la vista de bienvenida
 */

import { WelcomeView } from './welcome.js';

// Initialize welcome view when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const welcomeView = new WelcomeView();
    await welcomeView.render();
    
    // Make welcome view available globally
    window.welcomeView = welcomeView;
    
    // Setup back to welcome button
    const backToWelcomeBtn = document.getElementById('backToWelcomeBtn');
    if (backToWelcomeBtn) {
        backToWelcomeBtn.addEventListener('click', () => {
            welcomeView.showWelcome();
        });
    }
});
