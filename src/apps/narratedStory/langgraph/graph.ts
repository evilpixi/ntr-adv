/**
 * Grafo LangGraph para un turno: analyze → save state → executeTools → compare → compose.
 */
import { Annotation, StateGraph, START, END } from '@langchain/langgraph'
import { getCurrentPartida } from '../saveGameDb'
import { createNarratedStoryBrowserContext } from '../tools/browserContext'
import { sortToolCallsByCanonicalOrder } from '../tools/definitions'
import { runNarratedStoryTool } from '../tools/run'
import { realAIProvider } from '../aiProviderApi'
import type { Personaje, Place, TurnEvent } from '../types'
import {
  type PartidaSnapshot,
  type StateDelta,
  type ToolCallRequest,
  snapshotPartida,
  computeStateDelta,
} from './state'

// —— State schema for the graph ——
export const NarratedStoryStateAnnotation = Annotation.Root({
  messages: Annotation<Array<{ id: string; role: 'user' | 'app'; content: string }>>(),
  userMessage: Annotation<string>(),
  systemPrompt: Annotation<string>(),
  stateBefore: Annotation<PartidaSnapshot | null>(),
  stateAfter: Annotation<PartidaSnapshot | null>(),
  planText: Annotation<string>(),
  toolCallsToExecute: Annotation<ToolCallRequest[]>(),
  toolCallsExecuted: Annotation<ToolCallRequest[]>(),
  delta: Annotation<StateDelta | null>(),
  events: Annotation<TurnEvent[]>(),
  narrative: Annotation<string>(),
  turnSummary: Annotation<string>(),
  characters: Annotation<Personaje[]>(),
  places: Annotation<Place[]>(),
})

type GraphState = typeof NarratedStoryStateAnnotation.State

/** Nodo analyze: llama al LLM con tools, obtiene plan + tool_calls; guarda stateBefore. */
async function analyzeNode(state: GraphState): Promise<Partial<GraphState>> {
  const apiResponse = await realAIProvider({
    systemPrompt: state.systemPrompt,
    userMessage: state.userMessage,
    messages: state.messages,
    turnNumber: state.messages.filter((m) => m.role === 'user').length,
  })
  const planText = (apiResponse.rawContent ?? '').trim()
  const toolCallsToExecute = sortToolCallsByCanonicalOrder(apiResponse.toolCalls ?? [])

  let stateBefore: PartidaSnapshot | null = null
  const partida = await getCurrentPartida()
  if (partida) {
    stateBefore = snapshotPartida(partida.characters, partida.places ?? [])
  }

  return {
    planText,
    toolCallsToExecute,
    toolCallsExecuted: [],
    stateBefore,
  }
}

/** Nodo executeTools: ejecuta las tools en orden canónico; actualiza stateAfter, characters, places. */
async function executeToolsNode(state: GraphState): Promise<Partial<GraphState>> {
  const calls = state.toolCallsToExecute ?? []
  if (calls.length === 0) {
    const partida = await getCurrentPartida()
    const stateAfter = partida
      ? snapshotPartida(partida.characters, partida.places ?? [])
      : null
    return {
      stateAfter,
      characters: partida?.characters ?? [],
      places: partida?.places ?? [],
      toolCallsExecuted: [],
    }
  }
  const context = createNarratedStoryBrowserContext()
  for (const call of calls) {
    await runNarratedStoryTool(call.name, call.args, context)
  }
  const partida = await getCurrentPartida()
  const stateAfter = partida
    ? snapshotPartida(partida.characters, partida.places ?? [])
    : null
  return {
    stateAfter,
    characters: partida?.characters ?? [],
    places: partida?.places ?? [],
    toolCallsExecuted: calls,
  }
}

/** Nodo compare: calcula delta entre stateBefore y stateAfter. */
function compareNode(state: GraphState): Partial<GraphState> {
  const before = state.stateBefore
  const after = state.stateAfter
  if (!before || !after) {
    return { delta: null }
  }
  const delta = computeStateDelta(before, after)
  return { delta }
}

/** Emojis por tipo de evento para el compose. */
const EMOJI = {
  location: '📍',
  sexual: '🔞',
  newCharacter: '👤',
  newPlace: '🏰',
  stats: '📊',
  default: '•',
} as const

/** Nodo compose: genera events (con emoji), narrative (planText), turnSummary con stats. */
function composeNode(state: GraphState): Partial<GraphState> {
  const planText = state.planText ?? ''
  const delta = state.delta
  const stateAfter = state.stateAfter
  const language = state.systemPrompt.includes('Spanish') || state.systemPrompt.includes('español') ? 'es' : 'en'

  const events: TurnEvent[] = []
  let turnSummary = ''

  if (delta) {
    for (const cd of delta.characterDeltas) {
      if (cd.added) {
        events.push({
          emoji: EMOJI.newCharacter,
          text: language === 'es' ? `${cd.name} se unió a la historia.` : `${cd.name} joined the story.`,
          sexual: false,
        })
      } else if (cd.changes.currentPlaceId !== undefined) {
        const to = cd.changes.currentPlaceId.to as string | undefined
        const placeName = stateAfter?.places?.find((p) => p.id === to)?.name ?? to
        events.push({
          emoji: EMOJI.location,
          text: `${cd.name} → ${placeName ?? to}.`,
          sexual: false,
        })
      } else if (
        cd.changes.corruption !== undefined ||
        cd.changes.sexCount !== undefined ||
        cd.changes.lust !== undefined
      ) {
        events.push({
          emoji: EMOJI.sexual,
          text: language === 'es' ? `${cd.name}: estadísticas actualizadas.` : `${cd.name}: stats updated.`,
          sexual: true,
        })
      } else if (Object.keys(cd.changes).length > 0) {
        events.push({
          emoji: EMOJI.default,
          text: `${cd.name}: ${language === 'es' ? 'actualizado.' : 'updated.'}`,
          sexual: false,
        })
      }
    }
    for (const pd of delta.placeDeltas) {
      if (pd.added) {
        events.push({
          emoji: EMOJI.newPlace,
          text: language === 'es' ? `${pd.name} descubierto.` : `${pd.name} discovered.`,
          sexual: false,
        })
      }
    }

    const statsLines: string[] = []
    const statsTitle = language === 'es' ? '**Stats / Cambios**' : '**Stats / Changes**'
    for (const cd of delta.characterDeltas) {
      const parts: string[] = []
      if (cd.added) parts.push(language === 'es' ? 'nuevo' : 'new')
      for (const [key, change] of Object.entries(cd.changes)) {
        if (key === 'removed') continue
        const from = (change as { from?: unknown }).from
        const to = (change as { to?: unknown }).to
        if (from !== undefined && to !== undefined) {
          parts.push(`${key}: ${JSON.stringify(from)}→${JSON.stringify(to)}`)
        } else if (to !== undefined) {
          parts.push(`${key}: ${JSON.stringify(to)}`)
        }
      }
      if (parts.length) statsLines.push(`- **${cd.name}**: ${parts.join(', ')}`)
    }
    for (const pd of delta.placeDeltas) {
      if (pd.added) statsLines.push(`- **${pd.name}** (place): ${language === 'es' ? 'creado' : 'created'}`)
    }
    if (statsLines.length) {
      turnSummary = [statsTitle, '', ...statsLines].join('\n')
    }
  }

  const narrative = planText || (language === 'es'
    ? '*La situación avanza. Los personajes siguen con sus actividades…*'
    : '*The situation moves forward. The characters continue with their activities…*')

  return {
    events,
    narrative,
    turnSummary: turnSummary || (language === 'es' ? 'Sin cambios registrados.' : 'No recorded changes.'),
  }
}

/** Construye y compila el grafo. */
function buildGraph() {
  const graph = new StateGraph(NarratedStoryStateAnnotation)
    .addNode('analyze', analyzeNode)
    .addNode('executeTools', executeToolsNode)
    .addNode('compare', compareNode)
    .addNode('compose', composeNode)
    .addEdge(START, 'analyze')
    .addEdge('analyze', 'executeTools')
    .addEdge('executeTools', 'compare')
    .addEdge('compare', 'compose')
    .addEdge('compose', END)
  return graph.compile()
}

let compiledGraph: ReturnType<typeof buildGraph> | null = null

/** Devuelve el grafo compilado (singleton). */
export function getNarratedStoryGraph() {
  if (!compiledGraph) compiledGraph = buildGraph()
  return compiledGraph
}
