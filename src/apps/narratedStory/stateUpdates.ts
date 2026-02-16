/**
 * State updates from Option B flow: one structured payload applied in a single step.
 * Extracted from the model's ```state_updates block (second call); applied before final narrative.
 */
import { createNarratedStoryBrowserContext } from './tools/browserContext'
import { runNarratedStoryTool } from './tools/run'

const STATE_UPDATES_BLOCK = '```state_updates'

export interface StateUpdatesPayload {
  newPlaces?: Array<{ placeId?: string; name?: string; description?: string }>
  newCharacters?: Array<Record<string, unknown>>
  placeUpdates?: Array<{ placeId?: string; patch?: Record<string, unknown> }>
  characterUpdates?: Array<{ characterId?: string; patch?: Record<string, unknown> }>
  characterLocations?: Array<{
    characterId?: string
    placeId?: string | null
    currentActivity?: string
    currentState?: string
  }>
}

/**
 * Extracts the content of the ```state_updates code block from the model response.
 * Returns the raw string inside the block, or null if not found.
 */
export function extractStateUpdatesBlock(raw: string): string | null {
  const idx = raw.indexOf(STATE_UPDATES_BLOCK)
  if (idx === -1) return null
  const afterStart = raw.slice(idx + STATE_UPDATES_BLOCK.length)
  const lineEnd = afterStart.indexOf('\n')
  const contentStart = lineEnd === -1 ? 0 : lineEnd + 1
  const rest = afterStart.slice(contentStart)
  const closeIdx = rest.indexOf('\n```')
  const content = closeIdx === -1 ? rest : rest.slice(0, closeIdx)
  return content.trim() || null
}

/**
 * Parses the state_updates block content as JSON. Returns null if invalid.
 */
export function parseStateUpdatesPayload(jsonString: string): StateUpdatesPayload | null {
  try {
    const parsed = JSON.parse(jsonString) as unknown
    if (parsed === null || typeof parsed !== 'object') return null
    const o = parsed as Record<string, unknown>
    const payload: StateUpdatesPayload = {}
    if (Array.isArray(o.newPlaces)) payload.newPlaces = o.newPlaces as StateUpdatesPayload['newPlaces']
    if (Array.isArray(o.newCharacters)) payload.newCharacters = o.newCharacters as StateUpdatesPayload['newCharacters']
    if (Array.isArray(o.placeUpdates)) payload.placeUpdates = o.placeUpdates as StateUpdatesPayload['placeUpdates']
    if (Array.isArray(o.characterUpdates)) payload.characterUpdates = o.characterUpdates as StateUpdatesPayload['characterUpdates']
    if (Array.isArray(o.characterLocations)) payload.characterLocations = o.characterLocations as StateUpdatesPayload['characterLocations']
    return payload
  } catch {
    return null
  }
}

/**
 * Applies a single state-updates payload to the store (create places/characters, then apply updates).
 * Uses the same logic as the narrated_story_create and narrated_story_apply_updates tools.
 */
export async function applyStateUpdates(payload: StateUpdatesPayload): Promise<void> {
  const context = createNarratedStoryBrowserContext()

  const places = payload.newPlaces ?? []
  const characters = payload.newCharacters ?? []
  if (places.length > 0 || characters.length > 0) {
    await runNarratedStoryTool(
      'narrated_story_create',
      { places, characters },
      context
    )
  }

  const placeUpdates = payload.placeUpdates ?? []
  const characterUpdates = payload.characterUpdates ?? []
  const characterLocations = payload.characterLocations ?? []
  if (placeUpdates.length > 0 || characterUpdates.length > 0 || characterLocations.length > 0) {
    await runNarratedStoryTool(
      'narrated_story_apply_updates',
      { placeUpdates, characterUpdates, characterLocations },
      context
    )
  }
}
