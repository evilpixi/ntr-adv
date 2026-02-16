/**
 * Helper to handle images with placeholders
 * Handles cases where there's no image or image fails to load
 */

/**
 * Normalizes image URLs to work correctly in GitHub Pages
 * Detects the base path automatically and adjusts relative/absolute paths
 * @param {string} url - Image URL to normalize
 * @returns {string} - Normalized URL
 */
export function normalizeImageUrl(url) {
    if (!url || typeof url !== 'string') return url;
    
    const trimmedUrl = url.trim();
    
    // If it's already a full URL (http/https) or data URI, return as is
    if (trimmedUrl.startsWith('http://') || 
        trimmedUrl.startsWith('https://') ||
        trimmedUrl.startsWith('data:image/')) {
        return trimmedUrl;
    }
    
    // Detect base path from current location
    // For GitHub Pages: if repo name != username, base path is /repo-name/
    const pathname = window.location.pathname;
    let basePath = '/';
    
    // Extract the base path from the current URL
    // Examples:
    // - https://usuario.github.io/ → pathname = '/' → basePath = '/'
    // - https://usuario.github.io/ntr-adv/ → pathname = '/ntr-adv/' → basePath = '/ntr-adv/'
    // - https://usuario.github.io/ntr-adv/index.html → pathname = '/ntr-adv/index.html' → basePath = '/ntr-adv/'
    const pathParts = pathname.split('/').filter(p => p && p !== 'index.html');
    
    if (pathParts.length > 0) {
        // Get the first path segment (repository name)
        // This works for GitHub Pages where the repo name is the first segment
        basePath = '/' + pathParts[0] + '/';
    }
    
    // If URL already has the base path (e.g. from constants.js), don't double it
    if (basePath !== '/' && trimmedUrl.startsWith(basePath)) return trimmedUrl;
    
    // Normalize the URL
    if (trimmedUrl.startsWith('/')) {
        // Absolute path from root - prepend base path if not at root
        if (basePath !== '/') {
            return basePath + trimmedUrl.substring(1);
        }
        return trimmedUrl;
    } else if (trimmedUrl.startsWith('./')) {
        // Relative path - resolve from base path
        return basePath + trimmedUrl.substring(2);
    } else if (trimmedUrl.startsWith('../')) {
        // Parent relative path - resolve from base path
        // This is more complex, but for our case we can simplify
        return basePath + trimmedUrl.replace(/^\.\.\//, '');
    } else {
        // Assume it's relative to base path
        return basePath + trimmedUrl;
    }
}

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
        // Normalize the URL for GitHub Pages compatibility
        const normalizedUrl = normalizeImageUrl(url);
        // Try to load image
        img.src = normalizedUrl;
        
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
