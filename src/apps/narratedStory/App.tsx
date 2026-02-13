import { useState, useRef, useEffect } from 'react'
import type { ComponentType } from 'react'
import { GiScrollQuill, GiBookmarklet, GiNotebook, GiPerson, GiScrollUnfurled, GiCardRandom, GiCastle } from '@/theme/icons'
import { getGeneralImage, useGameData } from '@/data/gameData'
import { useNarratedStoryTranslation } from './i18n'
import { initialNarratedStoryData, buildPlayerFromProfile, heroines, placesOfInterest, migrateCharacters } from './sampleData'
import { getCurrentPartida, savePartida, type SavedMessage } from './saveGameDb'
import { DEFAULT_SYSTEM_PROMPT } from './defaultSystemPrompt'
import { DEFAULT_STORY_PROMPT } from './defaultStoryPrompt'
import { DEFAULT_KINKS_PROMPT } from './defaultKinksPrompt'
import { DEFAULT_EXTRA_INDICATIONS } from './defaultExtraIndications'
import { runNextTurn, type TurnMessage } from './runNextTurn'
import { realAIProvider } from './aiProviderApi'
import { buildFullSystemPromptForTurn } from './buildPromptForAI'
import { parseAppResponse } from './parseAppResponse'
import { StoryChat, CharactersView, PlacesView, PlayerLauncher, StoryPromptStep } from './components'
import type { NarratedStoryKey } from './locales/keys'
import type { ChatMessage, Personaje, PlayerProfile, Place } from './types'
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

function nextId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const INTRO_USER_MESSAGE =
  'Begin the story. Write the opening scene (2–3 paragraphs) and end with *What do you do?*'

/** Proveedor de IA: por defecto el real (backend). Cambiar a mockAIProvider para pruebas sin API. */
const AI_PROVIDER = realAIProvider

/**
 * App con chat: mensajes del usuario (texto) y de la app (Markdown).
 * Editor multilínea abajo + lista desplegable de mensajes enviados.
 */
type TFunc = (key: NarratedStoryKey, vars?: Record<string, string | number>) => string

const getLabelHelpers = (t: TFunc) => ({
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

/** Fallback URL cuando gameData aún no tiene la imagen. Mismo formato que los generales (.png). */
const getGeneralImageOrFallback = (generalId: string): string | null => {
  const fromData = getGeneralImage(generalId)
  if (fromData) return fromData
  return `/images/generals/${generalId}.png`
}

const NarratedStoryApp: ComponentType<{ appId: string }> = () => {
  const { t, language } = useNarratedStoryTranslation()
  useGameData() // carga game data para que getGeneralImage tenga imágenes
  const [loading, setLoading] = useState(true)
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null)
  /** Personajes desde partida guardada; si es null se derivan del perfil + heroines. */
  const [charactersOverride, setCharactersOverride] = useState<Personaje[] | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('story')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sentMessages, setSentMessages] = useState<string[]>([])
  const [sentDropdownOpen, setSentDropdownOpen] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [storyPrompt, setStoryPrompt] = useState('')
  const [kinksPrompt, setKinksPrompt] = useState('')
  const [extraIndications, setExtraIndications] = useState('')
  /** Ids de heroínas elegidas para la aventura (por defecto todas). */
  const [selectedHeroineIds, setSelectedHeroineIds] = useState<string[]>(() => heroines.map((h) => h.id))
  /** Info adicional por lugar (para la IA o el usuario). */
  const [placeAdditionalInfo, setPlaceAdditionalInfo] = useState<Record<string, string>>({})
  /** Lugares de la partida (la IA puede crear/actualizar; si no hay partida cargada se usan los por defecto). */
  const [places, setPlaces] = useState<Place[]>(placesOfInterest)
  /** Tras el launcher, perfil pendiente hasta que el usuario confirme el prompt de historia. */
  const [pendingProfileAfterLauncher, setPendingProfileAfterLauncher] = useState<PlayerProfile | null>(null)
  const [creatingIntro, setCreatingIntro] = useState(false)
  const [responding, setResponding] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const labels = getLabelHelpers(t)
  const selectedHeroines = heroines.filter((h) => selectedHeroineIds.includes(h.id))
  const derivedCharacters: Personaje[] = playerProfile
    ? [
        buildPlayerFromProfile(playerProfile, labels),
        ...selectedHeroines,
      ]
    : initialNarratedStoryData.characters
  const characters = charactersOverride ?? derivedCharacters

  /** Si hay partida guardada = juego iniciado: cargar y mostrar juego; si no, mostrar launcher. */
  useEffect(() => {
    getCurrentPartida()
      .then((partida) => {
        if (partida) {
          setPlayerProfile(partida.playerProfile)
          setCharactersOverride(migrateCharacters(partida.characters))
          setMessages(
            (partida.messages ?? []).map((m) => ({
              id: m.id,
              role: m.role as ChatMessage['role'],
              content: m.content,
              ...(m.events != null && { events: m.events }),
              ...(m.turnSummary != null && { turnSummary: m.turnSummary }),
            }))
          )
          setSentMessages(partida.sentMessages ?? [])
          setSystemPrompt(partida.systemPrompt ?? '')
          setStoryPrompt(partida.storyPrompt ?? '')
          setKinksPrompt(partida.kinksPrompt ?? '')
          setExtraIndications(partida.extraIndications ?? '')
          setSelectedHeroineIds(
            (partida.selectedHeroineIds ?? heroines.map((h) => h.id)).map((id) => (id === 'frost' ? 'zara' : id))
          )
          setPlaceAdditionalInfo(partida.placeAdditionalInfo ?? {})
          setPlaces(partida.places ?? placesOfInterest)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  /** Auto-guardado cuando cambian datos de la partida (solo si hay juego iniciado). */
  useEffect(() => {
    if (loading || !playerProfile) return
    const savedMessages: SavedMessage[] = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      ...(m.events != null && { events: m.events }),
      ...(m.turnSummary != null && { turnSummary: m.turnSummary }),
    }))
    savePartida(playerProfile, characters, {
      messages: savedMessages,
      sentMessages,
      systemPrompt,
      storyPrompt,
      kinksPrompt,
      extraIndications,
      selectedHeroineIds,
      placeAdditionalInfo,
      places,
    }).catch(console.error)
  }, [loading, playerProfile, characters, messages, sentMessages, systemPrompt, storyPrompt, kinksPrompt, extraIndications, selectedHeroineIds, placeAdditionalInfo, places])

  const handleSend = () => {
    const text = input.trim()
    if (!text || responding) return

    const userMsg: ChatMessage = { id: nextId(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setSentMessages((prev) => [...prev, text])
    setInput('')
    setResponding(true)

    const turnMessages: TurnMessage[] = [...messages, userMsg].map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    }))
    runNextTurn(
      {
        userMessage: text,
        playerProfile: playerProfile!,
        characters,
        messages: turnMessages,
        places,
        systemPrompt,
        storyPrompt,
        kinksPrompt,
        extraIndications,
        maxMessages: 50,
        language,
      },
      AI_PROVIDER
    )
      .then(({ narrative, events, turnSummary, characters: nextCharacters, places: nextPlaces }) => {
        const appReply: ChatMessage = {
          id: nextId(),
          role: 'app',
          content: narrative,
          events: events.length > 0 ? events : undefined,
          turnSummary: turnSummary || undefined,
        }
        setMessages((prev) => [...prev, appReply])
        setCharactersOverride(nextCharacters)
        setPlaces(nextPlaces)
        console.log('[Narrated Story] UI updated: characters=', nextCharacters.length, 'places=', nextPlaces.length)
      })
      .catch((err) => {
        console.error('Next turn error:', err)
        const fallback: ChatMessage = {
          id: nextId(),
          role: 'app',
          content: '*Something went wrong. Please try again.*',
        }
        setMessages((prev) => [...prev, fallback])
      })
      .finally(() => setResponding(false))
  }

  const handleSelectSentMessage = (message: string) => {
    setInput(message)
    setSentDropdownOpen(false)
    textareaRef.current?.focus()
  }

  const handleCreateIntro = () => {
    if (!playerProfile) return
    setCreatingIntro(true)
    const fullSystemPrompt = buildFullSystemPromptForTurn({
      playerProfile,
      characters,
      messages: [],
      places,
      systemPrompt,
      storyPrompt,
      kinksPrompt,
      extraIndications,
      maxMessages: 0,
      language,
    })
    realAIProvider({
      systemPrompt: fullSystemPrompt,
      userMessage: INTRO_USER_MESSAGE,
      messages: [{ id: 'intro', role: 'user', content: INTRO_USER_MESSAGE }],
    })
      .then(({ rawContent }) => {
        const { narrative } = parseAppResponse(rawContent)
        const appMsg: ChatMessage = { id: nextId(), role: 'app', content: narrative || rawContent }
        setMessages([appMsg])
      })
      .catch((err) => {
        console.error('Create intro error:', err)
        const fallback: ChatMessage = {
          id: nextId(),
          role: 'app',
          content: `*Could not generate intro: ${err.message}. Check API key and that the server is running.*`,
        }
        setMessages([fallback])
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
    savePartida(profile, initialCharacters, {
      messages: [],
      sentMessages: [],
      systemPrompt: values.systemPrompt,
      storyPrompt: values.storyPrompt,
      kinksPrompt: values.kinksPrompt,
      extraIndications: values.extraIndications,
      selectedHeroineIds: heroines.map((h) => h.id),
      places: placesOfInterest,
    }).catch(console.error)
    setPlayerProfile(profile)
    setCharactersOverride(initialCharacters)
    setPlaces(placesOfInterest)
    setSystemPrompt(values.systemPrompt)
    setStoryPrompt(values.storyPrompt)
    setKinksPrompt(values.kinksPrompt)
    setExtraIndications(values.extraIndications)
    setSelectedHeroineIds(heroines.map((h) => h.id))
    setPendingProfileAfterLauncher(null)
  }

  const handleHeroineToggle = (heroineId: string, checked: boolean) => {
    const next = checked
      ? [...selectedHeroineIds, heroineId]
      : selectedHeroineIds.filter((id) => id !== heroineId)
    setSelectedHeroineIds(next)
    const playerChar = characters.find((c) => c.role === 'player') ?? buildPlayerFromProfile(playerProfile!, labels)
    setCharactersOverride([playerChar, ...heroines.filter((h) => next.includes(h.id))])
  }

  if (loading) {
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
  if (playerProfile === null) {
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
            sentMessages={sentMessages}
            sentDropdownOpen={sentDropdownOpen}
            onToggleSentDropdown={() => setSentDropdownOpen((o) => !o)}
            onSelectSentMessage={handleSelectSentMessage}
            creatingIntro={creatingIntro}
            responding={responding}
            onCreateIntro={handleCreateIntro}
            onSend={handleSend}
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
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
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
                  value={storyPrompt}
                  onChange={(e) => setStoryPrompt(e.target.value)}
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
                  value={kinksPrompt}
                  onChange={(e) => setKinksPrompt(e.target.value)}
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
                  value={extraIndications}
                  onChange={(e) => setExtraIndications(e.target.value)}
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
            getGeneralImage={getGeneralImageOrFallback}
            playerProfile={playerProfile}
          />
        )}
        {activeTab === 'places' && (
          <PlacesView
            places={places}
            characters={characters}
            getGeneralImage={getGeneralImageOrFallback}
            placeAdditionalInfo={placeAdditionalInfo}
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
                        checked={selectedHeroineIds.includes(h.id)}
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
