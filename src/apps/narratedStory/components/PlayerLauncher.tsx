import { useState, useCallback } from 'react'
import type { ComponentType } from 'react'
import {
  GiMale,
  GiFemale,
  GiPerson,
  GiSwordsEmblem,
  GiWizardStaff,
  GiGoldBar,
  GiScrollQuill,
  GiCrown,
  GiQueenCrown,
  GiKing,
  GiHourglass,
} from '@/theme/icons'
import { useNarratedStoryTranslation } from '../i18n'
import type { PlayerProfile, GoverningStyle, GenderKey, GenitaliaKey, NobleTitleKey, PenisSizeKey, BustSizeKey } from '../types'
import '../narratedStory.css'

const GOVERNING_STYLES: { id: GoverningStyle; icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }> }[] = [
  { id: 'general', icon: GiSwordsEmblem },
  { id: 'brujo', icon: GiWizardStaff },
  { id: 'mercante', icon: GiGoldBar },
  { id: 'diplomatico', icon: GiScrollQuill },
]

const GENDER_OPTIONS: { id: GenderKey; icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }> }[] = [
  { id: 'female', icon: GiFemale },
  { id: 'male', icon: GiMale },
  { id: 'nonbinary', icon: GiPerson },
]

const GENITALIA_OPTIONS: { id: GenitaliaKey; icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }> }[] = [
  { id: 'vagina', icon: GiFemale },
  { id: 'penis', icon: GiMale },
]

const NOBLE_TITLE_OPTIONS: { id: NobleTitleKey; icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }> }[] = [
  { id: 'prince', icon: GiQueenCrown },
  { id: 'king', icon: GiKing },
  { id: 'noble', icon: GiCrown },
]

const DEFAULT_NAME_BY_GENDER: Record<GenderKey, string> = {
  female: 'Aelia',
  male: 'Auro',
  nonbinary: 'Aether',
}

interface PlayerLauncherProps {
  onComplete: (profile: PlayerProfile) => void
}

export const PlayerLauncher: ComponentType<PlayerLauncherProps> = ({ onComplete }) => {
  const { t } = useNarratedStoryTranslation()
  const [gender, setGender] = useState<GenderKey>('female')
  const [name, setName] = useState(DEFAULT_NAME_BY_GENDER.female)
  const [genitalia, setGenitalia] = useState<GenitaliaKey>('penis')
  const [penisSize, setPenisSize] = useState<PenisSizeKey>(4)
  const [bustSize, setBustSize] = useState<BustSizeKey>('C')
  const [nobleTitle, setNobleTitle] = useState<NobleTitleKey>('prince')
  const [governingStyle, setGoverningStyle] = useState<GoverningStyle>('general')
  const [portraitError, setPortraitError] = useState(false)
  const [portraitLoading, setPortraitLoading] = useState(true)

  const handleGenderChange = (id: GenderKey) => {
    setGender(id)
    setName(DEFAULT_NAME_BY_GENDER[id])
    setPortraitError(false)
    setPortraitLoading(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const profile: PlayerProfile = {
      name: name.trim() || DEFAULT_NAME_BY_GENDER[gender],
      gender,
      genitalia,
      penisSize: genitalia === 'penis' ? penisSize : undefined,
      bustSize: gender === 'female' || gender === 'nonbinary' ? bustSize : undefined,
      nobleTitle,
      appearanceDescription: '',
      governingStyle,
    }
    onComplete(profile)
  }

  const characterImageId = DEFAULT_NAME_BY_GENDER[gender].toLowerCase()
  const characterImageSrc = `/images/generals/${characterImageId}.png`
  const handlePortraitError = useCallback(() => {
    setPortraitError(true)
    setPortraitLoading(false)
  }, [])
  const handlePortraitLoad = useCallback(() => setPortraitLoading(false), [])

  return (
    <div className="ns-launcher-backdrop" role="dialog" aria-modal="true" aria-labelledby="ns-launcher-title">
      <div className="ns-launcher-modal">
        <div className="ns-launcher-modal-inner">
          <div className="ns-launcher-form-wrap">
            <h1 id="ns-launcher-title" className="ns-launcher-title">
              {t('narratedStory.launcher.title')}
            </h1>
            <p className="ns-launcher-subtitle">{t('narratedStory.launcher.subtitle')}</p>

            <form onSubmit={handleSubmit} className="ns-launcher-form">
              <div className="ns-launcher-field">
                <label htmlFor="ns-launcher-name">{t('narratedStory.launcher.name')}</label>
                <input
                  id="ns-launcher-name"
                  type="text"
                  className="ns-launcher-input"
                  placeholder={t('narratedStory.launcher.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  aria-required="true"
                />
              </div>

              <div className="ns-launcher-field ns-launcher-field--row">
                <span className="ns-launcher-label">{t('narratedStory.launcher.gender')}</span>
                <div className="ns-launcher-icon-options ns-launcher-icon-options--inline" role="group" aria-label={t('narratedStory.launcher.gender')}>
                  {GENDER_OPTIONS.map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      className={`ns-launcher-icon-btn ${gender === id ? 'ns-launcher-icon-btn--selected' : ''}`}
                      onClick={() => handleGenderChange(id)}
                      aria-pressed={gender === id}
                    >
                      <Icon className="ns-launcher-icon" aria-hidden />
                      <span className="ns-launcher-icon-label">{t(`narratedStory.launcher.genderOption.${id}` as const)}</span>
                    </button>
                  ))}
                </div>
              </div>

          <div className="ns-launcher-field ns-launcher-field--row">
            <span className="ns-launcher-label">{t('narratedStory.launcher.genitalia')}</span>
            <div className="ns-launcher-icon-options ns-launcher-icon-options--inline" role="group" aria-label={t('narratedStory.launcher.genitalia')}>
              {GENITALIA_OPTIONS.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`ns-launcher-icon-btn ${genitalia === id ? 'ns-launcher-icon-btn--selected' : ''}`}
                  onClick={() => setGenitalia(id)}
                  aria-pressed={genitalia === id}
                >
                  <Icon className="ns-launcher-icon" aria-hidden />
                  <span className="ns-launcher-icon-label">{t(`narratedStory.launcher.genitaliaOption.${id}` as const)}</span>
                </button>
              ))}
            </div>
          </div>

          <section className="ns-launcher-sliders-section" aria-label={t('narratedStory.launcher.penisSize' as const)}>
            <div className={`ns-launcher-slider-field ${genitalia !== 'penis' ? 'ns-launcher-field--disabled' : ''}`}>
              <label className="ns-launcher-slider-label">
                <span className="ns-launcher-label">{t('narratedStory.launcher.penisSize' as const)}</span>
                <span className="ns-launcher-slider-value" aria-live="polite">
                  {t(`narratedStory.launcher.penisSize.${penisSize}` as const)}
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={penisSize}
                onChange={(e) => setPenisSize(Number(e.target.value) as PenisSizeKey)}
                disabled={genitalia !== 'penis'}
                className="ns-launcher-slider"
                aria-label={t('narratedStory.launcher.penisSize' as const)}
              />
            </div>
            <div className={`ns-launcher-slider-field ${gender === 'male' ? 'ns-launcher-field--disabled' : ''}`}>
              <label className="ns-launcher-slider-label">
                <span className="ns-launcher-label">{t('narratedStory.launcher.bustSize' as const)}</span>
                <span className="ns-launcher-slider-value" aria-live="polite">
                  {t(`narratedStory.launcher.bustSize.${bustSize}` as const)}
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={6}
                step={1}
                value={['A', 'B', 'C', 'D', 'E', 'F', 'G'].indexOf(bustSize)}
                onChange={(e) => setBustSize((['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const)[Number(e.target.value)])}
                disabled={gender === 'male'}
                className="ns-launcher-slider"
                aria-label={t('narratedStory.launcher.bustSize' as const)}
                aria-valuetext={t(`narratedStory.launcher.bustSize.${bustSize}` as const)}
              />
            </div>
          </section>

          <div className="ns-launcher-field ns-launcher-field--row">
            <span className="ns-launcher-label">{t('narratedStory.launcher.nobleTitle')}</span>
            <div className="ns-launcher-icon-options ns-launcher-icon-options--inline" role="group" aria-label={t('narratedStory.launcher.nobleTitle')}>
              {NOBLE_TITLE_OPTIONS.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`ns-launcher-icon-btn ${nobleTitle === id ? 'ns-launcher-icon-btn--selected' : ''}`}
                  onClick={() => setNobleTitle(id)}
                  aria-pressed={nobleTitle === id}
                >
                  <Icon className="ns-launcher-icon" aria-hidden />
                  <span className="ns-launcher-icon-label">
                    {id === 'noble' ? t('narratedStory.launcher.nobleTitle.noble' as const) : t(`narratedStory.launcher.nobleTitle.${id}.${gender}` as const)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <fieldset className="ns-launcher-fieldset ns-launcher-fieldset--centered">
            <legend className="ns-launcher-legend">{t('narratedStory.launcher.governingStyle')}</legend>
            <div className="ns-launcher-style-grid">
              {GOVERNING_STYLES.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`ns-launcher-style-btn ${governingStyle === id ? 'ns-launcher-style-btn--selected' : ''}`}
                  onClick={() => setGoverningStyle(id)}
                  aria-pressed={governingStyle === id}
                >
                  <span className="ns-launcher-style-icon" aria-hidden>
                    <Icon className="icon" />
                  </span>
                  <span className="ns-launcher-style-label">
                    {t(`narratedStory.launcher.governingStyle.${id}` as const)}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="ns-launcher-actions">
            <button type="submit" className="ns-launcher-submit" aria-label={t('narratedStory.launcher.start')}>
              {t('narratedStory.launcher.start')}
            </button>
          </div>
        </form>
          </div>

          <div className="ns-launcher-portrait-wrap" aria-hidden>
            {portraitError ? (
              <div className="ns-launcher-portrait ns-launcher-portrait--placeholder" aria-hidden>
                {name.charAt(0)}
              </div>
            ) : (
              <>
                {portraitLoading && (
                  <div className="ns-launcher-portrait ns-launcher-portrait--loading" aria-hidden>
                    <GiHourglass className="ns-launcher-loading-icon" aria-hidden />
                  </div>
                )}
                <img
                  src={characterImageSrc}
                  alt=""
                  className={`ns-launcher-portrait ${portraitLoading ? 'ns-launcher-portrait--hidden' : ''}`}
                  onError={handlePortraitError}
                  onLoad={handlePortraitLoad}
                />
              </>
            )}
            <span className="ns-launcher-portrait-name">{name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
