/**
 * Prompt for narrative-only requests (intro and post-tools phase).
 * No tool instructions; explicit instruction to reply with narrative only, no tool syntax or markup.
 */
import type { Language } from '@/store/settings'
import { buildFullPromptForAI, getEffectiveSystemPrompt } from '../defaultSystemPrompt'
import {
  buildTurnDataBlock,
  getLanguageInstruction,
  type TurnDataParams,
} from '../buildPromptForAI'

const NARRATIVE_ONLY_INSTRUCTION = [
  '---',
  '## OUTPUT: NARRATIVE ONLY',
  '',
  'Reply only with narrative text (story, dialogue, description). You may optionally include at the end:',
  '1) A code block ```events with a JSON array of short event phrases (each with "text" and optionally "sexual": true).',
  '2) A code block ```turn_summary with bullet points of what changed this turn.',
  'Do NOT output any tool calls, function call syntax, XML-like tags, or markup (e.g. no <|DSML|>, no <function_calls>). Your message content must be plain narrative and the optional blocks above only.',
  '',
].join('\n')

export interface NarrativePromptParams {
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
  /** When set (Option B flow), instruct to expand this semi-narration into full narrative. */
  semiNarrationToExpand?: string
}

export function buildNarrativePrompt(params: NarrativePromptParams): string {
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
  if (params.semiNarrationToExpand?.trim()) {
    parts.push(
      '---',
      '## SEMI-NARRATION TO EXPAND',
      '',
      'Expand the following semi-narration into a full narrative with rich detail, dialogue, and atmosphere. Then add optional ```events and ```turn_summary blocks if needed.',
      '',
      params.semiNarrationToExpand.trim(),
      ''
    )
  }
  parts.push(NARRATIVE_ONLY_INSTRUCTION)
  parts.push(buildTurnDataBlock(turnData))
  return parts.join('\n\n')
}
