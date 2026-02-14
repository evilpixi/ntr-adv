/**
 * Construye el prompt completo por turno para la IA: prompts definidos + datos del turno
 * (personajes, historial de mensajes) + instrucciones de uso de las tools MCP.
 * Solo se exponen las tools de la app narrativa (NARRATED_STORY_TOOL_DEFINITIONS).
 */
import { NARRATED_STORY_TOOL_DEFINITIONS } from './tools/definitions'
import type { Language } from '@/store/settings'
import {
  type FullPromptParams,
  buildFullPromptForAI,
  getEffectiveSystemPrompt,
} from './defaultSystemPrompt'
import type { Personaje, PlayerProfile, Place } from './types'

/** Mensaje del chat (mismo formato que en App y saveGameDb). */
export interface TurnMessage {
  id: string
  role: 'user' | 'app'
  content: string
}

/** Parámetros para construir el contexto de un turno. */
export interface TurnDataParams {
  playerProfile: PlayerProfile
  characters: Personaje[]
  messages: TurnMessage[]
  /** Lugares de la partida (opcional). */
  places?: Place[]
  /** Máximo de mensajes recientes a incluir (por defecto todos). Reduce tokens si el historial es largo. */
  maxMessages?: number
}

/** Parámetros completos para el system prompt de un turno. */
export interface FullSystemPromptForTurnParams extends FullPromptParams {
  playerProfile: PlayerProfile
  characters: Personaje[]
  messages: TurnMessage[]
  places?: Place[]
  maxMessages?: number
  /** Idioma de la app: la IA debe narrar, el intro y los bloques en este idioma. */
  language?: Language
}

/**
 * Orden lógico de tools que la IA debe seguir cada turno (y que el host aplica al ejecutar).
 * Debe coincidir con NARRATED_STORY_TOOL_ORDER en tools/definitions.ts.
 */
const TOOL_ORDER_INSTRUCTION = [
  '---',
  '## TOOL EXECUTION ORDER (mandatory every turn)',
  '',
  '**You MUST call tools in this exact order.** The host will reorder any other order to this one. Follow it so your reasoning is consistent:',
  '',
  '1. **narrated_story_get_state** – Call at the start of every turn to read the current partida (characters, places, relationships). Use this result to keep the simulation consistent.',
  '2. **narrated_story_create_place** – If the narrative introduces a new location, create it first.',
  '3. **narrated_story_create_character** – If a new NPC appears, register them here.',
  '4. **narrated_story_update_place** – Update existing places (name, description) if needed.',
  '5. **narrated_story_set_character_locations** – Set where each character is (single source of truth for Character and Places views). Call whenever someone moves or you created a new place and characters are there.',
  '6. **narrated_story_update_character** / **narrated_story_update_characters** – Update stats, corruption, feelingsToward, activity, state, etc. Do this after locations so movement is already applied.',
  '',
  'Summary: read state → create new places/characters → update places → set locations → update character data.',
  '',
].join('\n')

/**
 * Genera el texto que explica a la IA qué tools tiene disponibles (solo las de la app narrativa) y cómo usarlas.
 * Se incluye en el system prompt en cada turno.
 */
export function getMCPInstructionsForNarratedStory(): string {
  const tools = NARRATED_STORY_TOOL_DEFINITIONS
  if (tools.length === 0) return ''

  const lines: string[] = [
    '---',
    '## MCP TOOLS (how to use them)',
    '',
    'You have access to the following tools. Call them when you need to read or update game state.',
    'The host will execute the tool and give you the result. Use the result to continue the narrative.',
    '**Always write your narrative text first (or together with tool calls); never send a response that contains only tool calls and no story text.**',
    '',
    TOOL_ORDER_INSTRUCTION,
    '',
  ]

  for (const t of tools) {
    lines.push(`### ${t.name}`)
    lines.push(t.description)
    if (t.parameters && Object.keys(t.parameters).length > 0) {
      const params = Object.entries(t.parameters)
        .map(([key, { type, description }]) => `  - \`${key}\` (${type})${description ? `: ${description}` : ''}`)
        .join('\n')
      lines.push('Parameters:', params, '')
    } else {
      lines.push('Parameters: none.', '')
    }
  }

  return lines.join('\n')
}

/**
 * Instrucciones para mantener la simulación: registrar NPCs, lugares y actualizar estado.
 */
export function getSimulationInstructions(): string {
  return [
    '---',
    '## SIMULATION UPDATES (use tools every turn)',
    '',
    '0) **Every turn**: Start by calling narrated_story_get_state to read the current partida. Then call the other tools in the order defined in "TOOL EXECUTION ORDER" above (create place/character if needed, then set_character_locations, then update_character/update_characters).',
    '',
    '1) New NPCs: When an interesting character appears (e.g. Lysandra, Captain Kaelen), register them with narrated_story_create_character (id = slug like "lysandra", role = "npc"). Set currentPlaceId and feelingsToward as appropriate.',
    '',
    '2) New places: When a location is mentioned (road to Emeroth, prince\'s chambers, etc.), create it with narrated_story_create_place. **If any character is at that place in your narrative (they went there, arrived there, or are there), you MUST in the same turn call narrated_story_update_character or narrated_story_update_characters** and set currentPlaceId to the new place id (and currentActivity/currentState) for each of those characters. Otherwise the Places view will still show them at the old location.',
    '',
    '3) Movement: **Whenever your narrative has characters in a location or moving to a location**, use narrated_story_set_character_locations with a list of { characterId, placeId, currentActivity?, currentState? }. This is the single source of truth: the Character tab and the Places tab both read from it, so there are no duplicates—each character appears in exactly one place. If you created a place (e.g. "Camino a Emeroth") and the party is going there, call set_character_locations for each character with that placeId. Alternatively you can use update_character/update_characters with currentPlaceId.',
    '',
    '4) Relationships and corruption: Update feelingsToward when relationships shift (e.g. Aria feels "indifference" toward "kaelen" at first; later "attraction" or "fear"). Update corruption (0-100), sexCount, and developedKinks after sexual events.',
    '',
  ].join('\n')
}

/**
 * Instrucciones para el formato de salida: eventos del turno y resumen.
 * La IA debe incluir al final de cada respuesta (opcional pero recomendado) dos bloques.
 */
export function getOutputFormatInstructions(): string {
  return [
    '---',
    '## OUTPUT FORMAT (end of each reply)',
    '',
    '**CRITICAL: You MUST always write narrative text in your response.** Never reply with only tool calls. Every turn must contain at least one paragraph (or several) of story text describing what happens in the scene. Tool calls (e.g. narrated_story_update_character) are in addition to the narrative, not a replacement. The player must always read a descriptive reply.',
    '',
    'Keep the main narrative to a moderate length: 4–6 paragraphs per reply (or more when the scene deserves it). Be descriptive and immersive; avoid being too brief.',
    '',
    'At the end of your reply you MAY include two optional code blocks:',
    '',
    '1) EVENTS: a JSON array of short phrases. For sexual events set "sexual": true. Format:',
    '   ```events',
    '   [{"text": "Short event phrase", "sexual": true/false}, ...]',
    '   ```',
    '',
    '2) TURN SUMMARY: short bullet points of what changed (locations, relationships, key facts). Format:',
    '   ```turn_summary',
    '   - Character: change.',
    '   ```',
    '',
  ].join('\n')
}

/**
 * Serializa el estado actual del juego para inyectarlo en el prompt (personajes + historial de chat).
 */
export function buildTurnDataBlock(params: TurnDataParams): string {
  const { playerProfile, characters, messages, places, maxMessages } = params
  const recentMessages = maxMessages != null
    ? messages.slice(-maxMessages)
    : messages

  const parts: string[] = [
    '---',
    '## CURRENT TURN DATA',
    '',
    '### Player profile (noble)',
    JSON.stringify(sanitizePlayerProfileForPrompt(playerProfile), null, 2),
    '',
    '### Characters (player + heroines/NPCs)',
    JSON.stringify(characters.map(sanitizeCharacterForPrompt), null, 2),
    '',
  ]
  if (places && places.length > 0) {
    parts.push('### Places', JSON.stringify(places.map((p) => ({ id: p.id, name: p.name, description: p.description })), null, 2), '')
  }
  parts.push('### Conversation so far (oldest to newest)')

  if (recentMessages.length === 0) {
    parts.push('(No messages yet.)')
  } else {
    for (const m of recentMessages) {
      const label = m.role === 'user' ? 'Player' : 'Narrator'
      parts.push(`**${label}:** ${m.content}`, '')
    }
  }

  parts.push('')
  return parts.join('\n')
}

function sanitizePlayerProfileForPrompt(p: PlayerProfile): Record<string, unknown> {
  return {
    name: p.name,
    gender: p.gender,
    genitalia: p.genitalia,
    penisSize: p.penisSize,
    bustSize: p.bustSize,
    nobleTitle: p.nobleTitle,
    appearanceDescription: p.appearanceDescription,
    governingStyle: p.governingStyle,
  }
}

function sanitizeCharacterForPrompt(c: Personaje): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    role: c.role,
    hp: c.hp,
    fuerza: c.fuerza,
    agilidad: c.agilidad,
    inteligencia: c.inteligencia,
    carisma: c.carisma,
    description: c.description,
    class: c.class,
    race: c.race,
    gender: c.gender,
    genitalia: c.genitalia,
    penisSize: c.penisSize,
    bustSize: c.bustSize,
    nobleTitle: c.nobleTitle,
    currentPlaceId: c.currentPlaceId,
    currentActivity: c.currentActivity,
    currentState: c.currentState,
    corruption: c.corruption,
    loveRegent: c.loveRegent,
    lust: c.lust,
    sexCount: c.sexCount,
    developedKinks: c.developedKinks,
    feelingsToward: c.feelingsToward,
  }
}

/**
 * Instrucción de idioma para que la IA narre y responda en el idioma de la app.
 */
export function getLanguageInstruction(language: Language): string {
  const langName = language === 'es' ? 'Spanish' : 'English'
  return [
    '---',
    '## LANGUAGE',
    '',
    `Write all your replies in ${langName}. This includes: the main narrative, the opening intro when requested, the text inside the events block (the "text" field of each event), and the turn_summary block. The user interface is in ${langName}; keep the story and all output in the same language.`,
    '',
  ].join('\n')
}

/**
 * Construye el system prompt completo para un turno: idioma + instrucciones base + story + kinks + extra
 * + instrucciones MCP + datos actuales (perfil, personajes, conversación).
 */
export function buildFullSystemPromptForTurn(params: FullSystemPromptForTurnParams): string {
  const basePrompt = buildFullPromptForAI({
    systemPrompt: getEffectiveSystemPrompt(params.systemPrompt),
    storyPrompt: params.storyPrompt.trim(),
    kinksPrompt: params.kinksPrompt.trim(),
    extraIndications: params.extraIndications.trim(),
  })

  const mcpBlock = getMCPInstructionsForNarratedStory()
  const simulationBlock = getSimulationInstructions()
  const outputFormatBlock = getOutputFormatInstructions()
  const turnDataBlock = buildTurnDataBlock({
    playerProfile: params.playerProfile,
    characters: params.characters,
    messages: params.messages,
    places: params.places,
    maxMessages: params.maxMessages,
  })

  const parts: string[] = [basePrompt]
  if (params.language) parts.push(getLanguageInstruction(params.language))
  if (mcpBlock) parts.push(mcpBlock)
  parts.push(simulationBlock)
  parts.push(outputFormatBlock)
  parts.push(turnDataBlock)
  return parts.join('\n\n')
}
