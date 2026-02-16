/**
 * Data Library App
 * Muestra todos los datos de reinos, generales y provincias en una biblioteca navegable
 */

import { gameData } from '../dataLoader.js';
import { getKingdomImage, getGeneralImage, getProvinceImage } from '../config.js';

class DataLibraryApp {
    constructor() {
        this.container = null;
        this.currentTab = 'kingdoms';
    }

    /**
     * Inicializa y muestra la app
     */
    async launch() {
        // Ocultar welcome view
        const welcomeView = document.getElementById('welcomeView');
        if (welcomeView) {
            welcomeView.classList.add('hidden');
        }

        // Crear contenedor principal
        this.container = document.createElement('div');
        this.container.id = 'dataLibraryContainer';
        this.container.className = 'data-library-container';
        
        // Agregar botón de volver
        const backButton = document.createElement('button');
        backButton.className = 'btn btn-secondary';
        backButton.textContent = 'Volver al Inicio';
        backButton.addEventListener('click', () => this.close());
        
        // Crear header
        const header = document.createElement('div');
        header.className = 'data-library-header';
        header.innerHTML = `
            <h1>Biblioteca de Datos</h1>
        `;
        header.appendChild(backButton);
        
        // Crear tabs
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'data-library-tabs';
        tabsContainer.innerHTML = `
            <button class="data-library-tab active" data-tab="kingdoms">Reinos</button>
            <button class="data-library-tab" data-tab="generals">Generales</button>
            <button class="data-library-tab" data-tab="provinces">Provincias</button>
        `;
        
        // Crear contenido
        const content = document.createElement('div');
        content.className = 'data-library-content';
        content.id = 'dataLibraryContent';
        
        // Agregar event listeners a los tabs
        tabsContainer.querySelectorAll('.data-library-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        this.container.appendChild(header);
        this.container.appendChild(tabsContainer);
        this.container.appendChild(content);
        
        // Agregar al body
        document.body.appendChild(this.container);
        
        // Cargar datos si no están cargados
        if (!gameData.loaded) {
            await gameData.load();
        }
        
        // Renderizar contenido inicial
        this.render();
    }

    /**
     * Cambia de tab
     */
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Actualizar tabs activos
        this.container.querySelectorAll('.data-library-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Renderizar contenido
        this.render();
    }

    /**
     * Renderiza el contenido según el tab activo
     */
    render() {
        const content = document.getElementById('dataLibraryContent');
        
        switch (this.currentTab) {
            case 'kingdoms':
                content.innerHTML = this.renderKingdoms();
                break;
            case 'generals':
                content.innerHTML = this.renderGenerals();
                break;
            case 'provinces':
                content.innerHTML = this.renderProvinces();
                break;
        }
    }

    /**
     * Renderiza la lista de reinos
     */
    renderKingdoms() {
        const kingdoms = gameData.getKingdoms();
        
        if (kingdoms.length === 0) {
            return '<p>No hay reinos disponibles.</p>';
        }
        
        let html = '<div class="data-library-grid">';
        
        for (const kingdom of kingdoms) {
            const kingdomImageUrl = getKingdomImage(kingdom.id);
            const generals = gameData.getGeneralsByKingdom(kingdom.id);
            const provinces = gameData.getProvinceNames(kingdom.id);
            
            html += `
                <div class="data-library-card kingdom-card">
                    <div class="data-library-card-image">
                        ${this.createImageHTML(kingdomImageUrl, kingdom.name, 'kingdom-image')}
                    </div>
                    <div class="data-library-card-content">
                        <h3>${kingdom.name}</h3>
                        <div class="data-library-badges">
                            ${kingdom.theme ? `<span class="badge">${kingdom.theme}</span>` : ''}
                            <span class="badge">${kingdom.owner || 'ai'}</span>
                        </div>
                        ${kingdom.description ? `<p class="data-library-description">${kingdom.description}</p>` : ''}
                        <div class="data-library-stats">
                            <div class="stat">
                                <span class="stat-label">Generales:</span>
                                <span class="stat-value">${generals.length}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Provincias:</span>
                                <span class="stat-value">${provinces.length}</span>
                            </div>
                        </div>
                        ${kingdom.architecturalStyle ? `
                            <div class="data-library-detail-section">
                                <h4>Arquitectura</h4>
                                <p>${kingdom.architecturalStyle}</p>
                            </div>
                        ` : ''}
                        ${kingdom.biome ? `
                            <div class="data-library-detail-section">
                                <h4>Bioma</h4>
                                <p>${kingdom.biome}</p>
                            </div>
                        ` : ''}
                        ${kingdom.governmentType ? `
                            <div class="data-library-detail-section">
                                <h4>Tipo de Gobierno</h4>
                                <p>${kingdom.governmentType}</p>
                            </div>
                        ` : ''}
                        ${kingdom.socialDescription ? `
                            <div class="data-library-detail-section">
                                <h4>Sociedad</h4>
                                <p>${kingdom.socialDescription}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Renderiza la lista de generales
     */
    renderGenerals() {
        const generals = gameData.getGenerals();
        
        if (generals.length === 0) {
            return '<p>No hay generales disponibles.</p>';
        }
        
        // Agrupar por reino
        const generalsByKingdom = {};
        for (const general of generals) {
            if (!generalsByKingdom[general.kingdom]) {
                generalsByKingdom[general.kingdom] = [];
            }
            generalsByKingdom[general.kingdom].push(general);
        }
        
        let html = '';
        
        for (const [kingdomId, kingdomGenerals] of Object.entries(generalsByKingdom)) {
            const kingdom = gameData.getKingdomById(kingdomId);
            const kingdomName = kingdom ? kingdom.name : kingdomId;
            
            html += `
                <div class="data-library-section">
                    <h2 class="data-library-section-title">${kingdomName}</h2>
                    <div class="data-library-grid">
            `;
            
            for (const general of kingdomGenerals) {
                const generalImageUrl = getGeneralImage(general.id);
                
                html += `
                    <div class="data-library-card general-card">
                        <div class="data-library-card-image">
                            ${this.createImageHTML(generalImageUrl, general.name, 'general-image')}
                        </div>
                        <div class="data-library-card-content">
                            <h3>${general.name}</h3>
                            ${general.description ? `<p class="data-library-description">${general.description}</p>` : ''}
                            <div class="data-library-stats">
                                <div class="stat">
                                    <span class="stat-label">HP:</span>
                                    <span class="stat-value">${general.hp || 100}</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Amor:</span>
                                    <span class="stat-value">${general.love || 50}</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Fuerza:</span>
                                    <span class="stat-value">${general.strength || 10}</span>
                                </div>
                            </div>
                            ${general.personality ? `
                                <div class="data-library-detail-section">
                                    <h4>Personalidad</h4>
                                    <p>${general.personality}</p>
                                </div>
                            ` : ''}
                            ${general.physicalAppearance ? `
                                <div class="data-library-detail-section">
                                    <h4>Apariencia Física</h4>
                                    <p>${general.physicalAppearance}</p>
                                </div>
                            ` : ''}
                            ${general.additionalData ? `
                                <div class="data-library-detail-section">
                                    <h4>Información Adicional</h4>
                                    <div class="additional-data">
                                        ${general.additionalData.age ? `<p><strong>Edad:</strong> ${general.additionalData.age}</p>` : ''}
                                        ${general.additionalData.specialty ? `<p><strong>Especialidad:</strong> ${general.additionalData.specialty}</p>` : ''}
                                        ${general.additionalData.favoriteWeapon ? `<p><strong>Arma Favorita:</strong> ${general.additionalData.favoriteWeapon}</p>` : ''}
                                        ${general.additionalData.background ? `<p><strong>Antecedentes:</strong> ${general.additionalData.background}</p>` : ''}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    /**
     * Renderiza la lista de provincias
     */
    renderProvinces() {
        const kingdoms = gameData.getKingdoms();
        const provinces = gameData.getProvinces();
        
        if (kingdoms.length === 0) {
            return '<p>No hay provincias disponibles.</p>';
        }
        
        let html = '';
        
        for (const kingdom of kingdoms) {
            const kingdomProvinces = provinces[kingdom.id] || [];
            
            if (kingdomProvinces.length === 0) continue;
            
            html += `
                <div class="data-library-section">
                    <h2 class="data-library-section-title">${kingdom.name}</h2>
                    <div class="data-library-grid">
            `;
            
            for (let i = 0; i < kingdomProvinces.length; i++) {
                const provinceInfo = gameData.getProvinceInfo(kingdom.id, i);
                const provinceName = provinceInfo ? provinceInfo.name : (typeof kingdomProvinces[i] === 'string' ? kingdomProvinces[i] : kingdomProvinces[i].name);
                const provinceImageUrl = getProvinceImage(kingdom.id, i);
                const provinceDescription = gameData.getProvinceDescription(kingdom.id, i);
                const provincePrompt = gameData.getProvincePrompt(kingdom.id, i);
                
                html += `
                    <div class="data-library-card province-card">
                        <div class="data-library-card-image">
                            ${this.createImageHTML(provinceImageUrl, provinceName, 'province-image')}
                        </div>
                        <div class="data-library-card-content">
                            <h3>${provinceName}</h3>
                            ${i === 0 ? '<span class="badge">Capital</span>' : ''}
                            ${provinceDescription ? `<p class="data-library-description">${provinceDescription}</p>` : ''}
                            ${provincePrompt ? `
                                <div class="data-library-detail-section">
                                    <h4>Prompt de Imagen</h4>
                                    <p class="prompt-text">${provincePrompt}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    /**
     * Crea el HTML para una imagen
     */
    createImageHTML(imageUrl, alt, className) {
        if (!imageUrl) {
            return `<div class="${className} placeholder">${alt.charAt(0)}</div>`;
        }
        
        // Crear placeholder SVG simple
        const placeholderChar = alt.charAt(0).toUpperCase();
        const svgContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#2a2a3e"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" fill="#8b5a2b" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${placeholderChar}</text></svg>`;
        const placeholderUrl = 'data:image/svg+xml;base64,' + btoa(svgContent);
        
        // Crear elemento img con manejo de errores
        return `<img src="${imageUrl}" alt="${alt}" class="${className}" onerror="this.onerror=null; this.src='${placeholderUrl}'; this.classList.add('placeholder');" />`;
    }

    /**
     * Cierra la app y vuelve al welcome
     */
    close() {
        if (this.container) {
            this.container.remove();
        }
        
        const welcomeView = document.getElementById('welcomeView');
        if (welcomeView) {
            welcomeView.classList.remove('hidden');
        }
    }
}

export { DataLibraryApp };
