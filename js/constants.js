/**
 * Centralized constants for resource paths.
 * All image paths are built with the app base URL (e.g. /ntr-adv/ on GitHub Pages)
 * so they work in both local (/) and deployed (/{repo}/) environments.
 *
 * __BASE_URL__ is injected by Vite at build time (see vite.config.ts).
 */
const BASE = typeof __BASE_URL__ !== 'undefined' ? __BASE_URL__ : '/'

function withBase(path) {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  const p = path.startsWith('/') ? path.slice(1) : path
  return (BASE.endsWith('/') ? BASE : BASE + '/') + p
}

// Base paths for images (include base URL for deploy)
export const IMAGE_PATHS = {
  GENERALS: (BASE.endsWith('/') ? BASE : BASE + '/') + 'images/generals/',
  KINGDOMS: (BASE.endsWith('/') ? BASE : BASE + '/') + 'images/kingdoms/',
  PROVINCES: (BASE.endsWith('/') ? BASE : BASE + '/') + 'images/provinces/',
  ROOT: (BASE.endsWith('/') ? BASE : BASE + '/') + 'images/'
}

/**
 * Builds the full path for a general image (with base URL).
 */
export function getGeneralsImagePath(filename) {
  if (!filename) return null
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('data:image/')) return filename
  if (filename.startsWith('/')) return withBase(filename)
  return IMAGE_PATHS.GENERALS + filename
}

/**
 * Builds the full path for a kingdom image (with base URL).
 */
export function getKingdomsImagePath(filename) {
  if (!filename) return null
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('data:image/')) return filename
  if (filename.startsWith('/')) return withBase(filename)
  return IMAGE_PATHS.KINGDOMS + filename
}

/**
 * Builds the full path for a province image (with base URL).
 */
export function getProvincesImagePath(filename) {
  if (!filename) return null
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('data:image/')) return filename
  if (filename.startsWith('/')) return withBase(filename)
  return IMAGE_PATHS.PROVINCES + filename
}
