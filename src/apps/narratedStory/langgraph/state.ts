/**
 * Estado del grafo LangGraph y cálculo de delta entre snapshots.
 */
import type { Personaje, Place, TurnEvent } from '../types'

/** Una tool call a ejecutar (nombre + argumentos). */
export interface ToolCallRequest {
  name: string
  args: Record<string, unknown>
}

/** Estado compartido del grafo por turno. */
export interface NarratedStoryGraphState {
  /** Mensajes de conversación para el LLM (historial). */
  messages: Array<{ id: string; role: 'user' | 'app'; content: string }>
  /** Mensaje del usuario de este turno. */
  userMessage: string
  /** Snapshot de partida antes de ejecutar tools. */
  stateBefore: PartidaSnapshot | null
  /** Snapshot de partida después de ejecutar tools. */
  stateAfter: PartidaSnapshot | null
  /** Texto plan generado en analyze ("qué va a pasar"). */
  planText: string
  /** Tool calls a ejecutar (del modelo). */
  toolCallsToExecute: ToolCallRequest[]
  /** Tool calls ya ejecutadas (para trazas). */
  toolCallsExecuted: ToolCallRequest[]
  /** Delta calculado entre stateBefore y stateAfter. */
  delta: StateDelta | null
  /** Eventos del turno (con emoji opcional). */
  events: TurnEvent[]
  /** Narrativa final para el chat. */
  narrative: string
  /** Resumen del turno con stats (markdown). */
  turnSummary: string
  /** Personajes actualizados (para devolver a la app). */
  characters: Personaje[]
  /** Lugares actualizados (para devolver a la app). */
  places: Place[]
}

/** Snapshot serializable de partida (personajes + lugares) para comparación. */
export interface PartidaSnapshot {
  characters: Personaje[]
  places: Place[]
}

/** Copia profunda para usar como snapshot (sin referencias mutables). */
export function snapshotPartida(characters: Personaje[], places: Place[]): PartidaSnapshot {
  return {
    characters: JSON.parse(JSON.stringify(characters)),
    places: JSON.parse(JSON.stringify(places)),
  }
}

/** Cambio en un campo (opcional from/to para mostrar en resumen). */
export interface FieldChange {
  from?: unknown
  to?: unknown
}

/** Delta de un personaje: qué campos cambiaron. */
export interface CharacterDelta {
  characterId: string
  name: string
  /** true si el personaje es nuevo en stateAfter */
  added: boolean
  changes: Record<string, FieldChange>
}

/** Delta de un lugar: nuevo o modificado. */
export interface PlaceDelta {
  placeId: string
  name: string
  added: boolean
  changes: Record<string, FieldChange>
}

/** Delta completo entre stateBefore y stateAfter. */
export interface StateDelta {
  characterDeltas: CharacterDelta[]
  placeDeltas: PlaceDelta[]
}

const CHARACTER_FIELDS_TO_TRACK = [
  'currentPlaceId',
  'currentActivity',
  'currentState',
  'hp',
  'corruption',
  'loveRegent',
  'lust',
  'sexCount',
  'developedKinks',
  'feelingsToward',
  'description',
] as const

const PLACE_FIELDS_TO_TRACK = ['name', 'description'] as const

function getCharMap(arr: Personaje[]): Map<string, Personaje> {
  const m = new Map<string, Personaje>()
  for (const c of arr) m.set(c.id, c)
  return m
}

function getPlaceMap(arr: Place[]): Map<string, Place> {
  const m = new Map<string, Place>()
  for (const p of arr) m.set(p.id, p)
  return m
}

/**
 * Calcula el delta entre el estado anterior y el posterior (personajes y lugares).
 */
export function computeStateDelta(
  before: PartidaSnapshot,
  after: PartidaSnapshot
): StateDelta {
  const characterDeltas: CharacterDelta[] = []
  const beforeChars = getCharMap(before.characters)
  const afterChars = getCharMap(after.characters)

  for (const next of after.characters) {
    const prev = beforeChars.get(next.id)
    const added = !prev
    const changes: Record<string, FieldChange> = {}
    for (const key of CHARACTER_FIELDS_TO_TRACK) {
      const prevVal = prev ? (prev as unknown as Record<string, unknown>)[key] : undefined
      const nextVal = (next as unknown as Record<string, unknown>)[key]
      if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
        changes[key] = added ? { to: nextVal } : { from: prevVal, to: nextVal }
      }
    }
    if (added || Object.keys(changes).length > 0) {
      characterDeltas.push({
        characterId: next.id,
        name: next.name,
        added,
        changes,
      })
    }
  }

  for (const prev of before.characters) {
    if (!afterChars.has(prev.id)) {
      characterDeltas.push({
        characterId: prev.id,
        name: prev.name,
        added: false,
        changes: { removed: { from: true, to: undefined } },
      })
    }
  }

  const placeDeltas: PlaceDelta[] = []
  const beforePlaces = getPlaceMap(before.places)

  for (const next of after.places) {
    const prev = beforePlaces.get(next.id)
    const added = !prev
    const changes: Record<string, FieldChange> = {}
    for (const key of PLACE_FIELDS_TO_TRACK) {
      const prevVal = prev ? (prev as unknown as Record<string, unknown>)[key] : undefined
      const nextVal = (next as unknown as Record<string, unknown>)[key]
      if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
        changes[key] = added ? { to: nextVal } : { from: prevVal, to: nextVal }
      }
    }
    if (added || Object.keys(changes).length > 0) {
      placeDeltas.push({
        placeId: next.id,
        name: next.name,
        added,
        changes,
      })
    }
  }

  return { characterDeltas, placeDeltas }
}
