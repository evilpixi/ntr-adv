/**
 * Helper para manejar imágenes con placeholders
 * Maneja casos donde no hay imagen o la imagen falla al cargar
 */

/**
 * Crea un placeholder SVG como data URI
 */
function getPlaceholderSVG(width = 200, height = 200, text = '') {
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#2a2a3e"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#aaa" text-anchor="middle" dominant-baseline="middle">
                ${text || 'Sin imagen'}
            </text>
        </svg>
    `.trim();
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

/**
 * Crea un elemento de imagen con manejo de errores y placeholder
 * @param {string|null} url - URL de la imagen (puede ser null)
 * @param {string} alt - Texto alternativo
 * @param {string} className - Clases CSS adicionales
 * @param {Object} options - Opciones adicionales
 * @returns {HTMLImageElement} - Elemento img configurado
 */
export function createImageElement(url, alt, className = '', options = {}) {
    const img = document.createElement('img');
    img.alt = alt || '';
    img.className = `card-image ${className}`.trim();
    
    // Aplicar opciones adicionales
    if (options.width) img.width = options.width;
    if (options.height) img.height = options.height;
    if (options.style) {
        Object.assign(img.style, options.style);
    }
    
    // Configurar placeholder por defecto
    const placeholderText = options.placeholderText || '';
    const placeholderUrl = getPlaceholderSVG(200, 200, placeholderText);
    
    if (url && url.trim() !== '') {
        // Intentar cargar la imagen
        img.src = url;
        
        // Si falla la carga, usar placeholder
        img.onerror = () => {
            img.src = placeholderUrl;
            img.classList.add('placeholder');
            img.classList.add('error');
        };
        
        // Si carga exitosamente, remover clase placeholder si existe
        img.onload = () => {
            img.classList.remove('placeholder');
            img.classList.remove('error');
        };
    } else {
        // No hay URL, usar placeholder directamente
        img.src = placeholderUrl;
        img.classList.add('placeholder');
    }
    
    return img;
}

/**
 * Crea un contenedor de imagen con estilo
 * @param {string|null} url - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} className - Clases CSS
 * @param {Object} options - Opciones adicionales
 * @returns {HTMLDivElement} - Contenedor con la imagen
 */
export function createImageContainer(url, alt, className = '', options = {}) {
    const container = document.createElement('div');
    container.className = `image-container ${className}`.trim();
    
    const img = createImageElement(url, alt, '', options);
    container.appendChild(img);
    
    return container;
}

/**
 * Verifica si una URL de imagen es válida (solo formato, no accesibilidad)
 * @param {string} url - URL a verificar
 * @returns {boolean} - true si el formato es válido
 */
export function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    // Verificar formato de URL
    const urlPattern = /^(https?:\/\/|data:image\/|\/)/;
    return urlPattern.test(url.trim());
}
