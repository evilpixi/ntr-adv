/**
 * Ejecutor de tools solo para la app Narrated Story.
 * Usar en cada turno de la IA o desde el MCP cuando el contexto sea de partida narrativa.
 */
import type { NarratedStoryToolContext } from './context'
import { getNarratedStoryToolDefinition } from './definitions'

export interface ToolResult {
  text: string
  isError?: boolean
}

export async function runNarratedStoryTool(
  name: string,
  args: Record<string, unknown>,
  context: NarratedStoryToolContext
): Promise<ToolResult> {
  const argsKeys = args && typeof args === 'object' ? Object.keys(args) : []
  console.log('[Narrated Story MCP] runNarratedStoryTool called: name=', name, 'argsKeys=', argsKeys.join(', ') || '(none)', 'payload=', JSON.stringify(args ?? {}))
  const def = getNarratedStoryToolDefinition(name)
  if (!def) {
    console.warn('[Narrated Story MCP] unknown tool:', name)
    return { text: JSON.stringify({ error: `Unknown narrated story tool: ${name}` }), isError: true }
  }

  const LOG_PREFIX = '[Narrated Story MCP]'

  try {
    switch (name) {
      case 'narrated_story_get_state': {
        if (!context.getPartida) {
          return { text: JSON.stringify({ error: 'getPartida not available in this context' }), isError: true }
        }
        const partida = await context.getPartida()
        if (!partida) {
          console.log(`${LOG_PREFIX} get_state: no partida`)
          return { text: JSON.stringify({ error: 'No partida loaded', characters: [], places: [] }), isError: false }
        }
        console.log(`${LOG_PREFIX} get_state: characters=${partida.characters?.length ?? 0} places=${partida.places?.length ?? 0}`)
        return { text: JSON.stringify(partida) }
      }
      case 'narrated_story_update_character': {
        const characterId = args.characterId as string | undefined
        const patch = args.patch as Record<string, unknown> | undefined
        if (characterId == null) return { text: JSON.stringify({ error: 'Missing characterId' }), isError: true }
        if (!patch || typeof patch !== 'object') return { text: JSON.stringify({ error: 'Missing or invalid patch' }), isError: true }
        const patchKeys = Object.keys(patch).filter((k) => patch[k] !== undefined)
        console.log(`${LOG_PREFIX} update_character: characterId=${characterId} patch keys=[${patchKeys.join(', ')}]`)
        await context.updateCharacter(characterId, patch)
        console.log(`${LOG_PREFIX} update_character: saved OK`)
        return { text: JSON.stringify({ ok: true, message: 'Character updated.' }) }
      }
      case 'narrated_story_update_characters': {
        const updates = args.updates as Array<{ characterId: string; patch: Record<string, unknown> }> | undefined
        if (!Array.isArray(updates)) return { text: JSON.stringify({ error: 'Missing or invalid updates array' }), isError: true }
        console.log(`${LOG_PREFIX} update_characters: count=${updates.length} ids=[${updates.map((u) => u.characterId).join(', ')}]`)
        await context.updateCharacters(updates)
        console.log(`${LOG_PREFIX} update_characters: saved OK`)
        return { text: JSON.stringify({ ok: true, message: 'Characters updated.', count: updates.length }) }
      }
      case 'narrated_story_set_character_locations': {
        const locations = args.locations as Array<{
          characterId: string
          placeId?: string | null
          currentActivity?: string
          currentState?: string
        }> | undefined
        if (!Array.isArray(locations)) return { text: JSON.stringify({ error: 'Missing or invalid locations array' }), isError: true }
        const updates = locations.map((loc) => {
          const characterId = loc.characterId
          if (characterId == null || typeof characterId !== 'string') {
            return null
          }
          const patch: Record<string, unknown> = {}
          if (loc.placeId !== undefined) {
            patch.currentPlaceId = loc.placeId === null || loc.placeId === '' ? null : loc.placeId
          }
          if (loc.currentActivity !== undefined) patch.currentActivity = loc.currentActivity
          if (loc.currentState !== undefined) patch.currentState = loc.currentState
          return { characterId, patch }
        }).filter((u): u is { characterId: string; patch: Record<string, unknown> } => u !== null && Object.keys(u.patch).length > 0)
        if (updates.length === 0) {
          return { text: JSON.stringify({ error: 'No valid location updates (need characterId and at least placeId, currentActivity, or currentState)' }), isError: true }
        }
        console.log(`${LOG_PREFIX} set_character_locations: count=${updates.length} ids=[${updates.map((u) => u.characterId).join(', ')}]`)
        await context.updateCharacters(updates)
        console.log(`${LOG_PREFIX} set_character_locations: saved OK (single source: Character view and Places view will show same data)`)
        return { text: JSON.stringify({ ok: true, message: 'Character locations updated. No duplicates: each character is in exactly one place.', count: updates.length }) }
      }
      case 'narrated_story_update_place': {
        const placeId = args.placeId as string | undefined
        const patch = args.patch as Record<string, unknown> | undefined
        if (placeId == null) return { text: JSON.stringify({ error: 'Missing placeId' }), isError: true }
        if (!patch || typeof patch !== 'object') return { text: JSON.stringify({ error: 'Missing or invalid patch' }), isError: true }
        console.log(`${LOG_PREFIX} update_place: placeId=${placeId} patch keys=[${Object.keys(patch).join(', ')}]`)
        await context.updatePlace(placeId, patch)
        console.log(`${LOG_PREFIX} update_place: saved OK`)
        return { text: JSON.stringify({ ok: true, message: 'Place updated.' }) }
      }
      case 'narrated_story_create_character': {
        const character = args.character as Record<string, unknown> | undefined
        if (!character || typeof character !== 'object') return { text: JSON.stringify({ error: 'Missing or invalid character' }), isError: true }
        const id = String(character.id ?? '')
        const charName = String(character.name ?? 'Unknown')
        console.log(`${LOG_PREFIX} create_character: id=${id} name=${charName} role=${character.role ?? 'npc'}`)
        await context.createCharacter(character)
        console.log(`${LOG_PREFIX} create_character: saved OK`)
        return { text: JSON.stringify({ ok: true, message: 'Character created.' }) }
      }
      case 'narrated_story_create_place': {
        const placeId = args.placeId as string | undefined
        const placeName = args.name as string | undefined
        const description = args.description as string | undefined
        if (placeId == null) return { text: JSON.stringify({ error: 'Missing placeId' }), isError: true }
        if (placeName == null) return { text: JSON.stringify({ error: 'Missing name' }), isError: true }
        console.log(`${LOG_PREFIX} create_place: placeId=${placeId} name=${placeName}`)
        await context.createPlace(placeId, placeName, description)
        console.log(`${LOG_PREFIX} create_place: saved OK`)
        return { text: JSON.stringify({ ok: true, message: 'Place created.' }) }
      }
      default:
        return { text: JSON.stringify({ error: `Unhandled tool: ${name}` }), isError: true }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { text: JSON.stringify({ error: message }), isError: true }
  }
}

export async function runNarratedStoryTools(
  calls: Array<{ name: string; args: Record<string, unknown> }>,
  context: NarratedStoryToolContext
): Promise<ToolResult[]> {
  const results: ToolResult[] = []
  for (const { name, args } of calls) {
    results.push(await runNarratedStoryTool(name, args ?? {}, context))
  }
  return results
}
