import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { ComponentType } from 'react'
import type { Personaje, PlayerProfile, Place } from '../types'
import type { NarratedStoryKey } from '../locales/keys'
import { useNarratedStoryTranslation } from '../i18n'
import { GiHearts, GiMuscleUp, GiRunningShoe, GiBrain, GiSpeaker } from '@/theme/icons'

interface CharactersViewProps {
  characters: Personaje[]
  places?: Place[]
  getGeneralImage?: (generalId: string) => string | null
  playerProfile?: PlayerProfile | null
}

const STAT_ICONS = {
  hp: GiHearts,
  fuerza: GiMuscleUp,
  agilidad: GiRunningShoe,
  inteligencia: GiBrain,
  carisma: GiSpeaker,
} as const

const STAT_KEYS = ['hp', 'fuerza', 'agilidad', 'inteligencia', 'carisma'] as const

function CharacterImage({
  src,
  alt,
  className = '',
}: {
  src: string | null | undefined
  alt: string
  className?: string
}) {
  if (!src) {
    return (
      <div className={`ns-char-portrait placeholder ${className}`.trim()} aria-hidden>
        <span>{alt.charAt(0).toUpperCase()}</span>
      </div>
    )
  }
  const placeholderChar = alt.charAt(0).toUpperCase()
  const svgContent = `<svg width="400" height="500" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#2a2a3e"/><text x="50%" y="50%" font-family="sans-serif" font-size="80" fill="#6b7280" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${placeholderChar}</text></svg>`
  const placeholderDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`

  return (
    <img
      src={src}
      alt=""
      className={`ns-char-portrait ${className}`.trim()}
      loading="lazy"
      onError={(e) => {
        const target = e.currentTarget
        target.onerror = null
        target.src = placeholderDataUrl
        target.classList.add('placeholder')
      }}
    />
  )
}

function StatRow({
  statKey,
  value,
  label,
}: {
  statKey: (typeof STAT_KEYS)[number]
  value: number
  label: string
}) {
  const Icon = STAT_ICONS[statKey]
  return (
    <div className={`ns-char-stat ns-char-stat--${statKey}`}>
      <span className="ns-char-stat-icon" aria-hidden>
        <Icon />
      </span>
      <span className="ns-char-stat-value">{value}</span>
      <span className="ns-char-stat-label">{label}</span>
    </div>
  )
}

/** Barra 0–100 para corrupción, amor al regente, lujuria. */
function RelationMeter({
  label,
  value,
  variant,
  compact,
}: {
  label: string
  value: number
  variant: 'corruption' | 'love' | 'lust'
  compact?: boolean
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={`ns-char-relation-meter ns-char-relation-meter--${variant}${compact ? ' ns-char-relation-meter--compact' : ''}`}>
      <span className="ns-char-relation-label">{label}</span>
      <div className="ns-char-relation-track" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${pct}`}>
        <div className="ns-char-relation-fill" style={{ width: `${pct}%` }} />
      </div>
      {!compact && <span className="ns-char-relation-value">{pct}</span>}
    </div>
  )
}

function getPlaceName(placeId: string | undefined, places: Place[]): string {
  if (!placeId) return ''
  const place = places.find((p) => p.id === placeId)
  return place?.name ?? placeId
}

function CharacterDetailModal({
  character,
  imageUrl,
  onClose,
  t,
  playerProfile,
  allCharacters,
  places = [],
}: {
  character: Personaje
  imageUrl: string | null
  onClose: () => void
  t: (key: NarratedStoryKey, vars?: Record<string, string | number>) => string
  playerProfile?: PlayerProfile | null
  allCharacters?: Personaje[]
  places?: Place[]
}) {
  const isPlayer = character.role === 'player'
  const showSexualData = isPlayer && playerProfile
  const nameById = new Map((allCharacters ?? []).map((c) => [c.id, c.name]))
  const hasSituation =
    character.currentPlaceId ||
    character.currentActivity ||
    character.currentState ||
    character.sexCount != null ||
    (character.developedKinks && character.developedKinks.length > 0)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    const cb = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', cb)
    return () => document.removeEventListener('keydown', cb)
  }, [onClose])

  return (
    <div
      className="ns-char-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ns-char-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
    >
      <div className="ns-char-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="ns-char-modal-close"
          onClick={onClose}
          aria-label={t('narratedStory.character.close' as NarratedStoryKey)}
        >
          ×
        </button>
        <div className="ns-char-modal-portrait-wrap">
          <CharacterImage src={imageUrl} alt={character.name} className="ns-char-modal-portrait" />
        </div>
        <div className="ns-char-modal-body">
          <h2 id="ns-char-modal-title" className="ns-char-modal-name">
            {character.name}
          </h2>
          {(character.class || character.race || character.nobleTitle) && (
            <p className="ns-char-modal-meta">
              {[character.nobleTitle, character.class, character.race].filter(Boolean).join(' · ')}
            </p>
          )}
          <p className="ns-char-role-badge ns-char-role-badge--strong" aria-label={t(`narratedStory.character.role.${character.role}` as NarratedStoryKey)}>
            {t(`narratedStory.character.role.${character.role}` as NarratedStoryKey)}
          </p>
          {hasSituation && (
            <div className="ns-char-modal-situation" aria-labelledby="ns-char-situation-heading">
              <h3 id="ns-char-situation-heading" className="ns-char-description-title">
                {t('narratedStory.character.currentSituation' as NarratedStoryKey)}
              </h3>
              <dl className="ns-char-situation-dl">
                {(character.currentPlaceId || character.currentActivity || character.currentState) && (
                  <>
                    {character.currentPlaceId && (
                      <>
                        <dt>{t('narratedStory.places.characterLocation' as NarratedStoryKey)}</dt>
                        <dd>{getPlaceName(character.currentPlaceId, places) || character.currentPlaceId}</dd>
                      </>
                    )}
                    {character.currentActivity && (
                      <>
                        <dt>{t('narratedStory.places.currentActivity' as NarratedStoryKey)}</dt>
                        <dd>{character.currentActivity}</dd>
                      </>
                    )}
                    {character.currentState && (
                      <>
                        <dt>{t('narratedStory.places.currentState' as NarratedStoryKey)}</dt>
                        <dd>{character.currentState}</dd>
                      </>
                    )}
                  </>
                )}
                {character.sexCount != null && (
                  <>
                    <dt>{t('narratedStory.character.sexCount' as NarratedStoryKey)}</dt>
                    <dd>{character.sexCount}</dd>
                  </>
                )}
                {character.developedKinks && character.developedKinks.length > 0 && (
                  <>
                    <dt>{t('narratedStory.character.developedKinks' as NarratedStoryKey)}</dt>
                    <dd>
                      <ul className="ns-char-kinks-list">
                        {character.developedKinks.map((k) => (
                          <li key={k}>{k}</li>
                        ))}
                      </ul>
                    </dd>
                  </>
                )}
              </dl>
            </div>
          )}
          <div className="ns-char-modal-stats">
            {STAT_KEYS.map((key) => (
              <StatRow
                key={key}
                statKey={key}
                value={
                  key === 'hp'
                    ? character.hp
                    : key === 'fuerza'
                      ? character.fuerza
                      : key === 'agilidad'
                        ? character.agilidad
                        : key === 'inteligencia'
                          ? character.inteligencia
                          : character.carisma
                }
                label={t(`narratedStory.character.${key}` as NarratedStoryKey)}
              />
            ))}
          </div>
          {(character.corruption != null || character.loveRegent != null || character.lust != null || (character.feelingsToward && Object.keys(character.feelingsToward).length > 0)) && (
            <div className="ns-char-modal-relations">
              <h3 className="ns-char-description-title">{t('narratedStory.character.relationships' as NarratedStoryKey)}</h3>
              <div className="ns-char-relation-meters">
                {character.corruption != null && (
                  <RelationMeter label={t('narratedStory.character.corruption' as NarratedStoryKey)} value={character.corruption} variant="corruption" />
                )}
                {character.loveRegent != null && (
                  <RelationMeter label={t('narratedStory.character.loveRegent' as NarratedStoryKey)} value={character.loveRegent} variant="love" />
                )}
                {character.lust != null && (
                  <RelationMeter label={t('narratedStory.character.lust' as NarratedStoryKey)} value={character.lust} variant="lust" />
                )}
              </div>
              {character.feelingsToward && Object.keys(character.feelingsToward).length > 0 && (
                <ul className="ns-char-feelings-list" aria-label={t('narratedStory.character.relationships' as NarratedStoryKey)}>
                  {Object.entries(character.feelingsToward).map(([id, feeling]) => (
                    <li key={id} className="ns-char-feelings-item">
                      <span className="ns-char-feelings-target">{nameById.get(id) ?? id}</span>
                      <span className="ns-char-feelings-value">{feeling}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {showSexualData && playerProfile && (
            <div className="ns-char-modal-sexual">
              <h3 className="ns-char-description-title">{t('narratedStory.character.sexualData' as NarratedStoryKey)}</h3>
              <div className="ns-char-sexual-grid">
                <div className="ns-char-sexual-row">
                  <span className="ns-char-sexual-label">{t('narratedStory.character.gender' as NarratedStoryKey)}</span>
                  <span className="ns-char-sexual-value">{character.gender ?? t(`narratedStory.launcher.genderOption.${playerProfile.gender}` as NarratedStoryKey)}</span>
                </div>
                <div className="ns-char-sexual-row">
                  <span className="ns-char-sexual-label">{t('narratedStory.character.genitalia' as NarratedStoryKey)}</span>
                  <span className="ns-char-sexual-value">{character.genitalia ?? t(`narratedStory.launcher.genitaliaOption.${playerProfile.genitalia}` as NarratedStoryKey)}</span>
                </div>
                {playerProfile.genitalia === 'penis' && (
                  <div className="ns-char-sexual-row">
                    <span className="ns-char-sexual-label">{t('narratedStory.character.penisSize' as NarratedStoryKey)}</span>
                    <span className="ns-char-sexual-value">
                      {t(`narratedStory.character.penisSize.${typeof playerProfile.penisSize === 'number' && playerProfile.penisSize >= 1 && playerProfile.penisSize <= 7 ? playerProfile.penisSize : 4}` as NarratedStoryKey)}
                    </span>
                  </div>
                )}
                {(playerProfile.gender === 'female' || playerProfile.gender === 'nonbinary') && (
                  <div className="ns-char-sexual-row">
                    <span className="ns-char-sexual-label">{t('narratedStory.character.bustSize' as NarratedStoryKey)}</span>
                    <span className="ns-char-sexual-value">
                      {t(`narratedStory.character.bustSize.${typeof playerProfile.bustSize === 'string' && ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(playerProfile.bustSize) ? playerProfile.bustSize : 'C'}` as NarratedStoryKey)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="ns-char-modal-description">
            <h3 className="ns-char-description-title">{t('narratedStory.character.description' as NarratedStoryKey)}</h3>
            <p className="ns-char-description">{character.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CharacterCard({
  character,
  getGeneralImage,
  onSelect,
}: {
  character: Personaje
  getGeneralImage?: (id: string) => string | null
  onSelect: () => void
}) {
  const { t } = useNarratedStoryTranslation()
  const imageUrl =
    character.generalId && getGeneralImage
      ? getGeneralImage(character.generalId)
      : character.imageUrl ?? null

  return (
    <article
      className="ns-char-card"
      data-role={character.role}
      aria-labelledby={`ns-char-name-${character.id}`}
    >
      <button
        type="button"
        className="ns-char-card-btn"
        onClick={onSelect}
        aria-label={t('narratedStory.character.viewDetail', { name: character.name })}
      >
        <div className="ns-char-card-inner">
          <div className="ns-char-portrait-wrap">
            <CharacterImage src={imageUrl} alt={character.name} />
          </div>
          <div className="ns-char-info">
            <h2 id={`ns-char-name-${character.id}`} className="ns-char-name">
              {character.name}
            </h2>
            {(character.class || character.race || character.nobleTitle) && (
              <p className="ns-char-meta">
                {[character.nobleTitle, character.class, character.race].filter(Boolean).join(' · ')}
              </p>
            )}
            <p className="ns-char-role-badge ns-char-role-badge--strong" aria-label={t(`narratedStory.character.role.${character.role}`)}>
              {t(`narratedStory.character.role.${character.role}`)}
            </p>
            {(character.currentActivity || character.currentState) && (
              <p className="ns-char-card-situation" aria-label={t('narratedStory.character.currentSituation' as NarratedStoryKey)}>
                {[character.currentActivity, character.currentState].filter(Boolean).join(' · ')}
              </p>
            )}
            <div className="ns-char-stats ns-char-stats--compact">
              {STAT_KEYS.map((key) => (
                <StatRow
                  key={key}
                  statKey={key}
                  value={
                    key === 'hp'
                      ? character.hp
                      : key === 'fuerza'
                        ? character.fuerza
                        : key === 'agilidad'
                          ? character.agilidad
                          : key === 'inteligencia'
                            ? character.inteligencia
                            : character.carisma
                  }
                  label={t(`narratedStory.character.${key}` as NarratedStoryKey)}
                />
              ))}
            </div>
            {(character.corruption != null || character.loveRegent != null || character.lust != null) && (
              <div className="ns-char-card-relations">
                {character.corruption != null && (
                  <RelationMeter label={t('narratedStory.character.corruption' as NarratedStoryKey)} value={character.corruption} variant="corruption" compact />
                )}
                {character.loveRegent != null && (
                  <RelationMeter label={t('narratedStory.character.loveRegent' as NarratedStoryKey)} value={character.loveRegent} variant="love" compact />
                )}
                {character.lust != null && (
                  <RelationMeter label={t('narratedStory.character.lust' as NarratedStoryKey)} value={character.lust} variant="lust" compact />
                )}
              </div>
            )}
          </div>
        </div>
      </button>
    </article>
  )
}

export const CharactersView: ComponentType<CharactersViewProps> = ({
  characters,
  places = [],
  getGeneralImage,
  playerProfile,
}) => {
  const { t } = useNarratedStoryTranslation()
  const [selectedCharacter, setSelectedCharacter] = useState<Personaje | null>(null)

  // Keep modal in sync with latest character data when list updates (e.g. after AI tool updates).
  useEffect(() => {
    if (!selectedCharacter) return
    const updated = characters.find((c) => c.id === selectedCharacter.id)
    if (updated && updated !== selectedCharacter) setSelectedCharacter(updated)
  }, [characters, selectedCharacter])

  const selectedImageUrl =
    selectedCharacter &&
    (selectedCharacter.generalId && getGeneralImage
      ? getGeneralImage(selectedCharacter.generalId)
      : selectedCharacter.imageUrl ?? null)

  return (
    <div className="ns-characters-view">
      <h2 className="section-title ns-characters-title">
        {t('narratedStory.tab.characters')}
      </h2>
      {characters.length === 0 ? (
        <p className="ns-characters-empty">{t('narratedStory.charactersEmpty')}</p>
      ) : (
        <div className="ns-characters-grid" role="list">
          {characters.map((c) => (
            <div key={c.id} role="listitem">
              <CharacterCard
                character={c}
                getGeneralImage={getGeneralImage}
                onSelect={() => setSelectedCharacter(c)}
              />
            </div>
          ))}
        </div>
      )}
      {selectedCharacter &&
        createPortal(
          <CharacterDetailModal
            character={selectedCharacter}
            imageUrl={selectedImageUrl}
            onClose={() => setSelectedCharacter(null)}
            t={t}
            playerProfile={playerProfile}
            allCharacters={characters}
            places={places ?? []}
          />,
          document.body
        )}
    </div>
  )
}
