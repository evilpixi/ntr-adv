/** Estado de partida devuelto por getPartida (personajes con relaciones, lugares). */
export interface NarratedStoryPartidaSnapshot {
  playerProfile?: Record<string, unknown>
  characters: Array<Record<string, unknown>>
  places?: Array<{ id: string; name: string; description?: string }>
  placeAdditionalInfo?: Record<string, string>
}

/**
 * Contexto de I/O solo para las tools de la app Narrated Story.
 * Quién ejecute runNarratedStoryTool (app, MCP con partida narrativa) proporciona esta implementación.
 */
export interface NarratedStoryToolContext {
  updateCharacter(characterId: string, patch: Record<string, unknown>): Promise<void>
  updateCharacters(updates: Array<{ characterId: string; patch: Record<string, unknown> }>): Promise<void>
  updatePlace(placeId: string, patch: Record<string, unknown>): Promise<void>
  createCharacter(character: Record<string, unknown>): Promise<void>
  createPlace(placeId: string, name: string, description?: string): Promise<void>
  /** Devuelve el estado actual de la partida (personajes con corruption, loveRegent, lust, feelingsToward; lugares). Opcional: si no existe, la tool get_state falla. */
  getPartida?(): Promise<NarratedStoryPartidaSnapshot | null>
}
