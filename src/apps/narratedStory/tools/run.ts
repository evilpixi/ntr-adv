/**
 * Ejecutor de tools solo para la app Narrated Story.
 * Tools: get_state, create (payload único), apply_updates (payload único).
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

      case 'narrated_story_create': {
        const places = args.places as Array<{ placeId?: string; name?: string; description?: string }> | undefined
        const characters = args.characters as Array<Record<string, unknown>> | undefined
        const placesList = Array.isArray(places) ? places : []
        const charactersList = Array.isArray(characters) ? characters : []
        if (placesList.length === 0 && charactersList.length === 0) {
          return { text: JSON.stringify({ ok: true, message: 'Nothing to create.', places: 0, characters: 0 }) }
        }
        for (const p of placesList) {
          const placeId = p?.placeId ?? ''
          const placeName = p?.name ?? ''
          if (!placeId || !placeName) continue
          console.log(`${LOG_PREFIX} create: place ${placeId} ${placeName}`)
          await context.createPlace(placeId, placeName, p?.description)
        }
        for (const c of charactersList) {
          if (!c || typeof c !== 'object') continue
          const id = String(c.id ?? '')
          const charName = String(c.name ?? 'Unknown')
          if (!id) continue
          console.log(`${LOG_PREFIX} create: character ${id} ${charName}`)
          await context.createCharacter(c)
        }
        console.log(`${LOG_PREFIX} create: saved OK places=${placesList.length} characters=${charactersList.length}`)
        return { text: JSON.stringify({ ok: true, message: 'Created.', places: placesList.length, characters: charactersList.length }) }
      }

      case 'narrated_story_apply_updates': {
        const placeUpdates = args.placeUpdates as Array<{ placeId?: string; patch?: Record<string, unknown> }> | undefined
        const characterUpdates = args.characterUpdates as Array<{ characterId?: string; patch?: Record<string, unknown> }> | undefined
        const characterLocations = args.characterLocations as Array<{
          characterId?: string
          placeId?: string | null
          currentActivity?: string
          currentState?: string
        }> | undefined
        const placeList = Array.isArray(placeUpdates) ? placeUpdates : []
        const charUpdatesList = Array.isArray(characterUpdates) ? characterUpdates : []
        const locList = Array.isArray(characterLocations) ? characterLocations : []

        for (const pu of placeList) {
          const placeId = pu?.placeId
          const patch = pu?.patch
          if (placeId == null || !patch || typeof patch !== 'object') continue
          console.log(`${LOG_PREFIX} apply_updates: place ${placeId}`)
          await context.updatePlace(placeId, patch)
        }

        const mergedByChar = new Map<string, Record<string, unknown>>()
        for (const u of charUpdatesList) {
          const cid = u?.characterId
          const patch = u?.patch
          if (cid == null || typeof cid !== 'string' || !patch || typeof patch !== 'object') continue
          const existing = mergedByChar.get(cid) ?? {}
          mergedByChar.set(cid, { ...existing, ...patch })
        }
        for (const loc of locList) {
          const cid = loc?.characterId
          if (cid == null || typeof cid !== 'string') continue
          const existing = mergedByChar.get(cid) ?? {}
          const patch: Record<string, unknown> = { ...existing }
          if (loc.placeId !== undefined) patch.currentPlaceId = loc.placeId === null || loc.placeId === '' ? null : loc.placeId
          if (loc.currentActivity !== undefined) patch.currentActivity = loc.currentActivity
          if (loc.currentState !== undefined) patch.currentState = loc.currentState
          mergedByChar.set(cid, patch)
        }
        const updates = Array.from(mergedByChar.entries()).map(([characterId, patch]) => ({ characterId, patch }))
        if (updates.length > 0) {
          console.log(`${LOG_PREFIX} apply_updates: characters ${updates.length} ids=[${updates.map((u) => u.characterId).join(', ')}]`)
          await context.updateCharacters(updates)
        }
        console.log(`${LOG_PREFIX} apply_updates: saved OK places=${placeList.length} characters=${updates.length}`)
        return { text: JSON.stringify({ ok: true, message: 'Updates applied.', placeUpdates: placeList.length, characterUpdates: updates.length }) }
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
