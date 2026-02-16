/**
 * Persistence layer: syncs store state to IndexedDB when partida exists.
 * Subscribes to the store and calls savePartida on every state change (when playerProfile is set).
 */
import { savePartida } from '../saveGameDb'
import { narratedStoryStore } from './store'

function persist(state: import('./types').NarratedStoryState): void {
  if (!state.playerProfile || state.loading) return
  const savedMessages = state.messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    ...(m.events != null && { events: m.events }),
    ...(m.turnSummary != null && { turnSummary: m.turnSummary }),
  }))
  savePartida(state.playerProfile, state.characters, {
    messages: savedMessages,
    sentMessages: state.sentMessages,
    systemPrompt: state.systemPrompt,
    storyPrompt: state.storyPrompt,
    kinksPrompt: state.kinksPrompt,
    extraIndications: state.extraIndications,
    selectedHeroineIds: state.selectedHeroineIds,
    placeAdditionalInfo: state.placeAdditionalInfo,
    places: state.places,
    turnNumber: state.turnNumber,
  }).catch(console.error)
}

let unsub: (() => void) | null = null

export function initPersistence(): void {
  if (unsub) return
  unsub = narratedStoryStore.subscribe(persist)
}

export function stopPersistence(): void {
  if (unsub) {
    unsub()
    unsub = null
  }
}
