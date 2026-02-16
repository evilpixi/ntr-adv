/**
 * Export del tema para uso en JS/TS (p. ej. valores por defecto, Phaser).
 * Los estilos se aplican vía CSS (tokens.css, components.css).
 */
export const theme = {
  colors: {
    bg: '#0a0e14',
    surface: '#131920',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    accent: '#3b82f6',
    border: '#1e2a3a',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontFamily: {
    sans: '"Crimson Text", Georgia, serif',
    display: '"Cinzel", "Crimson Text", serif',
  },
} as const
