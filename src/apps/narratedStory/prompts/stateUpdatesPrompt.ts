/**
 * Prompt for the second call in Option B: model outputs only a ```state_updates JSON block.
 * Input: current state + semi-narration. Output: single code block with state updates payload.
 */
import type { Language } from '@/store/settings'
import { getLanguageInstruction } from '../buildPromptForAI'
import type { Personaje, Place } from '../types'

const STATE_UPDATES_INSTRUCTION = [
  '---',
  '## OUTPUT: STATE UPDATES ONLY',
  '',
  'You must reply with **only** a single code block named state_updates containing valid JSON.',
  'No other text before or after. No explanation. The block must look exactly like:',
  '',
  '```state_updates',
  '{ ... }',
  '```',
  '',
  'The JSON object may contain these optional keys (omit a key if empty):',
  '',
  '- **newPlaces** (array): New places this turn. Each item: { "placeId": string, "name": string, "description": optional string }.',
  '- **newCharacters** (array): New NPCs. Each item: { "id": string, "name": string, "role": "npc", optional "description", "class", "race" }. Do not set location or stats here; use characterLocations/characterUpdates.',
  '- **placeUpdates** (array): Changes to existing places. Each item: { "placeId": string, "patch": { optional "name", "description", "additionalInfo" } }.',
  '- **characterUpdates** (array): Stat/field changes. Each item: { "characterId": string, "patch": object } with e.g. currentPlaceId, currentActivity, currentState, hp, corruption (0-100), loveRegent, lust, sexCount, developedKinks, feelingsToward, etc.',
  '- **characterLocations** (array): Where each character is. Each item: { "characterId": string, "placeId": string or null, optional "currentActivity", "currentState" }. Every character that moved or was placed must appear here.',
  '',
  'Based on the semi-narration and current state below, output the state_updates block that reflects all changes described.',
  '',
].join('\n')

export interface StateUpdatesPromptParams {
  /** Current characters (IDs and fields). */
  characters: Personaje[]
  /** Current places. */
  places: Place[]
  /** Semi-narration from the first call. */
  semiNarration: string
  language?: Language
}

/**
 * Builds a minimal prompt: instruction + current state summary + semi-narration.
 */
export function buildStateUpdatesPrompt(params: StateUpdatesPromptParams): string {
  const { characters, places, semiNarration, language } = params
  const parts: string[] = [STATE_UPDATES_INSTRUCTION]
  if (language) parts.push(getLanguageInstruction(language))
  parts.push('---', '## CURRENT STATE (characters and places)', '')
  parts.push('### Characters', JSON.stringify(characters.map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    currentPlaceId: c.currentPlaceId,
    currentActivity: c.currentActivity,
    currentState: c.currentState,
  })), null, 2), '')
  parts.push('### Places', JSON.stringify(places.map((p) => ({ id: p.id, name: p.name })), null, 2), '')
  parts.push('---', '## SEMI-NARRATION (what happens this turn)', '', semiNarration, '')
  return parts.join('\n')
}
