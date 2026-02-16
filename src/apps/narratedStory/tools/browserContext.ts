/**
 * Tool context for Narrated Story in the browser. Reads and writes via the global store (single source of truth).
 * Persistence to IndexedDB is handled by the store layer.
 */
import { narratedStoryStore } from '../store'
import { placesOfInterest } from '../sampleData'
import type { Personaje, Place } from '../types'
import type { NarratedStoryToolContext } from './context'

const CHARACTER_PATCH_KEYS = [
  'hp', 'fuerza', 'agilidad', 'inteligencia', 'carisma',
  'description', 'currentPlaceId', 'currentActivity', 'currentState',
  'class', 'race', 'gender', 'genitalia', 'penisSize', 'bustSize', 'nobleTitle',
  'corruption', 'loveRegent', 'lust', 'sexCount', 'developedKinks', 'feelingsToward',
] as const

function applyCharacterPatch(char: Personaje, patch: Record<string, unknown>): Personaje {
  const next = { ...char }
  for (const key of CHARACTER_PATCH_KEYS) {
    if (patch[key] === undefined) continue
    const v = patch[key]
    if (key === 'hp' || key === 'fuerza' || key === 'agilidad' || key === 'inteligencia' || key === 'carisma' || key === 'sexCount') {
      next[key] = typeof v === 'number' ? v : Number(v) ?? (next[key] as number) ?? 0
    } else if (key === 'corruption' || key === 'loveRegent' || key === 'lust') {
      const num = typeof v === 'number' ? v : Number(v)
      next[key] = Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : ((next[key] as number) ?? 0)
    } else if (key === 'developedKinks') {
      next.developedKinks = Array.isArray(v) ? (v as string[]).filter((x) => typeof x === 'string') : [...(next.developedKinks ?? [])]
    } else if (key === 'feelingsToward') {
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        const obj = v as Record<string, unknown>
        next.feelingsToward = {}
        for (const k of Object.keys(obj)) {
          if (typeof obj[k] === 'string') next.feelingsToward![k] = obj[k] as string
        }
      }
    } else if (key === 'currentPlaceId' && (v === null || v === '')) {
      next.currentPlaceId = undefined
    } else if (typeof v === 'string') {
      ;(next as Record<string, unknown>)[key] = v
    }
  }
  return next
}

function characterFromPayload(data: Record<string, unknown>): Personaje {
  const id = String(data.id ?? '')
  const name = String(data.name ?? 'Unknown')
  const role = (data.role as Personaje['role']) ?? 'npc'
  return {
    id,
    name,
    role,
    hp: typeof data.hp === 'number' ? data.hp : 100,
    fuerza: typeof data.fuerza === 'number' ? data.fuerza : 10,
    agilidad: typeof data.agilidad === 'number' ? data.agilidad : 10,
    inteligencia: typeof data.inteligencia === 'number' ? data.inteligencia : 10,
    carisma: typeof data.carisma === 'number' ? data.carisma : 10,
    description: typeof data.description === 'string' ? data.description : '',
    class: typeof data.class === 'string' ? data.class : undefined,
    race: typeof data.race === 'string' ? data.race : undefined,
    currentPlaceId: typeof data.currentPlaceId === 'string' ? data.currentPlaceId : undefined,
    currentActivity: typeof data.currentActivity === 'string' ? data.currentActivity : undefined,
    currentState: typeof data.currentState === 'string' ? data.currentState : undefined,
    corruption: typeof data.corruption === 'number' ? Math.max(0, Math.min(100, data.corruption)) : 0,
    loveRegent: typeof data.loveRegent === 'number' ? Math.max(0, Math.min(100, data.loveRegent)) : undefined,
    lust: typeof data.lust === 'number' ? Math.max(0, Math.min(100, data.lust)) : 0,
    sexCount: typeof data.sexCount === 'number' ? data.sexCount : 0,
    developedKinks: Array.isArray(data.developedKinks) ? (data.developedKinks as string[]).filter((x) => typeof x === 'string') : [],
    feelingsToward: data.feelingsToward !== null && typeof data.feelingsToward === 'object' && !Array.isArray(data.feelingsToward)
      ? (() => {
          const obj = data.feelingsToward as Record<string, unknown>
          const out: Record<string, string> = {}
          for (const k of Object.keys(obj)) {
            if (typeof obj[k] === 'string') out[k] = obj[k] as string
          }
          return out
        })()
      : undefined,
  }
}

/** Creates the tool context that reads/writes the Narrated Story store. */
export function createNarratedStoryBrowserContext(): NarratedStoryToolContext {
  return {
    async getPartida() {
      const state = narratedStoryStore.getState()
      if (!state.playerProfile) return null
      return {
        playerProfile: state.playerProfile as unknown as Record<string, unknown>,
        characters: state.characters.map((c) => ({ ...c } as Record<string, unknown>)),
        places: state.places,
        placeAdditionalInfo: state.placeAdditionalInfo,
      }
    },
    async updateCharacter(characterId: string, patch: Record<string, unknown>) {
      const state = narratedStoryStore.getState()
      if (!state.playerProfile) {
        console.warn('[Narrated Story MCP] update_character: no partida loaded, skip')
        return
      }
      const idx = state.characters.findIndex((c) => c.id === characterId)
      if (idx === -1) {
        console.warn('[Narrated Story MCP] update_character: character not found', characterId)
        return
      }
      const updated = applyCharacterPatch(state.characters[idx], patch)
      const characters = state.characters.slice()
      characters[idx] = updated
      narratedStoryStore.dispatch({ type: 'UPDATE', payload: { characters } })
      console.log('[Narrated Story MCP] store updated: characters=', characters.length)
    },
    async updateCharacters(updates: Array<{ characterId: string; patch: Record<string, unknown> }>) {
      const state = narratedStoryStore.getState()
      if (!state.playerProfile) {
        console.warn('[Narrated Story MCP] update_characters: no partida loaded, skip')
        return
      }
      const byId = new Map(state.characters.map((c) => [c.id, c]))
      for (const { characterId, patch } of updates) {
        const char = byId.get(characterId)
        if (char) byId.set(characterId, applyCharacterPatch(char, patch))
      }
      const characters = Array.from(byId.values())
      narratedStoryStore.dispatch({ type: 'UPDATE', payload: { characters } })
      console.log('[Narrated Story MCP] store updated: characters=', characters.length)
    },
    async updatePlace(placeId: string, patch: Record<string, unknown>) {
      const state = narratedStoryStore.getState()
      if (!state.playerProfile) {
        console.warn('[Narrated Story MCP] update_place: no partida loaded, skip')
        return
      }
      const places: Place[] = state.places ? [...state.places] : [...placesOfInterest]
      const idx = places.findIndex((p) => p.id === placeId)
      if (idx === -1) {
        console.warn('[Narrated Story MCP] update_place: place not found', placeId)
        return
      }
      const place = places[idx]
      if (typeof patch.name === 'string') place.name = patch.name
      if (typeof patch.description === 'string') place.description = patch.description
      let placeAdditionalInfo = state.placeAdditionalInfo
      if (typeof patch.additionalInfo === 'string') {
        placeAdditionalInfo = { ...state.placeAdditionalInfo, [placeId]: patch.additionalInfo }
      }
      narratedStoryStore.dispatch({ type: 'UPDATE', payload: { places, placeAdditionalInfo } })
      console.log('[Narrated Story MCP] store updated: places=', places.length)
    },
    async createCharacter(character: Record<string, unknown>) {
      const state = narratedStoryStore.getState()
      if (!state.playerProfile) {
        console.warn('[Narrated Story MCP] create_character: no partida loaded, skip')
        return
      }
      const newChar = characterFromPayload(character)
      if (state.characters.some((c) => c.id === newChar.id)) {
        console.warn('[Narrated Story MCP] create_character: id already exists', newChar.id)
        return
      }
      const characters = [...state.characters, newChar]
      narratedStoryStore.dispatch({ type: 'UPDATE', payload: { characters } })
      console.log('[Narrated Story MCP] store updated: characters=', characters.length, '(added', newChar.name + ')')
    },
    async createPlace(placeId: string, name: string, description?: string) {
      const state = narratedStoryStore.getState()
      if (!state.playerProfile) {
        console.warn('[Narrated Story MCP] create_place: no partida loaded, skip')
        return
      }
      const places: Place[] = state.places ? [...state.places] : [...placesOfInterest]
      if (places.some((p) => p.id === placeId)) {
        console.warn('[Narrated Story MCP] create_place: placeId already exists', placeId)
        return
      }
      places.push({ id: placeId, name, description })
      narratedStoryStore.dispatch({ type: 'UPDATE', payload: { places } })
      console.log('[Narrated Story MCP] store updated: places=', places.length, '(added', name + ')')
    },
  }
}
