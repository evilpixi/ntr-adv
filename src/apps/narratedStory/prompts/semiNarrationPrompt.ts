/**
 * Prompt for the first call in Option B: model outputs only a "semi-narración" (short description of what happens this turn).
 * No code blocks, no tools. Used to derive state updates in the second call.
 */
import type { Language } from '@/store/settings'
import { buildFullPromptForAI, getEffectiveSystemPrompt } from '../defaultSystemPrompt'
import {
  buildTurnDataBlock,
  getLanguageInstruction,
  type TurnDataParams,
} from '../buildPromptForAI'

const SEMI_NARRATION_INSTRUCTION = [
  '---',
  '## OUTPUT: SEMI-NARRATION ONLY',
  '',
  'Reply with a short **semi-narración**: a concise description of what happens this turn.',
  'Include: who does what, who moves where (locations), new characters or places introduced, key events, relationship or stat changes.',
  'Write in plain text only. No code blocks, no JSON, no bullet list required—just a continuous paragraph or two that summarises the turn.',
  'This will be used to update game state and then to write the full narrative.',
  '',
].join('\n')

export interface SemiNarrationPromptParams {
  systemPrompt: string
  storyPrompt: string
  kinksPrompt: string
  extraIndications: string
  playerProfile: import('../types').PlayerProfile
  characters: import('../types').Personaje[]
  messages: Array<{ id: string; role: 'user' | 'app'; content: string }>
  places?: import('../types').Place[]
  maxMessages?: number
  language?: Language
}

export function buildSemiNarrationPrompt(params: SemiNarrationPromptParams): string {
  const base = buildFullPromptForAI({
    systemPrompt: getEffectiveSystemPrompt(params.systemPrompt),
    storyPrompt: params.storyPrompt.trim(),
    kinksPrompt: params.kinksPrompt.trim(),
    extraIndications: params.extraIndications.trim(),
  })

  const turnData: TurnDataParams = {
    playerProfile: params.playerProfile,
    characters: params.characters,
    messages: params.messages,
    places: params.places,
    maxMessages: params.maxMessages,
  }

  const parts: string[] = [base]
  if (params.language) parts.push(getLanguageInstruction(params.language))
  parts.push(SEMI_NARRATION_INSTRUCTION)
  parts.push(buildTurnDataBlock(turnData))
  return parts.join('\n\n')
}
