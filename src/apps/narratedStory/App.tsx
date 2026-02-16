import { useState, useRef, useEffect } from 'react'
import type { ComponentType } from 'react'
import { GiScrollQuill, GiBookmarklet, GiNotebook, GiPerson, GiScrollUnfurled, GiCardRandom, GiCastle } from '@/theme/icons'
import { getGeneralImage, useGameData } from '@/data/gameData'
import { useNarratedStoryTranslation } from './i18n'
import { initialNarratedStoryData, buildPlayerFromProfile, heroines, placesOfInterest } from './sampleData'
import { getCurrentPartida } from './saveGameDb'
import { DEFAULT_SYSTEM_PROMPT } from './defaultSystemPrompt'
import { DEFAULT_STORY_PROMPT } from './defaultStoryPrompt'
import { DEFAULT_KINKS_PROMPT } from './defaultKinksPrompt'
import { DEFAULT_EXTRA_INDICATIONS } from './defaultExtraIndications'
import { useNarratedStoryStore, narratedStoryStore, initPersistence } from './store'
import { runIntroTurn, runStoryTurn } from './flow'
import { StoryChat, CharactersView, PlacesView, PlayerLauncher, StoryPromptStep } from './components'
import type { NarratedStoryKey } from './locales/keys'
import type { ChatMessage, Personaje, PlayerProfile } from './types'
import './narratedStory.css'

type TabId = 'info' | 'story' | 'notes' | 'characters' | 'places' | 'config'

const TABS: { id: TabId; icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }> }[] = [
  { id: 'info', icon: GiBookmarklet },
  { id: 'story', icon: GiScrollQuill },
  { id: 'notes', icon: GiNotebook },
  { id: 'characters', icon: GiPerson },
  { id: 'places', icon: GiCastle },
  { id: 'config', icon: GiCardRandom },
]

const getLabelHelpers = (t: (key: NarratedStoryKey, vars?: Record<string, string | number>) => string) => ({
  getGoverningStyleLabel: (s: PlayerProfile['governingStyle']) =>
    t(`narratedStory.launcher.governingStyle.${s}` as NarratedStoryKey),
  getGenderLabel: (g: PlayerProfile['gender']) =>
    t(`narratedStory.launcher.genderOption.${g}` as NarratedStoryKey),
  getGenitaliaLabel: (g: PlayerProfile['genitalia']) =>
    t(`narratedStory.launcher.genitaliaOption.${g}` as NarratedStoryKey),
  getNobleTitleLabel: (n: PlayerProfile['nobleTitle'], g: PlayerProfile['gender']) =>
    n === 'noble'
      ? t('narratedStory.launcher.nobleTitle.noble' as NarratedStoryKey)
      : t(`narratedStory.launcher.nobleTitle.${n}.${g}` as NarratedStoryKey),
  getPenisSizeLabel: (p: NonNullable<PlayerProfile['penisSize']>) =>
    t(`narratedStory.launcher.penisSize.${p}` as NarratedStoryKey),
  getBustSizeLabel: (b: NonNullable<PlayerProfile['bustSize']>) =>
    t(`narratedStory.launcher.bustSize.${b}` as NarratedStoryKey),
})

const getGeneralImageOrFallback = (generalId: string): string | null => {
  const fromData = getGeneralImage(generalId)
  if (fromData) return fromData
  return `/images/generals/${generalId}.png`
}

const NarratedStoryApp: ComponentType<{ appId: string }> = () => {
  const { t, language } = useNarratedStoryTranslation()
  useGameData()

  const state = useNarratedStoryStore()
  const [activeTab, setActiveTab] = useState<TabId>('story')
  const [input, setInput] = useState('')
  const [sentDropdownOpen, setSentDropdownOpen] = useState(false)
  const [pendingProfileAfterLauncher, setPendingProfileAfterLauncher] = useState<PlayerProfile | null>(null)
  const [creatingIntro, setCreatingIntro] = useState(false)
  const [responding, setResponding] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const labels = getLabelHelpers(t)
  const selectedHeroines = heroines.filter((h) => state.selectedHeroineIds.includes(h.id))
  const derivedCharacters: Personaje[] = state.playerProfile
    ? [
        buildPlayerFromProfile(state.playerProfile, labels),
        ...selectedHeroines,
      ]
    : initialNarratedStoryData.characters
  const characters = state.playerProfile ? state.characters : derivedCharacters
  const messages: ChatMessage[] = state.messages.map((m) => ({
    id: m.id,
    role: m.role as ChatMessage['role'],
    content: m.content,
    ...(m.events != null && { events: m.events }),
    ...(m.turnSummary != null && { turnSummary: m.turnSummary }),
  }))

  useEffect(() => {
    initPersistence()
    getCurrentPartida()
      .then((partida) => {
        if (partida) {
          narratedStoryStore.dispatch({ type: 'LOAD_PARTIDA', payload: partida })
        } else {
          narratedStoryStore.dispatch({ type: 'UPDATE', payload: { loading: false } })
        }
      })
      .catch(() => narratedStoryStore.dispatch({ type: 'UPDATE', payload: { loading: false } }))
  }, [])

  const handleSend = () => {
    const text = input.trim()
    if (!text || responding) return
    setInput('')
    setResponding(true)
    runStoryTurn({ userMessage: text, language })
      .then(() => {})
      .catch((err) => {
        console.error('Story turn error:', err)
        const fallback: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'app',
          content: '*Something went wrong. Please try again.*',
        }
        narratedStoryStore.dispatch({
          type: 'UPDATE',
          payload: {
            messages: [...narratedStoryStore.getState().messages, fallback],
          },
        })
      })
      .finally(() => setResponding(false))
  }

  const handleSelectSentMessage = (message: string) => {
    setInput(message)
    setSentDropdownOpen(false)
    textareaRef.current?.focus()
  }

  const handleResend = (message: { id: string; content: string }) => {
    const msgs = narratedStoryStore.getState().messages
    const idx = msgs.findIndex((m) => m.id === message.id)
    if (idx === -1 || msgs[idx].role !== 'user') return
    if (!window.confirm(t('narratedStory.chat.resendConfirm' as NarratedStoryKey))) return
    const truncated = msgs.slice(0, idx)
    const userCount = truncated.filter((m) => m.role === 'user').length
    const sentMessages = narratedStoryStore.getState().sentMessages.slice(0, userCount)
    const turnNumber = truncated.filter((m) => m.role === 'app').length + 1
    narratedStoryStore.dispatch({
      type: 'UPDATE',
      payload: { messages: truncated, sentMessages, turnNumber },
    })
    setResponding(true)
    runStoryTurn({ userMessage: message.content, language })
      .catch((err) => {
        console.error('Story turn error (resend):', err)
        const fallback: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'app',
          content: '*Something went wrong. Please try again.*',
        }
        narratedStoryStore.dispatch({
          type: 'UPDATE',
          payload: {
            messages: [...narratedStoryStore.getState().messages, fallback],
          },
        })
      })
      .finally(() => setResponding(false))
  }

  const handleCreateIntro = () => {
    if (!state.playerProfile) return
    setCreatingIntro(true)
    runIntroTurn({ language })
      .catch((err) => {
        console.error('Create intro error:', err)
        const fallback: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'app',
          content: `*Could not generate intro: ${err.message}. Check API key and that the server is running.*`,
        }
        narratedStoryStore.dispatch({
          type: 'UPDATE',
          payload: { messages: [fallback] },
        })
      })
      .finally(() => setCreatingIntro(false))
  }

  const handleLauncherComplete = (profile: PlayerProfile) => {
    setPendingProfileAfterLauncher(profile)
  }

  const handleStoryPromptBack = () => {
    setPendingProfileAfterLauncher(null)
  }

  const handleStoryPromptConfirm = (values: {
    systemPrompt: string
    storyPrompt: string
    kinksPrompt: string
    extraIndications: string
  }) => {
    if (!pendingProfileAfterLauncher) return
    const profile = pendingProfileAfterLauncher
    const initialCharacters: Personaje[] = [
      buildPlayerFromProfile(profile, labels),
      ...heroines,
    ]
    narratedStoryStore.dispatch({
      type: 'UPDATE',
      payload: {
        playerProfile: profile,
        characters: initialCharacters,
        messages: [],
        sentMessages: [],
        systemPrompt: values.systemPrompt,
        storyPrompt: values.storyPrompt,
        kinksPrompt: values.kinksPrompt,
        extraIndications: values.extraIndications,
        selectedHeroineIds: heroines.map((h) => h.id),
        places: placesOfInterest,
        placeAdditionalInfo: {},
        turnNumber: 1,
        loading: false,
      },
    })
    setPendingProfileAfterLauncher(null)
  }

  const handleHeroineToggle = (heroineId: string, checked: boolean) => {
    const next = checked
      ? [...state.selectedHeroineIds, heroineId]
      : state.selectedHeroineIds.filter((id) => id !== heroineId)
    const playerChar =
      state.characters.find((c) => c.role === 'player') ??
      (state.playerProfile ? buildPlayerFromProfile(state.playerProfile, labels) : initialNarratedStoryData.characters[0])
    const newCharacters: Personaje[] = [
      playerChar as Personaje,
      ...heroines.filter((h) => next.includes(h.id)),
    ]
    narratedStoryStore.dispatch({
      type: 'UPDATE',
      payload: { selectedHeroineIds: next, characters: newCharacters },
    })
  }

  const handleUpdatePrompt = (field: 'systemPrompt' | 'storyPrompt' | 'kinksPrompt' | 'extraIndications', value: string) => {
    narratedStoryStore.dispatch({ type: 'UPDATE', payload: { [field]: value } })
  }

  if (state.loading) {
    return (
      <div className="narrated-story-layout" aria-busy="true" aria-live="polite">
        <p className="narrated-story-welcome">{t('narratedStory.loading')}</p>
      </div>
    )
  }
  if (pendingProfileAfterLauncher !== null) {
    return (
      <StoryPromptStep
        initialSystemPrompt={DEFAULT_SYSTEM_PROMPT}
        initialStoryPrompt={DEFAULT_STORY_PROMPT}
        initialKinksPrompt={DEFAULT_KINKS_PROMPT}
        initialExtraIndications={DEFAULT_EXTRA_INDICATIONS}
        onConfirm={handleStoryPromptConfirm}
        onBack={handleStoryPromptBack}
      />
    )
  }
  if (state.playerProfile === null) {
    return <PlayerLauncher onComplete={handleLauncherComplete} />
  }

  return (
    <div className="narrated-story-layout">
      <aside className="narrated-story-panel" role="tablist" aria-label={t('narratedStory.title')}>
        <ul className="narrated-story-panel-tabs">
          {TABS.map(({ id, icon: Icon }) => (
            <li key={id}>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`narrated-story-panel-${id}`}
                id={`narrated-story-tab-${id}`}
                className="narrated-story-tab"
                onClick={() => setActiveTab(id)}
              >
                <span className="narrated-story-tab-icon" aria-hidden>
                  <Icon className="icon" />
                </span>
                <span className="narrated-story-tab-label">{t(`narratedStory.tab.${id}` as const)}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main
        id={`narrated-story-panel-${activeTab}`}
        className={`narrated-story-content${activeTab === 'story' ? ' narrated-story-content--story-active' : ''}`}
        role="tabpanel"
        aria-labelledby={`narrated-story-tab-${activeTab}`}
      >
        {activeTab === 'story' && (
          <StoryChat
            messages={messages}
            input={input}
            onInputChange={setInput}
            sentMessages={state.sentMessages}
            sentDropdownOpen={sentDropdownOpen}
            onToggleSentDropdown={() => setSentDropdownOpen((o) => !o)}
            onSelectSentMessage={handleSelectSentMessage}
            creatingIntro={creatingIntro}
            responding={responding}
            onCreateIntro={handleCreateIntro}
            onSend={handleSend}
            onResend={handleResend}
            textareaRef={textareaRef}
          />
        )}
        {activeTab === 'info' && (
          <div className="narrated-story-panel-content ns-info-panel">
            <h2 className="section-title">
              <GiBookmarklet className="icon icon-md icon-amber" aria-hidden />
              {' '}
              {t('narratedStory.tab.info')}
            </h2>
            <p className="ns-info-intro">Information about the current story and controls.</p>
            <section className="ns-info-prompts-section" aria-labelledby="ns-info-prompts-heading">
              <h3 id="ns-info-prompts-heading" className="ns-prompts-heading">
                <GiScrollUnfurled className="icon icon-sm" aria-hidden />
                {' '}
                {t('narratedStory.tab.systemPrompt')}
              </h3>
              <p className="ns-system-prompt-hint">{t('narratedStory.systemPrompt.hint')}</p>
              <textarea
                className="ns-system-prompt-input"
                value={state.systemPrompt}
                onChange={(e) => handleUpdatePrompt('systemPrompt', e.target.value)}
                placeholder={t('narratedStory.systemPrompt.placeholder')}
                rows={8}
                aria-label={t('narratedStory.systemPrompt.placeholder')}
              />
              <section className="ns-prompts-section" aria-labelledby="ns-info-story-heading">
                <h4 id="ns-info-story-heading" className="ns-prompts-heading">
                  {t('narratedStory.prompts.storyPromptLabel')}
                </h4>
                <textarea
                  className="ns-system-prompt-input ns-system-prompt-input--short"
                  value={state.storyPrompt}
                  onChange={(e) => handleUpdatePrompt('storyPrompt', e.target.value)}
                  placeholder={t('narratedStory.prompts.storyPromptPlaceholder')}
                  rows={4}
                  aria-label={t('narratedStory.prompts.storyPromptLabel')}
                />
              </section>
              <section className="ns-prompts-section" aria-labelledby="ns-info-kinks-heading">
                <h4 id="ns-info-kinks-heading" className="ns-prompts-heading">
                  {t('narratedStory.prompts.kinksLabel')}
                </h4>
                <textarea
                  className="ns-system-prompt-input ns-system-prompt-input--short"
                  value={state.kinksPrompt}
                  onChange={(e) => handleUpdatePrompt('kinksPrompt', e.target.value)}
                  placeholder={t('narratedStory.prompts.kinksPlaceholder')}
                  rows={2}
                  aria-label={t('narratedStory.prompts.kinksLabel')}
                />
              </section>
              <section className="ns-prompts-section" aria-labelledby="ns-info-extra-heading">
                <h4 id="ns-info-extra-heading" className="ns-prompts-heading">
                  {t('narratedStory.prompts.extraIndicationsLabel')}
                </h4>
                <textarea
                  className="ns-system-prompt-input ns-system-prompt-input--short"
                  value={state.extraIndications}
                  onChange={(e) => handleUpdatePrompt('extraIndications', e.target.value)}
                  placeholder={t('narratedStory.prompts.extraIndicationsPlaceholder')}
                  rows={2}
                  aria-label={t('narratedStory.prompts.extraIndicationsLabel')}
                />
              </section>
            </section>
          </div>
        )}
        {activeTab === 'notes' && (
          <div className="narrated-story-panel-content">
            <h2 className="section-title">{t('narratedStory.tab.notes')}</h2>
            <p>Your notes and bookmarks.</p>
          </div>
        )}
        {activeTab === 'characters' && (
          <CharactersView
            characters={characters}
            places={state.places}
            getGeneralImage={getGeneralImageOrFallback}
            playerProfile={state.playerProfile}
          />
        )}
        {activeTab === 'places' && (
          <PlacesView
            places={state.places}
            characters={characters}
            getGeneralImage={getGeneralImageOrFallback}
            placeAdditionalInfo={state.placeAdditionalInfo}
          />
        )}
        {activeTab === 'config' && (
          <div className="narrated-story-panel-content ns-config-panel">
            <h2 className="section-title">
              <GiCardRandom className="icon icon-md icon-amber" aria-hidden />
              {' '}
              {t('narratedStory.tab.config')}
            </h2>
            <section className="ns-config-section" aria-labelledby="ns-config-characters-heading">
              <h3 id="ns-config-characters-heading" className="ns-config-heading">
                {t('narratedStory.config.charactersTitle')}
              </h3>
              <p className="ns-config-hint">{t('narratedStory.config.charactersHint')}</p>
              <ul className="ns-config-heroine-list" role="group" aria-label={t('narratedStory.config.charactersTitle')}>
                {heroines.map((h) => (
                  <li key={h.id} className="ns-config-heroine-item">
                    <label className="ns-config-heroine-label">
                      <input
                        type="checkbox"
                        checked={state.selectedHeroineIds.includes(h.id)}
                        onChange={(e) => handleHeroineToggle(h.id, e.target.checked)}
                        className="ns-config-heroine-checkbox"
                      />
                      <span className="ns-config-heroine-name">{h.name}</span>
                      <span className="ns-config-heroine-meta">{h.class} · {h.race}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default NarratedStoryApp
