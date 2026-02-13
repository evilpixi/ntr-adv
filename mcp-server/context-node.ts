/**
 * Implementación de ToolContext + NarratedStoryToolContext para Node: usa mcp-data (fs) y el manifest de apps.
 * Las tools de Narrated Story viven en src/apps/narratedStory/.
 */
import type { ToolContext, AppInfo, ToolMeta } from '../tools/context.js'
import { TOOL_DEFINITIONS } from '../tools/definitions.js'
import type { NarratedStoryToolContext, NarratedStoryPartidaSnapshot } from '../src/apps/narratedStory/tools/context.js'
import { NARRATED_STORY_TOOL_DEFINITIONS } from '../src/apps/narratedStory/tools/definitions.js'
import { APPS_MANIFEST, getAppById } from './apps/manifest.js'
import { getDataDir, readJsonFile, writeJsonFile, ensureDir } from './data-dir.js'

const NARRATED_SUBDIR = 'narrated-story'
const CARDGAME_SUBDIR = 'cardgame'

const NARRATED_CHARACTER_PATCH_KEYS = [
  'hp', 'fuerza', 'agilidad', 'inteligencia', 'carisma',
  'description', 'currentPlaceId', 'currentActivity', 'currentState',
  'class', 'race', 'gender', 'genitalia', 'penisSize', 'bustSize', 'nobleTitle',
  'corruption', 'loveRegent', 'lust', 'sexCount', 'developedKinks', 'feelingsToward',
] as const

function clamp0_100(n: unknown): number | undefined {
  if (typeof n !== 'number' || !Number.isFinite(n)) return undefined
  return Math.max(0, Math.min(100, n))
}

function applyCharPatch(char: Record<string, unknown>, patch: Record<string, unknown>): void {
  for (const key of NARRATED_CHARACTER_PATCH_KEYS) {
    if (patch[key] === undefined) continue
    const v = patch[key]
    if (key === 'corruption' || key === 'loveRegent' || key === 'lust') {
      const clamped = clamp0_100(v)
      if (clamped !== undefined) char[key] = clamped
    } else if (key === 'feelingsToward') {
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        const obj = v as Record<string, unknown>
        const out: Record<string, string> = {}
        for (const k of Object.keys(obj)) {
          if (typeof obj[k] === 'string') out[k] = obj[k] as string
        }
        char.feelingsToward = out
      }
    } else if (key === 'developedKinks') {
      char.developedKinks = Array.isArray(v) ? (v as unknown[]).filter((x) => typeof x === 'string') : char.developedKinks
    } else {
      char[key] = v
    }
  }
}

/** appId -> prefijo del nombre de tool */
const APP_TOOL_PREFIX: Record<string, string> = {
  'narrated-story': 'narrated_story_',
  cardgame: 'cardgame_',
  shell: 'ntr_',
}

function toAppInfo(entry: { id: string; name: string; description: string; type?: string; legacy?: boolean }): AppInfo {
  return {
    id: entry.id,
    name: entry.name,
    description: entry.description,
    type: entry.type,
    legacy: entry.legacy ?? false,
  }
}

export function createNodeContext(): ToolContext & NarratedStoryToolContext {
  return {
    async listApps() {
      return APPS_MANIFEST.map(toAppInfo)
    },
    async getAppInfo(appId: string) {
      if (appId === 'shell') {
        return { id: 'shell', name: 'Shell', description: 'Tools globales del proyecto (listar apps, listar tools por app).' }
      }
      const app = getAppById(appId)
      return app ? toAppInfo(app) : null
    },
    async getToolList(appId: string) {
      if (appId === 'narrated-story') {
        return NARRATED_STORY_TOOL_DEFINITIONS.map(
          (t): ToolMeta => ({ name: t.name, description: t.description })
        )
      }
      const prefix = APP_TOOL_PREFIX[appId] ?? appId.replace(/-/g, '_') + '_'
      return TOOL_DEFINITIONS.filter((t) => t.name.startsWith(prefix)).map(
        (t): ToolMeta => ({ name: t.name, description: t.description })
      )
    },
    async getPartida(): Promise<NarratedStoryPartidaSnapshot | null> {
      const path = getDataDir(NARRATED_SUBDIR, 'current.json')
      const data = (await readJsonFile(path)) as {
        playerProfile?: Record<string, unknown>
        characters?: Array<Record<string, unknown>>
        places?: Array<{ id: string; name: string; description?: string }>
        placeAdditionalInfo?: Record<string, string>
      } | null
      if (!data) return null
      return {
        playerProfile: data.playerProfile,
        characters: data.characters ?? [],
        places: data.places,
        placeAdditionalInfo: data.placeAdditionalInfo,
      }
    },
    async updateCharacter(characterId: string, patch: Record<string, unknown>) {
      await ensureDir(NARRATED_SUBDIR)
      const path = getDataDir(NARRATED_SUBDIR, 'current.json')
      const existing = (await readJsonFile(path)) as { characters?: Array<Record<string, unknown>> } | null
      if (!existing?.characters) return
      const idx = existing.characters.findIndex((c) => c.id === characterId)
      if (idx === -1) return
      const char = existing.characters[idx] as Record<string, unknown>
      applyCharPatch(char, patch)
      existing.characters[idx] = char
      await writeJsonFile(path, { ...existing, updatedAt: new Date().toISOString() })
    },
    async updateCharacters(updates: Array<{ characterId: string; patch: Record<string, unknown> }>) {
      await ensureDir(NARRATED_SUBDIR)
      const path = getDataDir(NARRATED_SUBDIR, 'current.json')
      const existing = (await readJsonFile(path)) as { characters?: Array<Record<string, unknown>> } | null
      if (!existing?.characters) return
      const byId = new Map(existing.characters.map((c) => [c.id as string, c]))
      for (const { characterId, patch } of updates) {
        const char = byId.get(characterId)
        if (char) applyCharPatch(char as Record<string, unknown>, patch)
      }
      await writeJsonFile(path, { ...existing, updatedAt: new Date().toISOString() })
    },
    async updatePlace(placeId: string, patch: Record<string, unknown>) {
      await ensureDir(NARRATED_SUBDIR)
      const path = getDataDir(NARRATED_SUBDIR, 'current.json')
      const existing = (await readJsonFile(path)) as { places?: Array<{ id: string; name: string; description?: string }>; placeAdditionalInfo?: Record<string, string> } | null
      if (!existing) return
      const places = existing.places ?? []
      const idx = places.findIndex((p) => p.id === placeId)
      if (idx === -1) return
      const place = places[idx]
      if (typeof patch.name === 'string') place.name = patch.name
      if (typeof patch.description === 'string') place.description = patch.description
      let placeAdditionalInfo = existing.placeAdditionalInfo
      if (typeof patch.additionalInfo === 'string') {
        placeAdditionalInfo = { ...(existing.placeAdditionalInfo ?? {}), [placeId]: patch.additionalInfo }
      }
      await writeJsonFile(path, { ...existing, places, placeAdditionalInfo, updatedAt: new Date().toISOString() })
    },
    async createCharacter(character: Record<string, unknown>) {
      await ensureDir(NARRATED_SUBDIR)
      const path = getDataDir(NARRATED_SUBDIR, 'current.json')
      const existing = (await readJsonFile(path)) as { characters?: Array<Record<string, unknown>> } | null
      if (!existing) return
      const characters = existing.characters ?? []
      const id = String(character.id ?? '')
      if (characters.some((c) => c.id === id)) return
      const allowed = ['id', 'name', 'role', 'hp', 'fuerza', 'agilidad', 'inteligencia', 'carisma', 'description', 'class', 'race', 'currentPlaceId', 'currentActivity', 'currentState', 'corruption', 'loveRegent', 'lust', 'sexCount', 'developedKinks', 'feelingsToward']
      const newChar: Record<string, unknown> = { id, name: String(character.name ?? 'Unknown'), role: character.role ?? 'npc', hp: 100, fuerza: 10, agilidad: 10, inteligencia: 10, carisma: 10, description: '' }
      for (const key of allowed) {
        if (character[key] === undefined) continue
        const v = character[key]
        if (key === 'corruption' || key === 'loveRegent' || key === 'lust') {
          const clamped = clamp0_100(v)
          if (clamped !== undefined) newChar[key] = clamped
        } else if (key === 'feelingsToward' && v !== null && typeof v === 'object' && !Array.isArray(v)) {
          const obj = v as Record<string, unknown>
          const out: Record<string, string> = {}
          for (const k of Object.keys(obj)) {
            if (typeof obj[k] === 'string') out[k] = obj[k] as string
          }
          newChar.feelingsToward = out
        } else if (key === 'developedKinks') {
          newChar.developedKinks = Array.isArray(v) ? (v as unknown[]).filter((x) => typeof x === 'string') : []
        } else {
          newChar[key] = v
        }
      }
      characters.push(newChar)
      await writeJsonFile(path, { ...existing, characters, updatedAt: new Date().toISOString() })
    },
    async createPlace(placeId: string, name: string, description?: string) {
      await ensureDir(NARRATED_SUBDIR)
      const path = getDataDir(NARRATED_SUBDIR, 'current.json')
      const existing = (await readJsonFile(path)) as { places?: Array<{ id: string; name: string; description?: string }> } | null
      if (!existing) return
      const places = existing.places ?? []
      if (places.some((p) => p.id === placeId)) return
      places.push({ id: placeId, name, description })
      await writeJsonFile(path, { ...existing, places, updatedAt: new Date().toISOString() })
    },
    async listDecks() {
      await ensureDir(CARDGAME_SUBDIR)
      const dir = getDataDir(CARDGAME_SUBDIR)
      const fs = await import('node:fs/promises')
      let entries: string[] = []
      try {
        entries = await fs.readdir(dir)
      } catch {
        return []
      }
      return entries.filter((e) => e.endsWith('.json')).map((f) => f.replace(/\.json$/, ''))
    },
    async readDeck(deckName: string) {
      const safe = deckName.replace(/[^a-zA-Z0-9_-]/g, '_')
      return readJsonFile(getDataDir(CARDGAME_SUBDIR, `${safe}.json`))
    },
    async writeDeck(deckName: string, deckJson: Record<string, unknown>) {
      await ensureDir(CARDGAME_SUBDIR)
      const safe = deckName.replace(/[^a-zA-Z0-9_-]/g, '_')
      const path = getDataDir(CARDGAME_SUBDIR, `${safe}.json`)
      await writeJsonFile(path, { ...deckJson, updatedAt: new Date().toISOString() })
    },
  }
}
