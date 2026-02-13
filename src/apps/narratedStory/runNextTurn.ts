/**
 * Ejecuta un turno: construye prompt, llama a la IA, ejecuta tools si las devuelve,
 * parsea respuesta (narrativa, eventos, resumen) y devuelve el mensaje app y estado actualizado.
 */
import { getCurrentPartida } from './saveGameDb'
import { buildFullSystemPromptForTurn } from './buildPromptForAI'
import { parseAppResponse } from './parseAppResponse'
import { createNarratedStoryBrowserContext } from './tools/browserContext'
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

/** Proveedor de IA: recibe systemPrompt + último mensaje usuario y devuelve rawContent + opcionalmente toolCalls. */
export type AIProvider = (params: {
  systemPrompt: string
  userMessage: string
  messages: TurnMessage[]
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
  } = params

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
  })

  const context = createNarratedStoryBrowserContext()
  if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
    console.log('[Narrated Story] Running', aiResponse.toolCalls.length, 'tool call(s):', aiResponse.toolCalls.map((c) => c.name).join(', '))
    for (const call of aiResponse.toolCalls) {
      await runNarratedStoryTool(call.name, call.args, context)
    }
  }

  const parsed = parseAppResponse(aiResponse.rawContent)
  const partida = await getCurrentPartida()
  const updatedCharacters = partida?.characters ?? characters
  const updatedPlaces = partida?.places ?? places ?? []
  console.log('[Narrated Story] Partida after turn: characters=', updatedCharacters.length, 'places=', updatedPlaces.length)

  return {
    narrative: parsed.narrative,
    events: parsed.events,
    turnSummary: parsed.turnSummary,
    characters: updatedCharacters,
    places: updatedPlaces,
  }
}
