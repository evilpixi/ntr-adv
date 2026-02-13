/**
 * Definiciones de tools: nombre, descripción y parámetros (JSON Schema).
 * Sirve para MCP, para OpenAI/LLM (tools en la llamada) y para runTool.
 */
export interface ToolParameter {
  type: 'string' | 'number' | 'object' | 'array' | 'boolean'
  description?: string
  /** Para type object, propiedades. */
  properties?: Record<string, { type: string; description?: string }>
}

export interface ToolDefinition {
  name: string
  description: string
  title?: string
  /** JSON Schema properties para los argumentos. Sin parameters = sin args. */
  parameters?: Record<string, { type: string; description?: string }>
}

/** Tools globales: shell + cardgame. Las de Narrated Story están en src/apps/narratedStory/. */
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'ntr_list_apps',
    description: 'Lista todas las apps disponibles en NTR Adventure (narrated-story, cardgame, classic, data-library).',
    title: 'List NTR apps',
  },
  {
    name: 'ntr_get_app_info',
    description: 'Obtiene la información (manifest) de una app por su id.',
    title: 'Get NTR app info',
    parameters: {
      appId: { type: 'string', description: 'Id de la app (ej: narrated-story, cardgame)' },
    },
  },
  {
    name: 'ntr_list_app_tools',
    description: 'Lista los nombres y descripciones de las tools disponibles para una app.',
    title: 'List tools for an NTR app',
    parameters: {
      appId: { type: 'string', description: 'Id de la app' },
    },
  },
  {
    name: 'cardgame_list_decks',
    description: 'Lista los mazos guardados para Card Game.',
    title: 'List Card Game decks',
  },
  {
    name: 'cardgame_read_deck',
    description: 'Lee el contenido de un mazo por nombre.',
    title: 'Read Card Game deck',
    parameters: {
      deckName: { type: 'string', description: 'Nombre del mazo' },
    },
  },
  {
    name: 'cardgame_write_deck',
    description: 'Escribe un mazo (JSON) con cards, places, etc.',
    title: 'Write Card Game deck',
    parameters: {
      deckName: { type: 'string', description: 'Nombre del mazo' },
      deckJson: { type: 'object', description: 'Objeto del mazo (cards, places, etc.)' },
    },
  },
]

/** Formato OpenAI: array de { type: "function", function: { name, description, parameters } }. */
export function getOpenAIToolsFormat(): Array<{
  type: 'function'
  function: {
    name: string
    description: string
    parameters: { type: 'object'; properties?: Record<string, unknown>; required?: string[] }
  }
}> {
  return TOOL_DEFINITIONS.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters:
        t.parameters && Object.keys(t.parameters).length > 0
          ? {
              type: 'object' as const,
              properties: t.parameters as Record<string, unknown>,
              required: Object.keys(t.parameters),
            }
          : { type: 'object' as const },
    },
  }))
}

export function getToolDefinition(name: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.name === name)
}
