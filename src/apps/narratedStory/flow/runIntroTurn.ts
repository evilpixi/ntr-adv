/**
 * Intro turn: narrative only, no tools. Uses narrative prompt and requestNarrative.
 */
import { buildNarrativePrompt } from '../prompts'
import { requestNarrative } from '../aiProviderApi'
import { parseAppResponse, stripToolLikeMarkup } from '../parseAppResponse'
import { narratedStoryStore } from '../store'
import type { Language } from '@/store/settings'

const INTRO_USER_MESSAGE =
  'Begin the story. Write the opening scene (2–3 paragraphs) and end with *What do you do?*'

function nextId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function runIntroTurn(params: { language?: Language }): Promise<void> {
  const state = narratedStoryStore.getState()
  if (!state.playerProfile) {
    console.warn('[Narrated Story] runIntroTurn: no playerProfile, skip')
    return
  }

  const systemPrompt = buildNarrativePrompt({
    systemPrompt: state.systemPrompt,
    storyPrompt: state.storyPrompt,
    kinksPrompt: state.kinksPrompt,
    extraIndications: state.extraIndications,
    playerProfile: state.playerProfile,
    characters: state.characters,
    messages: [{ id: 'intro', role: 'user', content: INTRO_USER_MESSAGE }],
    places: state.places,
    maxMessages: 0,
    language: params.language,
  })

  const { content } = await requestNarrative({
    systemPrompt,
    messages: [{ role: 'user', content: INTRO_USER_MESSAGE }],
  })

  const cleaned = stripToolLikeMarkup(content)
  const parsed = parseAppResponse(cleaned)
  const narrative =
    (parsed.narrative && parsed.narrative.trim()) ||
    cleaned.trim() ||
    (params.language === 'es'
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
      messages: [appMessage],
    },
  })
}
