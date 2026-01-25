/**
 * Helper to handle images with placeholders
 * Handles cases where there's no image or image fails to load
 */

/**
 * Creates a placeholder SVG as data URI
 */
function getPlaceholderSVG(width = 200, height = 200, text = '') {
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#2a2a3e"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#aaa" text-anchor="middle" dominant-baseline="middle">
                ${text || 'No image'}
            </text>
        </svg>
    `.trim();
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

/**
 * Creates an image element with error handling and placeholder
 * @param {string|null} url - Image URL (can be null)
 * @param {string} alt - Alternative text
 * @param {string} className - Additional CSS classes
 * @param {Object} options - Additional options
 * @returns {HTMLImageElement} - Configured img element
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
    
    // Configure default placeholder
    const placeholderText = options.placeholderText || '';
    const placeholderUrl = getPlaceholderSVG(200, 200, placeholderText);
    
    if (url && url.trim() !== '') {
        // Try to load image
        img.src = url;
        
        // If load fails, use placeholder
        img.onerror = () => {
            img.src = placeholderUrl;
            img.classList.add('placeholder');
            img.classList.add('error');
        };
        
        // If loads successfully, remove placeholder class if exists
        img.onload = () => {
            img.classList.remove('placeholder');
            img.classList.remove('error');
        };
    } else {
        // No URL, use placeholder directly
        img.src = placeholderUrl;
        img.classList.add('placeholder');
    }
    
    return img;
}

/**
 * Creates a styled image container
 * @param {string|null} url - Image URL
 * @param {string} alt - Alternative text
 * @param {string} className - CSS classes
 * @param {Object} options - Additional options
 * @returns {HTMLDivElement} - Container with image
 */
export function createImageContainer(url, alt, className = '', options = {}) {
    const container = document.createElement('div');
    container.className = `image-container ${className}`.trim();
    
    const img = createImageElement(url, alt, '', options);
    container.appendChild(img);
    
    return container;
}

/**
 * Checks if an image URL is valid (format only, not accessibility)
 * @param {string} url - URL to check
 * @returns {boolean} - true if format is valid
 */
export function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    // Check URL format
    const urlPattern = /^(https?:\/\/|data:image\/|\/)/;
    return urlPattern.test(url.trim());
}
