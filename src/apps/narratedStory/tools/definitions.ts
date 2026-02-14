/**
 * Definiciones de tools solo para la app Narrated Story.
 * La IA del relato solo ve estas tools (no ntr_*, ni cardgame_*).
 */
export interface NarrativeToolDefinition {
  name: string
  description: string
  title?: string
  parameters?: Record<string, { type: string; description?: string }>
}

/** Tools exclusivas de la app narrativa: leer estado, personajes, lugares (actualizar y crear). */
export const NARRATED_STORY_TOOL_DEFINITIONS: NarrativeToolDefinition[] = [
  {
    name: 'narrated_story_get_state',
    description: 'Returns the current partida state: characters (with id, name, role, hp, stats, currentPlaceId, currentActivity, currentState, corruption 0-100, loveRegent 0-100, lust 0-100, sexCount, developedKinks, feelingsToward object), places, placeAdditionalInfo. Use this to read relationship and corruption data.',
    title: 'Get narrated story state',
  },
  {
    name: 'narrated_story_update_character',
    description: 'Update a character: location (currentPlaceId when they move), activity, state, stats, corruption (0-100), sexCount, developedKinks, and feelingsToward (object: other character id -> "love", "lust", "indifference", "attraction", "hatred", etc.). Use every turn to keep the simulation consistent.',
    title: 'Update character',
    parameters: {
      characterId: { type: 'string', description: 'Character id (e.g. "pc", "aria", or an NPC id)' },
      patch: {
        type: 'object',
        description: 'Fields to update: currentPlaceId, currentActivity, currentState, hp, description, corruption (0-100), loveRegent (0-100, love toward player/regent), lust (0-100), sexCount, developedKinks (array), feelingsToward (object: characterId -> string, e.g. { "pc": "love", "kaelen": "indifference" })',
      },
    },
  },
  {
    name: 'narrated_story_update_characters',
    description: 'Update multiple characters at once. Each item: characterId and patch (same fields as update_character). Use to move several characters or update relationships/corruption in one go.',
    title: 'Update multiple characters',
    parameters: {
      updates: {
        type: 'array',
        description: 'List of { characterId: string, patch: object }',
      },
    },
  },
  {
    name: 'narrated_story_set_character_locations',
    description: 'Set where each character is located. Single source of truth: the Character view and Places view both read from this. Each character can only be in one place (or "no location"). Pass an array of { characterId, placeId, currentActivity?, currentState? }. Use placeId = null or omit to set character as having no location. When you set a character to a place, they are removed from their previous place automatically (no duplicates). Call this when characters move or when you create a new place and characters go there.',
    title: 'Set character locations',
    parameters: {
      locations: {
        type: 'array',
        description: 'List of { characterId: string, placeId: string | null, currentActivity?: string, currentState?: string }. Each character appears in exactly one place in the UI; setting placeId updates both the Character tab and the Places tab.',
      },
    },
  },
  {
    name: 'narrated_story_update_place',
    description: 'Update an existing place: name, description, or additionalInfo. Use when a location gains new narrative relevance.',
    title: 'Update place',
    parameters: {
      placeId: { type: 'string', description: 'Place id' },
      patch: {
        type: 'object',
        description: 'name (string), description (string), additionalInfo (string)',
      },
    },
  },
  {
    name: 'narrated_story_create_character',
    description: 'Register a new NPC when they become relevant to the story (e.g. Lysandra, Kaelen). Required: id (slug like "lysandra"), name, role ("npc"). Optional: description, class, race, currentPlaceId, currentActivity, currentState, corruption, sexCount, developedKinks, feelingsToward (e.g. { "sakura": "loyal", "pc": "neutral" }).',
    title: 'Create character',
    parameters: {
      character: {
        type: 'object',
        description: 'id, name, role ("npc"), description, class, race, currentPlaceId, currentActivity, currentState, corruption (0-100), loveRegent (0-100), lust (0-100), sexCount, developedKinks, feelingsToward (object)',
      },
    },
  },
  {
    name: 'narrated_story_create_place',
    description: 'Add a new place when the story mentions it (e.g. road to Emeroth, prince\'s chambers). **In the same turn** you must also call narrated_story_update_character or narrated_story_update_characters for every character who is at that place or moving there in your narrative, setting currentPlaceId to this place\'s id (and currentActivity/currentState). Otherwise the Places view will still show them at the old location.',
    title: 'Create place',
    parameters: {
      placeId: { type: 'string', description: 'Unique id (e.g. "camino-emeroth", "aposentos-principe")' },
      name: { type: 'string', description: 'Display name' },
      description: { type: 'string', description: 'Short description' },
    },
  },
]

export function getNarratedStoryToolDefinition(name: string): NarrativeToolDefinition | undefined {
  return NARRATED_STORY_TOOL_DEFINITIONS.find((t) => t.name === name)
}

/**
 * Orden canónico de ejecución de tools por turno: primero leer estado, luego crear entidades,
 * luego actualizar lugares, luego ubicaciones de personajes, luego actualizaciones de personajes.
 * Las tool calls devueltas por la IA se reordenan según esta lista antes de ejecutarse.
 */
export const NARRATED_STORY_TOOL_ORDER: string[] = [
  'narrated_story_get_state',
  'narrated_story_create_place',
  'narrated_story_create_character',
  'narrated_story_update_place',
  'narrated_story_set_character_locations',
  'narrated_story_update_character',
  'narrated_story_update_characters',
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
