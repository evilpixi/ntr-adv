/**
 * Definición de tools en formato OpenAI para el chat de Narrated Story.
 * Debe coincidir con lo que esperan los proveedores compatibles con OpenAI.
 */
export const NARRATED_STORY_OPENAI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'narrated_story_update_character',
      description:
        'Update a character: location, activity, state, stats, corruption (0-100), loveRegent (0-100), lust (0-100), sexCount, developedKinks, feelingsToward.',
      parameters: {
        type: 'object' as const,
        properties: {
          characterId: { type: 'string' as const, description: 'Character id' },
          patch: { type: 'object' as const, description: 'Fields to update' },
        },
        required: ['characterId', 'patch'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'narrated_story_update_characters',
      description: 'Update multiple characters at once.',
      parameters: {
        type: 'object' as const,
        properties: {
          updates: { type: 'array' as const, description: 'List of { characterId, patch }' },
        },
        required: ['updates'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'narrated_story_set_character_locations',
      description:
        "Set each character's location (placeId). Single source of truth for Character view and Places view. Each character in exactly one place; use placeId null for no location. Params: locations = [{ characterId, placeId, currentActivity?, currentState? }].",
      parameters: {
        type: 'object' as const,
        properties: {
          locations: {
            type: 'array' as const,
            description: 'List of { characterId, placeId (string or null), currentActivity?, currentState? }',
          },
        },
        required: ['locations'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'narrated_story_update_place',
      description: 'Update an existing place.',
      parameters: {
        type: 'object' as const,
        properties: {
          placeId: { type: 'string' as const },
          patch: { type: 'object' as const },
        },
        required: ['placeId', 'patch'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'narrated_story_create_character',
      description:
        'Register a new NPC when they become relevant (e.g. Kaelen, Lord Silas, Lysandra). Required: id (slug), name, role "npc".',
      parameters: {
        type: 'object' as const,
        properties: {
          character: {
            type: 'object' as const,
            description:
              'id, name, role ("npc"), description, class, race, currentPlaceId, currentActivity, currentState, corruption (0-100), loveRegent (0-100), lust (0-100), sexCount, developedKinks, feelingsToward (object)',
          },
        },
        required: ['character'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'narrated_story_create_place',
      description:
        'Add a new place when the story mentions it. In the same turn you must also call update_character or update_characters for every character who is at that place or moving there, setting currentPlaceId to this place id.',
      parameters: {
        type: 'object' as const,
        properties: {
          placeId: { type: 'string' as const },
          name: { type: 'string' as const },
          description: { type: 'string' as const },
        },
        required: ['placeId', 'name'],
      },
    },
  },
]
