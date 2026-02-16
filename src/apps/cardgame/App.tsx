import { useState } from 'react'
import type { ComponentType } from 'react'
import { GiCardRandom } from '@/theme/icons'
import { getGeneralImage, useGameData } from '@/data/gameData'
import { useCardGameTranslation } from './i18n'
import { CardsView } from './CardsView'
import { initialCardGameData } from './sampleData'
import './cardgame.css'

/**
 * Card Game app: mazo de cartas TCG (héroes, magia, objetos, soldados).
 * Rebrand independiente de Narrated Story; usa las mismas estructuras de datos.
 */
const CardGameApp: ComponentType<{ appId: string }> = () => {
  const { t } = useCardGameTranslation()
  useGameData()
  const [data] = useState(initialCardGameData)

  return (
    <div className="cardgame-layout">
      <main className="cardgame-content">
        <h1 className="cardgame-title">
          <GiCardRandom className="icon icon-md icon-amber" aria-hidden />
          {' '}
          {t('cardgame.title')}
        </h1>
        <div className="cardgame-main">
          <CardsView
            cards={data.cards}
            places={data.places}
            getGeneralImage={getGeneralImage}
          />
        </div>
      </main>
    </div>
  )
}

export default CardGameApp
