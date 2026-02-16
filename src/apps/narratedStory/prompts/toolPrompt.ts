/**
 * Prompt for tool-calling requests (normal turn phase 1).
 * Instructs the model to call get_state, then create, then apply_updates. No narrative output instructions.
 */
import type { Language } from '@/store/settings'
import { buildFullPromptForAI, getEffectiveSystemPrompt } from '../defaultSystemPrompt'
import {
  buildTurnDataBlock,
  getLanguageInstruction,
  type TurnDataParams,
} from '../buildPromptForAI'
import { NARRATED_STORY_TOOL_DEFINITIONS } from '../tools/definitions'

const TOOL_ORDER_INSTRUCTION = [
  '---',
  '## TOOL EXECUTION ORDER (mandatory)',
  '',
  'You MUST call tools in this exact order. Use at most three calls:',
  '',
  '1. **narrated_story_get_state** – Call first to read the current partida (characters, places).',
  '2. **narrated_story_create** – One payload: arrays `places` and/or `characters` for new entities. Omit if nothing new.',
  '3. **narrated_story_apply_updates** – One payload: `placeUpdates`, `characterUpdates`, `characterLocations`. Omit if nothing to update.',
  '',
].join('\n')

const SIMULATION_INSTRUCTION = [
  '---',
  '## SIMULATION UPDATES',
  '',
  'Call get_state first. Then create (if new places/characters) with a single payload. Then apply_updates (if any changes) with a single payload for placeUpdates, characterUpdates, characterLocations.',
  '',
].join('\n')

/** Only the three normal-turn tools (no intro tool). */
const NORMAL_TOOL_NAMES = ['narrated_story_get_state', 'narrated_story_create', 'narrated_story_apply_updates']

function getToolInstructionsBlock(): string {
  const tools = NARRATED_STORY_TOOL_DEFINITIONS.filter((t) => NORMAL_TOOL_NAMES.includes(t.name))
  if (tools.length === 0) return ''

  const lines: string[] = ['---', '## TOOLS', '']
  for (const t of tools) {
    lines.push(`### ${t.name}`)
    lines.push(t.description)
    if (t.parameters && Object.keys(t.parameters).length > 0) {
      const params = Object.entries(t.parameters)
        .map(([key, { type, description }]) => `  - \`${key}\` (${type})${description ? `: ${description}` : ''}`)
        .join('\n')
      lines.push('Parameters:', params, '')
    } else {
      lines.push('Parameters: none.', '')
    }
  }
  return lines.join('\n')
}

export interface ToolPromptParams {
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

export function buildToolPrompt(params: ToolPromptParams): string {
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
  parts.push(TOOL_ORDER_INSTRUCTION)
  parts.push(SIMULATION_INSTRUCTION)
  parts.push(getToolInstructionsBlock())
  parts.push(buildTurnDataBlock(turnData))
  return parts.join('\n\n')
}
