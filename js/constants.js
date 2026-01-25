/**
 * Centralized constants for resource paths
 * All image and resource paths should use these constants
 */

// Base paths for images
export const IMAGE_PATHS = {
    // Base path for general images
    GENERALS: '/images/generals/',
    
    // Base path for kingdom images
    KINGDOMS: '/images/kingdoms/',
    
    // Base path for province images
    PROVINCES: '/images/provinces/',
    
    // Base path for other resources
    ROOT: '/images/'
};

/**
 * Builds the full path for a general image
 * @param {string} filename - Filename (e.g.: "aria.png")
 * @returns {string} - Full path (e.g.: "/images/generals/aria.png")
 */
export function getGeneralsImagePath(filename) {
    if (!filename) return null;
    
    // If it's already a full path, return it as is
    if (filename.startsWith('http://') || 
        filename.startsWith('https://') ||
        filename.startsWith('data:image/') ||
        filename.startsWith('/')) {
        return filename;
    }
    
    // Build full path using the constant
    return IMAGE_PATHS.GENERALS + filename;
}

/**
 * Builds the full path for a kingdom image
 * @param {string} filename - Filename
 * @returns {string} - Full path
 */
export function getKingdomsImagePath(filename) {
    if (!filename) return null;
    
    if (filename.startsWith('http://') || 
        filename.startsWith('https://') ||
        filename.startsWith('data:image/') ||
        filename.startsWith('/')) {
        return filename;
    }
    
    return IMAGE_PATHS.KINGDOMS + filename;
}

/**
 * Builds the full path for a province image
 * @param {string} filename - Filename
 * @returns {string} - Full path
 */
export function getProvincesImagePath(filename) {
    if (!filename) return null;
    
    if (filename.startsWith('http://') || 
        filename.startsWith('https://') ||
        filename.startsWith('data:image/') ||
        filename.startsWith('/')) {
        return filename;
    }
    
    return IMAGE_PATHS.PROVINCES + filename;
}
