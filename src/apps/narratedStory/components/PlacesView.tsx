import type { ComponentType } from 'react'
import type { Place, Personaje } from '../types'
import { useNarratedStoryTranslation } from '../i18n'
import { GiCastle } from '@/theme/icons'
import { withBaseUrl } from '@/utils/assetUrl'

interface PlacesViewProps {
  places: Place[]
  characters: Personaje[]
  getGeneralImage?: (generalId: string) => string | null
  /** Info adicional por lugar (placeId -> texto). Solo la IA la rellena; el jugador no puede editarla. */
  placeAdditionalInfo?: Record<string, string>
}

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
      <div className={`ns-place-char-avatar placeholder ${className}`.trim()} aria-hidden>
        <span>{alt.charAt(0).toUpperCase()}</span>
      </div>
    )
  }
  const placeholderChar = alt.charAt(0).toUpperCase()
  const svgContent = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#2a2a3e"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#6b7280" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${placeholderChar}</text></svg>`
  const placeholderDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`

  return (
    <img
      src={withBaseUrl(src) ?? src}
      alt=""
      className={`ns-place-char-avatar ${className}`.trim()}
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

function CharacterAtPlaceItem({
  character,
  getGeneralImage,
}: {
  character: Personaje
  getGeneralImage?: (id: string) => string | null
}) {
  const imageUrl =
    character.generalId && getGeneralImage
      ? getGeneralImage(character.generalId)
      : character.imageUrl ?? null

  const borderClass =
    character.role === 'player'
      ? 'ns-place-char-item--player'
      : character.role === 'hero'
        ? 'ns-place-char-item--hero'
        : ''

  return (
    <div className={`ns-place-char-item ${borderClass}`.trim()} data-role={character.role}>
      <div className="ns-place-char-avatar-wrap">
        <CharacterImage src={imageUrl} alt={character.name} />
      </div>
      <span className="ns-place-char-name">{character.name}</span>
    </div>
  )
}

export const PlacesView: ComponentType<PlacesViewProps> = ({
  places,
  characters,
  getGeneralImage,
  placeAdditionalInfo = {},
}) => {
  const { t } = useNarratedStoryTranslation()

  const getCharactersAtPlace = (placeId: string) =>
    characters.filter((c) => c.currentPlaceId === placeId)

  return (
    <div className="ns-places-view">
      <h2 className="section-title ns-places-title">
        <GiCastle className="icon icon-md icon-amber" aria-hidden />
        {' '}
        {t('narratedStory.tab.places')}
      </h2>
      {places.length === 0 ? (
        <p className="ns-places-empty">{t('narratedStory.placesEmpty')}</p>
      ) : (
        <ul className="ns-places-list" role="list">
          {places.map((place) => {
            const atPlace = getCharactersAtPlace(place.id)
            const additionalInfo = placeAdditionalInfo[place.id] ?? ''
            return (
              <li key={place.id} className="ns-place-card" role="listitem">
                <header className="ns-place-header">
                  <h3 className="ns-place-name">{place.name}</h3>
                </header>
                {place.description && (
                  <p className="ns-place-description">{place.description}</p>
                )}
                <section
                  className="ns-place-additional-info"
                  aria-labelledby={`ns-place-additional-${place.id}`}
                >
                  <h4 id={`ns-place-additional-${place.id}`} className="ns-place-additional-title">
                    {t('narratedStory.places.additionalInfo')}
                  </h4>
                  <p className="ns-place-additional-text">
                    {additionalInfo ? (
                      additionalInfo
                    ) : (
                      <span className="ns-place-additional-empty">—</span>
                    )}
                  </p>
                </section>
                {atPlace.length > 0 && (
                  <ul className="ns-place-characters-list" role="list">
                    {atPlace.map((char) => (
                      <li key={char.id} role="listitem">
                        <CharacterAtPlaceItem
                          character={char}
                          getGeneralImage={getGeneralImage}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {characters.some((c) => !c.currentPlaceId) && (
        <section className="ns-places-unspecified" aria-labelledby="ns-place-unspecified-heading">
          <h3 id="ns-place-unspecified-heading" className="ns-place-unspecified-title">
            {t('narratedStory.places.withoutLocation')}
          </h3>
          <ul className="ns-place-characters-list" role="list">
            {characters
              .filter((c) => !c.currentPlaceId)
              .map((char) => (
                <li key={char.id} role="listitem">
                  <CharacterAtPlaceItem
                    character={char}
                    getGeneralImage={getGeneralImage}
                  />
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  )
}
