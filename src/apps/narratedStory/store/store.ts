/**
 * Global store for Narrated Story app. Single source of truth.
 * All reads via getState(); all writes via dispatch(). Persistence syncs to IndexedDB.
 */
import { heroines, placesOfInterest, migrateCharacters } from '../sampleData'
import type { NarratedStoryState, StoreAction, Listener } from './types'

function getInitialState(): NarratedStoryState {
  return {
    playerProfile: null,
    characters: [],
    places: [...placesOfInterest],
    messages: [],
    sentMessages: [],
    systemPrompt: '',
    storyPrompt: '',
    kinksPrompt: '',
    extraIndications: '',
    selectedHeroineIds: heroines.map((h) => h.id),
    placeAdditionalInfo: {},
    turnNumber: 1,
    loading: true,
  }
}

let state: NarratedStoryState = getInitialState()
const listeners: Set<Listener> = new Set()

function getState(): NarratedStoryState {
  return state
}

function setState(next: NarratedStoryState): void {
  state = next
  listeners.forEach((fn) => fn(state))
}

function dispatch(action: StoreAction): void {
  if (action.type === 'LOAD_PARTIDA') {
    const p = action.payload
    setState({
      playerProfile: p.playerProfile,
      characters: migrateCharacters(p.characters ?? []),
      places: p.places ?? [...placesOfInterest],
      messages: (p.messages ?? []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        ...(m.events != null && { events: m.events }),
        ...(m.turnSummary != null && { turnSummary: m.turnSummary }),
      })),
      sentMessages: p.sentMessages ?? [],
      systemPrompt: p.systemPrompt ?? '',
      storyPrompt: p.storyPrompt ?? '',
      kinksPrompt: p.kinksPrompt ?? '',
      extraIndications: p.extraIndications ?? '',
      selectedHeroineIds: (p.selectedHeroineIds ?? heroines.map((h) => h.id)).map((id) =>
        id === 'frost' ? 'zara' : id
      ),
      placeAdditionalInfo: p.placeAdditionalInfo ?? {},
      turnNumber: p.turnNumber ?? 1,
      loading: false,
    })
    return
  }

  if (action.type === 'RESET_LAUNCHER') {
    const next = getInitialState()
    next.loading = false
    setState(next)
    return
  }

  if (action.type === 'UPDATE') {
    setState({ ...state, ...action.payload })
    return
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const narratedStoryStore = {
  getState,
  dispatch,
  subscribe,
}
