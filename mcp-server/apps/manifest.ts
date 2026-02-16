/**
 * Manifest de apps del proyecto NTR Adventure.
 * Refleja las apps registradas en src/apps/index.ts para que el servidor MCP
 * (Node) pueda exponer tools por app sin depender del bundle React.
 */
export interface AppManifestEntry {
  id: string
  name: string
  description: string
  type?: 'app' | 'game-mode'
  legacy?: boolean
}

export const APPS_MANIFEST: AppManifestEntry[] = [
  {
    id: 'narrated-story',
    name: 'NTR Narrated Story',
    description: 'Roleplay your fantasies with the AI.',
    type: 'app',
  },
  {
    id: 'cardgame',
    name: 'Card Game',
    description: 'Juego de cartas TCG: héroes, magia, objetos y soldados.',
    type: 'app',
  },
  {
    id: 'classic',
    name: 'Classic Mode',
    description: 'Modo de juego clásico con reinos, generales y provincias',
    type: 'game-mode',
    legacy: true,
  },
  {
    id: 'data-library',
    name: 'Biblioteca de Datos',
    description: 'Explora todos los datos de reinos, generales y provincias',
    type: 'app',
    legacy: true,
  },
]

export function getAppById(appId: string): AppManifestEntry | undefined {
  return APPS_MANIFEST.find((a) => a.id === appId)
}

export function listAppIds(): string[] {
  return APPS_MANIFEST.map((a) => a.id)
}
