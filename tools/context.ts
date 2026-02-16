/**
 * Contexto de I/O para las tools. Quién llame a runTool (MCP server, app, backend)
 * proporciona una implementación; las handlers son stateless y solo usan esta interfaz.
 */
export interface AppInfo {
  id: string
  name: string
  description: string
  type?: string
  legacy?: boolean
}

export interface ToolMeta {
  name: string
  description?: string
}

/** Contexto para tools globales (shell + cardgame). Narrated Story usa su propio contexto en src/apps/narratedStory/. */
export interface ToolContext {
  /** Lista de apps (shell). */
  listApps(): Promise<AppInfo[]>
  getAppInfo(appId: string): Promise<AppInfo | null>
  getToolList(appId: string): Promise<ToolMeta[]>

  /** Card Game: mazos. */
  listDecks(): Promise<string[]>
  readDeck(deckName: string): Promise<unknown | undefined>
  writeDeck(deckName: string, deckJson: Record<string, unknown>): Promise<void>
}
