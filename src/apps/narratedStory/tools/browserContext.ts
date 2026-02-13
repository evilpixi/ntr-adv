/**
 * Contexto de tools de Narrated Story para el navegador: solo partida y stats.
 * Implementa NarratedStoryToolContext usando saveGameDb (IndexedDB).
 * Para tools narrativas usar runNarratedStoryTool. No incluye tools generales (ntr_*, cardgame_*).
 */
import { getCurrentPartida, savePartida, type PartidaRecord } from '../saveGameDb'
import { placesOfInterest } from '../sampleData'
import type { Personaje, Place } from '../types'
import type { NarratedStoryToolContext } from './context'

/** Campos que la IA puede actualizar en un personaje (no id, name, role, etc.). */
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
    } else if (typeof v === 'string') {
      ;(next as Record<string, unknown>)[key] = v
    }
  }
  return next
}

function getSaveOpts(current: PartidaRecord) {
  return {
    messages: current.messages,
    sentMessages: current.sentMessages,
    systemPrompt: current.systemPrompt,
    storyPrompt: current.storyPrompt,
    kinksPrompt: current.kinksPrompt,
    extraIndications: current.extraIndications,
    selectedHeroineIds: current.selectedHeroineIds,
    placeAdditionalInfo: current.placeAdditionalInfo,
    places: current.places,
  }
}

/** Construye un Personaje mínimo desde un objeto de la IA (id, name, role requeridos). */
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

/** Crea el contexto de tools de partida/stats para la app Narrated Story en el navegador. */
export function createNarratedStoryBrowserContext(): NarratedStoryToolContext {
  return {
    async getPartida() {
      const partida = await getCurrentPartida()
      if (!partida) return null
      return {
        playerProfile: partida.playerProfile as unknown as Record<string, unknown>,
        characters: partida.characters.map((c) => ({ ...c } as Record<string, unknown>)),
        places: partida.places,
        placeAdditionalInfo: partida.placeAdditionalInfo,
      }
    },
    async updateCharacter(characterId: string, patch: Record<string, unknown>) {
      const current = await getCurrentPartida()
      if (!current) {
        console.warn('[Narrated Story MCP] update_character: no partida loaded, skip')
        return
      }
      const idx = current.characters.findIndex((c) => c.id === characterId)
      if (idx === -1) {
        console.warn('[Narrated Story MCP] update_character: character not found', characterId)
        return
      }
      const updated = applyCharacterPatch(current.characters[idx], patch)
      const characters = current.characters.slice()
      characters[idx] = updated
      await savePartida(current.playerProfile, characters, getSaveOpts(current))
      console.log('[Narrated Story MCP] savePartida OK: characters=', characters.length)
    },
    async updateCharacters(updates: Array<{ characterId: string; patch: Record<string, unknown> }>) {
      const current = await getCurrentPartida()
      if (!current) {
        console.warn('[Narrated Story MCP] update_characters: no partida loaded, skip')
        return
      }
      const byId = new Map(current.characters.map((c) => [c.id, c]))
      for (const { characterId, patch } of updates) {
        const char = byId.get(characterId)
        if (char) byId.set(characterId, applyCharacterPatch(char, patch))
      }
      const characters = Array.from(byId.values())
      await savePartida(current.playerProfile, characters, getSaveOpts(current))
      console.log('[Narrated Story MCP] savePartida OK: characters=', characters.length)
    },
    async updatePlace(placeId: string, patch: Record<string, unknown>) {
      const current = await getCurrentPartida()
      if (!current) {
        console.warn('[Narrated Story MCP] update_place: no partida loaded, skip')
        return
      }
      const places: Place[] = current.places ? [...current.places] : [...placesOfInterest]
      const idx = places.findIndex((p) => p.id === placeId)
      if (idx === -1) {
        console.warn('[Narrated Story MCP] update_place: place not found', placeId)
        return
      }
      const place = places[idx]
      if (typeof patch.name === 'string') place.name = patch.name
      if (typeof patch.description === 'string') place.description = patch.description
      let placeAdditionalInfo = current.placeAdditionalInfo
      if (typeof patch.additionalInfo === 'string') {
        placeAdditionalInfo = { ...(current.placeAdditionalInfo ?? {}), [placeId]: patch.additionalInfo }
      }
      await savePartida(current.playerProfile, current.characters, { ...getSaveOpts(current), placeAdditionalInfo, places })
      console.log('[Narrated Story MCP] savePartida OK: places=', places.length)
    },
    async createCharacter(character: Record<string, unknown>) {
      const current = await getCurrentPartida()
      if (!current) {
        console.warn('[Narrated Story MCP] create_character: no partida loaded, skip')
        return
      }
      const newChar = characterFromPayload(character)
      if (current.characters.some((c) => c.id === newChar.id)) {
        console.warn('[Narrated Story MCP] create_character: id already exists', newChar.id)
        return
      }
      const characters = [...current.characters, newChar]
      await savePartida(current.playerProfile, characters, getSaveOpts(current))
      console.log('[Narrated Story MCP] savePartida OK: characters=', characters.length, '(added', newChar.name + ')')
    },
    async createPlace(placeId: string, name: string, description?: string) {
      const current = await getCurrentPartida()
      if (!current) {
        console.warn('[Narrated Story MCP] create_place: no partida loaded, skip')
        return
      }
      const places: Place[] = current.places ? [...current.places] : [...placesOfInterest]
      if (places.some((p) => p.id === placeId)) {
        console.warn('[Narrated Story MCP] create_place: placeId already exists', placeId)
        return
      }
      places.push({ id: placeId, name, description })
      await savePartida(current.playerProfile, current.characters, { ...getSaveOpts(current), places })
      console.log('[Narrated Story MCP] savePartida OK: places=', places.length, '(added', name + ')')
    },
  }
}
