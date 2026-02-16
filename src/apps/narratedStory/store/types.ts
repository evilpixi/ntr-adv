/**
 * Types for the Narrated Story global store.
 * State is the single source of truth; persistence syncs to IndexedDB.
 */
import type { Personaje, PlayerProfile, Place } from '../types'
import type { SavedMessage } from '../saveGameDb'

export interface NarratedStoryState {
  /** When null, app shows launcher; when set, game is in progress. */
  playerProfile: PlayerProfile | null
  characters: Personaje[]
  places: Place[]
  messages: SavedMessage[]
  sentMessages: string[]
  systemPrompt: string
  storyPrompt: string
  kinksPrompt: string
  extraIndications: string
  selectedHeroineIds: string[]
  placeAdditionalInfo: Record<string, string>
  turnNumber: number
  /** True until first load from IndexedDB has completed. */
  loading: boolean
}

export type NarratedStoryStateUpdate = Partial<NarratedStoryState>

import type { PartidaRecord } from '../saveGameDb'

export type StoreAction =
  | { type: 'LOAD_PARTIDA'; payload: PartidaRecord }
  | { type: 'RESET_LAUNCHER' }
  | { type: 'UPDATE'; payload: NarratedStoryStateUpdate }

export type Listener = (state: NarratedStoryState) => void
