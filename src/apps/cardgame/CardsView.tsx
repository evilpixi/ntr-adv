import type { ComponentType } from 'react'
import type { Card, HeroCard, Place } from './types'
import { isHeroCard } from './types'
import { useCardGameTranslation } from './i18n'

interface CardsViewProps {
  cards: Card[]
  places: Place[]
  getGeneralImage?: (generalId: string) => string | null
}

const CARD_TYPE_ICONS: Record<Card['type'], string> = {
  hero: '🦸',
  magic: '✨',
  item: '🎒',
  soldier: '⚔️',
}

function CardImage({
  src,
  alt,
  className,
}: {
  src: string | null
  alt: string
  className?: string
}) {
  if (!src) {
    return (
      <div className={`cg-card-art placeholder ${className ?? ''}`} aria-hidden>
        <span>{alt.charAt(0).toUpperCase()}</span>
      </div>
    )
  }
  const placeholderChar = alt.charAt(0).toUpperCase()
  const svgContent = `<svg width="200" height="280" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#2a2a3e"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" fill="#6b7280" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${placeholderChar}</text></svg>`
  const placeholderDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`

  return (
    <img
      src={src}
      alt=""
      className={`cg-card-art ${className ?? ''}`}
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

function HeroCardContent({ card }: { card: HeroCard }) {
  const { t } = useCardGameTranslation()
  return (
    <div className="cg-card-body">
      <div className="cg-card-stats">
        <span title={t('cardgame.card.hp')}>❤️ {card.hp}</span>
        <span title={t('cardgame.card.strength')}>💪 {card.strength}</span>
        <span title={t('cardgame.card.agility')}>🏃 {card.agility}</span>
        <span title={t('cardgame.card.intelligence')}>🧠 {card.intelligence}</span>
      </div>
      <p className="cg-card-meta">
        {card.class} · Nivel {card.level} · {card.race}
      </p>
      <p className="cg-card-relationship">{card.relationship}</p>
      {card.abilities.length > 0 && (
        <ul className="cg-card-abilities">
          {card.abilities.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CardItem({
  card,
  getGeneralImage,
}: {
  card: Card
  getGeneralImage?: (id: string) => string | null
}) {
  const typeLabelKey = `cardgame.cardType.${card.type}` as const
  const { t } = useCardGameTranslation()
  const imageUrl =
    card.type === 'hero' && card.generalId && getGeneralImage
      ? getGeneralImage(card.generalId)
      : null

  return (
    <article className="cg-card" data-card-type={card.type}>
      <div className="cg-card-frame">
        {(card.type === 'hero' || card.type === 'soldier') && (
          <div className="cg-card-art-wrap">
            {card.type === 'hero' ? (
              <CardImage src={imageUrl ?? null} alt={card.name} />
            ) : (
              <div className="cg-card-art placeholder">
                <span>{card.name.charAt(0)}</span>
              </div>
            )}
          </div>
        )}
        {card.type === 'magic' && (
          <div className="cg-card-art-wrap">
            <div className="cg-card-art placeholder magic">
              <span>✨</span>
            </div>
          </div>
        )}
        {card.type === 'item' && (
          <div className="cg-card-art-wrap">
            <div className="cg-card-art placeholder item">
              <span>🎒</span>
            </div>
          </div>
        )}

        <header className="cg-card-header">
          <span className="cg-card-type" aria-label={t(typeLabelKey)}>
            {CARD_TYPE_ICONS[card.type]}
          </span>
          <h3 className="cg-card-name">{card.name}</h3>
        </header>

        {card.type === 'magic' && card.description && (
          <p className="cg-card-desc">{card.description}</p>
        )}
        {card.type === 'item' && card.description && (
          <p className="cg-card-desc">{card.description}</p>
        )}
        {card.type === 'soldier' && (
          <p className="cg-card-desc">
            {(card.hp != null || card.attack != null) && (
              <>HP {card.hp ?? '?'} · ATK {card.attack ?? '?'}</>
            )}
            {card.description && ` — ${card.description}`}
          </p>
        )}
        {isHeroCard(card) && <HeroCardContent card={card} />}
      </div>
    </article>
  )
}

export const CardsView: ComponentType<CardsViewProps> = ({
  cards,
  places,
  getGeneralImage,
}) => {
  const { t } = useCardGameTranslation()
  return (
    <div className="cg-view">
      <section className="cg-cards-section">
        <h2 className="section-title">{t('cardgame.cardsTitle')}</h2>
        <div className="cg-grid" role="list">
          {cards.length === 0 ? (
            <p className="cg-empty">{t('cardgame.cardsEmpty')}</p>
          ) : (
            cards.map((card) => (
              <div key={card.id} role="listitem">
                <CardItem card={card} getGeneralImage={getGeneralImage} />
              </div>
            ))
          )}
        </div>
      </section>
      <section className="cg-places-section">
        <h2 className="section-title">{t('cardgame.placesTitle')}</h2>
        {places.length === 0 ? (
          <p className="cg-empty">{t('cardgame.placesEmpty')}</p>
        ) : (
          <ul className="cg-places-list">
            {places.map((place) => (
              <li key={place.id}>
                <strong>{place.name}</strong>
                {place.description && ` — ${place.description}`}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
