/**
 * Contexto de tools global (shell + cardgame) para el navegador.
 * Usar cuando se necesite ToolContext en el frontend (p. ej. selector de apps, listar tools por app).
 * Las tools de Narrated Story tienen su propio contexto en src/apps/narratedStory/tools/.
 */
import type { ToolContext, AppInfo, ToolMeta } from 'tools/context'
import { TOOL_DEFINITIONS } from 'tools/definitions'

/** appId -> prefijo del nombre de tool */
const APP_TOOL_PREFIX: Record<string, string> = {
  'narrated-story': 'narrated_story_',
  cardgame: 'cardgame_',
  shell: 'ntr_',
}

const APPS_STATIC: AppInfo[] = [
  { id: 'narrated-story', name: 'NTR Narrated Story', description: 'Roleplay your fantasies with the AI.', type: 'app' },
  { id: 'cardgame', name: 'Card Game', description: 'Juego de cartas TCG.', type: 'app' },
  { id: 'shell', name: 'Shell', description: 'Tools globales del proyecto.', type: 'app' },
]

/**
 * Crea un ToolContext para el navegador.
 * Para narrated-story, getToolList devuelve solo las tools de esa app (el cliente debe obtener NARRATED_STORY_TOOL_DEFINITIONS desde la app).
 * Card Game: listDecks/readDeck/writeDeck son stubs (sin persistencia en browser por defecto).
 */
export function createBrowserToolContext(): ToolContext {
  return {
    async listApps() {
      return APPS_STATIC
    },
    async getAppInfo(appId: string) {
      return APPS_STATIC.find((a) => a.id === appId) ?? null
    },
    async getToolList(appId: string) {
      const prefix = APP_TOOL_PREFIX[appId] ?? appId.replace(/-/g, '_') + '_'
      return TOOL_DEFINITIONS.filter((t) => t.name.startsWith(prefix)).map(
        (t): ToolMeta => ({ name: t.name, description: t.description })
      )
    },
    async listDecks() {
      return []
    },
    async readDeck() {
      return undefined
    },
    async writeDeck() {
      // No-op en browser por ahora
    },
  }
}
