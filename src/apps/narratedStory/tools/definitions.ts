/**
 * Definiciones de tools solo para la app Narrated Story.
 * Flujo: get_state → create (un payload) → apply_updates (un payload).
 */
export interface NarrativeToolDefinition {
  name: string
  description: string
  title?: string
  parameters?: Record<string, { type: string; description?: string }>
}

/** Tools: leer estado, crear entidades en bloque, aplicar actualizaciones en bloque. */
export const NARRATED_STORY_TOOL_DEFINITIONS: NarrativeToolDefinition[] = [
  {
    name: 'narrated_story_get_state',
    description: 'Returns the current partida state: characters (id, name, role, hp, stats, currentPlaceId, currentActivity, currentState, corruption 0-100, loveRegent 0-100, lust 0-100, sexCount, developedKinks, feelingsToward), places, placeAdditionalInfo. Call at the start of every turn.',
    title: 'Get narrated story state',
  },
  {
    name: 'narrated_story_create',
    description: 'Create all new entities for this turn in one call. Pass arrays of places and/or characters to create. Places: placeId, name, description (optional). Characters: id, name, role "npc", optional description, class, race. Do not set location or stats here; use apply_updates in the same turn.',
    title: 'Create places and characters',
    parameters: {
      places: {
        type: 'array',
        description: 'Optional. List of { placeId: string, name: string, description?: string }',
      },
      characters: {
        type: 'array',
        description: 'Optional. List of { id: string, name: string, role: "npc", description?: string, class?: string, race?: string }',
      },
    },
  },
  {
    name: 'narrated_story_apply_updates',
    description: 'Apply all updates for this turn in one call: place updates, character updates (stats, corruption, feelingsToward, etc.), and character locations (where each character is). Single source of truth for Character and Places views.',
    title: 'Apply updates',
    parameters: {
      placeUpdates: {
        type: 'array',
        description: 'Optional. List of { placeId: string, patch: { name?, description?, additionalInfo? } }',
      },
      characterUpdates: {
        type: 'array',
        description: 'Optional. List of { characterId: string, patch: object } with currentPlaceId, currentActivity, currentState, hp, corruption (0-100), loveRegent, lust, sexCount, developedKinks, feelingsToward, etc.',
      },
      characterLocations: {
        type: 'array',
        description: 'Optional. List of { characterId: string, placeId: string | null, currentActivity?, currentState? }. Each character in exactly one place.',
      },
    },
  },
]

export function getNarratedStoryToolDefinition(name: string): NarrativeToolDefinition | undefined {
  return NARRATED_STORY_TOOL_DEFINITIONS.find((t) => t.name === name)
}

/** Orden canónico: leer estado → crear → aplicar actualizaciones. */
export const NARRATED_STORY_TOOL_ORDER: string[] = [
  'narrated_story_get_state',
  'narrated_story_create',
  'narrated_story_apply_updates',
]

export function sortToolCallsByCanonicalOrder(
  calls: Array<{ name: string; args: Record<string, unknown> }>
): Array<{ name: string; args: Record<string, unknown> }> {
  const order = NARRATED_STORY_TOOL_ORDER
  const indexOf = (name: string) => {
    const i = order.indexOf(name)
    return i === -1 ? order.length : i
  }
  return [...calls].sort((a, b) => indexOf(a.name) - indexOf(b.name))
}
