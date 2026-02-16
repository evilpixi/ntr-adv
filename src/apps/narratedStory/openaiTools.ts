/**
 * Tools for normal turns: get_state, create, apply_updates.
 */
export const NARRATED_STORY_OPENAI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'narrated_story_get_state',
      description:
        'Returns the current partida state: characters (id, name, role, hp, stats, currentPlaceId, currentActivity, currentState, corruption 0-100, loveRegent 0-100, lust 0-100, sexCount, developedKinks, feelingsToward), places, placeAdditionalInfo. Call at the start of every turn.',
      parameters: { type: 'object' as const, properties: {}, required: [] as string[] },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'narrated_story_create',
      description:
        'Create all new places and/or characters for this turn in one payload. Provide places array and/or characters array. Then use narrated_story_apply_updates in the same turn to set locations and stats.',
      parameters: {
        type: 'object' as const,
        properties: {
          places: {
            type: 'array' as const,
            description: 'Optional. [{ placeId, name, description? }]',
            items: {
              type: 'object' as const,
              properties: {
                placeId: { type: 'string' as const },
                name: { type: 'string' as const },
                description: { type: 'string' as const },
              },
              required: ['placeId', 'name'],
            },
          },
          characters: {
            type: 'array' as const,
            description: 'Optional. [{ id, name, role "npc", description?, class?, race? }]',
            items: {
              type: 'object' as const,
              properties: {
                id: { type: 'string' as const },
                name: { type: 'string' as const },
                role: { type: 'string' as const },
                description: { type: 'string' as const },
                class: { type: 'string' as const },
                race: { type: 'string' as const },
              },
              required: ['id', 'name'],
            },
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'narrated_story_apply_updates',
      description:
        'Apply all updates for this turn in one payload: placeUpdates, characterUpdates (stats, corruption, feelingsToward, etc.), characterLocations (where each character is). Single source of truth for UI.',
      parameters: {
        type: 'object' as const,
        properties: {
          placeUpdates: {
            type: 'array' as const,
            description: 'Optional. [{ placeId, patch: { name?, description?, additionalInfo? } }]',
            items: {
              type: 'object' as const,
              properties: {
                placeId: { type: 'string' as const },
                patch: { type: 'object' as const },
              },
              required: ['placeId', 'patch'],
            },
          },
          characterUpdates: {
            type: 'array' as const,
            description: 'Optional. [{ characterId, patch }] with currentPlaceId, corruption, loveRegent, lust, sexCount, developedKinks, feelingsToward, etc.',
            items: {
              type: 'object' as const,
              properties: {
                characterId: { type: 'string' as const },
                patch: { type: 'object' as const },
              },
              required: ['characterId', 'patch'],
            },
          },
          characterLocations: {
            type: 'array' as const,
            description: 'Optional. [{ characterId, placeId (string or null), currentActivity?, currentState? }]',
            items: {
              type: 'object' as const,
              properties: {
                characterId: { type: 'string' as const },
                placeId: { type: 'string' as const },
                currentActivity: { type: 'string' as const },
                currentState: { type: 'string' as const },
              },
              required: ['characterId'],
            },
          },
        },
        required: [],
      },
    },
  },
]
