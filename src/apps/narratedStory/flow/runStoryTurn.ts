/**
 * Normal story turn (Option B): semi-narration → state updates (one payload) → full narrative.
 * No tool-calling phase; state is updated from a single parsed state_updates block.
 */
import { buildNarrativePrompt, buildSemiNarrationPrompt, buildStateUpdatesPrompt } from '../prompts'
import { requestNarrative } from '../aiProviderApi'
import { parseAppResponse, stripToolLikeMarkup } from '../parseAppResponse'
import { narratedStoryStore } from '../store'
import {
  extractStateUpdatesBlock,
  parseStateUpdatesPayload,
  applyStateUpdates,
} from '../stateUpdates'
import type { NarrativeRequestMessage } from '../aiProviderApi'
import type { Language } from '@/store/settings'

function nextId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function runStoryTurn(params: {
  userMessage: string
  language?: Language
}): Promise<void> {
  const { userMessage, language } = params

  const userMsg = {
    id: nextId(),
    role: 'user' as const,
    content: userMessage,
  }

  narratedStoryStore.dispatch({
    type: 'UPDATE',
    payload: {
      messages: [...narratedStoryStore.getState().messages, userMsg],
      sentMessages: [...narratedStoryStore.getState().sentMessages, userMessage],
    },
  })

  let state = narratedStoryStore.getState()
  if (!state.playerProfile) {
    console.warn('[Narrated Story] runStoryTurn: no playerProfile, skip')
    return
  }

  const turnNumber = state.turnNumber
  const messagesForApi = state.messages.map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
    content: m.content,
  }))

  // —— Call 1: Semi-narration (what happens this turn) ——
  const semiPrompt = buildSemiNarrationPrompt({
    systemPrompt: state.systemPrompt,
    storyPrompt: state.storyPrompt,
    kinksPrompt: state.kinksPrompt,
    extraIndications: state.extraIndications,
    playerProfile: state.playerProfile,
    characters: state.characters,
    messages: state.messages,
    places: state.places,
    maxMessages: 50,
    language,
  })
  const { content: semiContent } = await requestNarrative({
    systemPrompt: semiPrompt,
    messages: messagesForApi as NarrativeRequestMessage[],
  })
  const semiNarration = stripToolLikeMarkup(semiContent).trim() || 'The situation develops.'

  // —— Call 2: State updates JSON → apply to store ——
  const stateUpdatesPrompt = buildStateUpdatesPrompt({
    characters: state.characters,
    places: state.places,
    semiNarration,
    language,
  })
  const { content: stateUpdatesContent } = await requestNarrative({
    systemPrompt: stateUpdatesPrompt,
    messages: [{ role: 'user', content: 'Output only the ```state_updates code block with valid JSON.' }],
  })
  const stateUpdatesRaw = extractStateUpdatesBlock(stateUpdatesContent)
  if (stateUpdatesRaw) {
    const payload = parseStateUpdatesPayload(stateUpdatesRaw)
    if (payload) {
      await applyStateUpdates(payload)
    } else {
      console.warn('[Narrated Story] runStoryTurn: state_updates block invalid JSON, skip apply')
    }
  } else {
    console.warn('[Narrated Story] runStoryTurn: no state_updates block in response, skip apply')
  }

  // —— Call 3: Full narrative (with updated state and optional semi-narration to expand) ——
  state = narratedStoryStore.getState()
  if (!state.playerProfile) {
    console.warn('[Narrated Story] runStoryTurn: no playerProfile after state updates, skip narrative')
    return
  }
  const narrativePrompt = buildNarrativePrompt({
    systemPrompt: state.systemPrompt,
    storyPrompt: state.storyPrompt,
    kinksPrompt: state.kinksPrompt,
    extraIndications: state.extraIndications,
    playerProfile: state.playerProfile,
    characters: state.characters,
    messages: state.messages,
    places: state.places,
    maxMessages: 50,
    language,
    semiNarrationToExpand: semiNarration,
  })
  const narrativeMessages = state.messages.map((m): NarrativeRequestMessage =>
    m.role === 'user'
      ? { role: 'user', content: m.content }
      : { role: 'assistant', content: m.content }
  )
  const { content } = await requestNarrative({
    systemPrompt: narrativePrompt,
    messages: narrativeMessages,
  })

  const cleaned = stripToolLikeMarkup(content)
  const parsed = parseAppResponse(cleaned)
  const narrative =
    (parsed.narrative && parsed.narrative.trim()) ||
    cleaned.trim() ||
    (language === 'es'
      ? '*La situación avanza. Los personajes siguen con sus actividades…*'
      : '*The situation moves forward. The characters continue with their activities…*')

  const appMessage = {
    id: nextId(),
    role: 'app' as const,
    content: narrative,
    ...(parsed.events.length > 0 && { events: parsed.events }),
    ...(parsed.turnSummary && { turnSummary: parsed.turnSummary }),
  }

  narratedStoryStore.dispatch({
    type: 'UPDATE',
    payload: {
      messages: [...state.messages, appMessage],
      turnNumber: turnNumber + 1,
    },
  })
}
