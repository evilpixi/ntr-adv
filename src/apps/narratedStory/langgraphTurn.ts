/**
 * Ejecuta un turno usando el grafo LangGraph y devuelve NextTurnResult.
 */
import { buildFullSystemPromptForTurn } from './buildPromptForAI'
import { getNarratedStoryGraph } from './langgraph/graph'
import type { NextTurnParams, NextTurnResult } from './runNextTurn'

const DEFAULT_INITIAL = {
  stateBefore: null as null,
  stateAfter: null as null,
  planText: '',
  toolCallsToExecute: [] as Array<{ name: string; args: Record<string, unknown> }>,
  toolCallsExecuted: [] as Array<{ name: string; args: Record<string, unknown> }>,
  delta: null as null,
  events: [] as NextTurnResult['events'],
  narrative: '',
  turnSummary: '',
}

/**
 * Ejecuta un turno con el grafo LangGraph (analyze → executeTools → compare → compose)
 * y devuelve el resultado en el mismo formato que runNextTurn.
 */
export async function runLangGraphTurn(params: NextTurnParams): Promise<NextTurnResult> {
  const fullSystemPrompt = buildFullSystemPromptForTurn({
    playerProfile: params.playerProfile,
    characters: params.characters,
    messages: params.messages,
    places: params.places,
    systemPrompt: params.systemPrompt,
    storyPrompt: params.storyPrompt,
    kinksPrompt: params.kinksPrompt,
    extraIndications: params.extraIndications,
    maxMessages: params.maxMessages,
    language: params.language,
  })

  const initialState = {
    messages: params.messages,
    userMessage: params.userMessage,
    systemPrompt: fullSystemPrompt,
    characters: params.characters,
    places: params.places ?? [],
    ...DEFAULT_INITIAL,
  }

  const graph = getNarratedStoryGraph()
  const result = await graph.invoke(initialState)

  return {
    narrative: result.narrative ?? '',
    events: result.events ?? [],
    turnSummary: result.turnSummary ?? '',
    characters: result.characters ?? params.characters,
    places: result.places ?? params.places ?? [],
  }
}
