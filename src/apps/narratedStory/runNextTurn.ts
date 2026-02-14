/**
 * Ejecuta un turno: construye prompt, llama a la IA, ejecuta tools si las devuelve,
 * parsea respuesta (narrativa, eventos, resumen) y devuelve el mensaje app y estado actualizado.
 */
import { getCurrentPartida } from './saveGameDb'
import { buildFullSystemPromptForTurn } from './buildPromptForAI'
import { parseAppResponse } from './parseAppResponse'
import { createNarratedStoryBrowserContext } from './tools/browserContext'
import { sortToolCallsByCanonicalOrder } from './tools/definitions'
import { runNarratedStoryTool } from './tools/run'
import type { Language } from '@/store/settings'
import type { PlayerProfile, Personaje, Place } from './types'
import type { TurnEvent } from './types'

export interface TurnMessage {
  id: string
  role: 'user' | 'app'
  content: string
}

export interface NextTurnParams {
  userMessage: string
  playerProfile: PlayerProfile
  characters: Personaje[]
  messages: TurnMessage[]
  places?: Place[]
  systemPrompt: string
  storyPrompt: string
  kinksPrompt: string
  extraIndications: string
  maxMessages?: number
  /** Idioma de la app: la IA narrará en este idioma. */
  language?: Language
  /** Número de turno actual (1-based). Se guarda con la partida y se incrementa al completar. */
  turnNumber: number
}

/** Llamada a tool que la IA pide ejecutar. */
export interface ToolCallRequest {
  name: string
  args: Record<string, unknown>
}

/** Respuesta bruta de la IA (mock o API). */
export interface AIResponse {
  /** Texto completo de la respuesta (puede incluir bloques ```events y ```turn_summary). */
  rawContent: string
  /** Tools a ejecutar en orden (opcional). */
  toolCalls?: ToolCallRequest[]
}

/** Proveedor de IA: recibe systemPrompt + mensajes + número de turno y devuelve rawContent + opcionalmente toolCalls. */
export type AIProvider = (params: {
  systemPrompt: string
  userMessage: string
  messages: TurnMessage[]
  /** Número de turno (1-based). Opcional; si no se pasa se infiere de messages (ej. intro usa 0). */
  turnNumber?: number
}) => Promise<AIResponse>

export interface NextTurnResult {
  /** Narrativa ya limpia (sin bloques events/turn_summary). */
  narrative: string
  /** Eventos del turno. */
  events: TurnEvent[]
  /** Resumen del turno. */
  turnSummary: string
  /** Personajes tras ejecutar tools (si se ejecutaron y hay partida). */
  characters: Personaje[]
  /** Lugares tras ejecutar tools. */
  places: Place[]
}

/**
 * Ejecuta un turno completo: prompt → IA → ejecutar tools → parsear respuesta → devolver resultado.
 */
export async function runNextTurn(
  params: NextTurnParams,
  aiProvider: AIProvider
): Promise<NextTurnResult> {
  const {
    userMessage,
    playerProfile,
    characters,
    messages,
    places,
    systemPrompt,
    storyPrompt,
    kinksPrompt,
    extraIndications,
    maxMessages,
    language,
    turnNumber,
  } = params

  // Banner visible en consola del frontend (colores y negrita)
  const turnLabel = `==================[ TURNO ${turnNumber} ]=================`
  console.log(
    `%c${turnLabel}`,
    'font-weight: bold; color: #0ea5e9; font-size: 14px; background: #1e293b; padding: 4px 8px; border-radius: 4px;'
  )

  const fullSystemPrompt = buildFullSystemPromptForTurn({
    playerProfile,
    characters,
    messages,
    places,
    systemPrompt,
    storyPrompt,
    kinksPrompt,
    extraIndications,
    maxMessages,
    language,
  })

  const aiResponse = await aiProvider({
    systemPrompt: fullSystemPrompt,
    userMessage,
    messages,
    turnNumber,
  })

  const hasToolCalls = Array.isArray(aiResponse.toolCalls) && aiResponse.toolCalls.length > 0
  if (!hasToolCalls) {
    console.log('[Narrated Story] turn=', turnNumber, 'No MCP tool calls from AI this turn (toolCalls=', aiResponse.toolCalls === undefined ? 'undefined' : aiResponse.toolCalls === null ? 'null' : '[]', ')')
  }
  console.log('[Narrated Story] turn=', turnNumber, 'AI rawContent length=', (aiResponse.rawContent ?? '').length, 'preview=', JSON.stringify((aiResponse.rawContent ?? '').slice(0, 100)))

  const context = createNarratedStoryBrowserContext()
  const rawToolCalls = aiResponse.toolCalls ?? []
  const toolCalls = sortToolCallsByCanonicalOrder(rawToolCalls)
  if (toolCalls.length > 0) {
    console.log('[Narrated Story] turn=', turnNumber, 'Running', toolCalls.length, 'tool call(s) (canonical order):', toolCalls.map((c) => c.name).join(', '))
    for (let i = 0; i < toolCalls.length; i++) {
      const call = toolCalls[i]
      console.log('[Narrated Story] turn=', turnNumber, 'tool[', i, ']', call.name, 'payload=', JSON.stringify(call.args))
      await runNarratedStoryTool(call.name, call.args, context)
    }
  }

  const parsed = parseAppResponse(aiResponse.rawContent ?? '')
  const partida = await getCurrentPartida()
  const updatedCharacters = partida?.characters ?? characters
  const updatedPlaces = partida?.places ?? places ?? []
  console.log('[Narrated Story] turn=', turnNumber, 'Partida after turn: characters=', updatedCharacters.length, 'places=', updatedPlaces.length)

  const hasNarrative = Boolean(parsed.narrative && parsed.narrative.trim())
  const narrative =
    hasNarrative
      ? (parsed.narrative ?? '').trim()
      : (language === 'es'
          ? '*La situación avanza. Los personajes siguen con sus actividades…*'
          : '*The situation moves forward. The characters continue with their activities…*')
  if (!hasNarrative) {
    console.warn('[Narrated Story] turn=', turnNumber, 'AI returned empty narrative; using fallback text. Consider reinforcing prompt so the model always returns story text.')
  }

  return {
    narrative,
    events: parsed.events,
    turnSummary: parsed.turnSummary,
    characters: updatedCharacters,
    places: updatedPlaces,
  }
}
