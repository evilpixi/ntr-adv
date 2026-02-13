/**
 * Ejecutor stateless: recibe nombre, argumentos y contexto, devuelve resultado.
 * Usar en cada "siguiente turno" o desde el servidor MCP.
 */
import type { ToolContext } from './context.js'
import { getToolDefinition } from './definitions.js'

export interface ToolResult {
  text: string
  isError?: boolean
}

export async function runTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const def = getToolDefinition(name)
  if (!def) {
    return { text: JSON.stringify({ error: `Unknown tool: ${name}` }), isError: true }
  }

  try {
    switch (name) {
      case 'ntr_list_apps': {
        const list = await context.listApps()
        return { text: JSON.stringify(list, null, 2) }
      }
      case 'ntr_get_app_info': {
        const appId = args.appId as string | undefined
        if (appId == null) return { text: JSON.stringify({ error: 'Missing appId' }), isError: true }
        const app = await context.getAppInfo(appId)
        if (!app) {
          return {
            text: JSON.stringify({ error: `App not found: ${appId}` }),
            isError: true,
          }
        }
        return { text: JSON.stringify(app, null, 2) }
      }
      case 'ntr_list_app_tools': {
        const appId = args.appId as string | undefined
        if (appId == null) return { text: JSON.stringify({ error: 'Missing appId' }), isError: true }
        const app = await context.getAppInfo(appId)
        if (!app) {
          return {
            text: JSON.stringify({ error: `App not found: ${appId}` }),
            isError: true,
          }
        }
        const tools = await context.getToolList(appId)
        const list = tools.map((t) => ({ name: t.name, description: t.description ?? '' }))
        return { text: JSON.stringify({ appId, appName: app.name, tools: list }, null, 2) }
      }
      case 'cardgame_list_decks': {
        const decks = await context.listDecks()
        return { text: JSON.stringify({ decks }, null, 2) }
      }
      case 'cardgame_read_deck': {
        const deckName = args.deckName as string | undefined
        if (deckName == null) return { text: JSON.stringify({ error: 'Missing deckName' }), isError: true }
        const content = await context.readDeck(deckName)
        if (content === undefined) {
          return { text: JSON.stringify({ error: `Deck not found: ${deckName}` }), isError: true }
        }
        return { text: JSON.stringify(content, null, 2) }
      }
      case 'cardgame_write_deck': {
        const deckName = args.deckName as string | undefined
        const deckJson = args.deckJson as Record<string, unknown> | undefined
        if (deckName == null) return { text: JSON.stringify({ error: 'Missing deckName' }), isError: true }
        if (!deckJson || typeof deckJson !== 'object') {
          return { text: JSON.stringify({ error: 'Missing or invalid deckJson' }), isError: true }
        }
        await context.writeDeck(deckName, deckJson)
        return { text: JSON.stringify({ ok: true, message: 'Deck written.' }) }
      }
      default:
        return { text: JSON.stringify({ error: `Unhandled tool: ${name}` }), isError: true }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { text: JSON.stringify({ error: message }), isError: true }
  }
}

/**
 * Ejecuta varias tools en secuencia (p. ej. las que devolvió el LLM en un turno).
 */
export async function runTools(
  calls: Array<{ name: string; args: Record<string, unknown> }>,
  context: ToolContext
): Promise<ToolResult[]> {
  const results: ToolResult[] = []
  for (const { name, args } of calls) {
    results.push(await runTool(name, args ?? {}, context))
  }
  return results
}
