import type { ComponentType } from 'react'
import { clearCurrentPartida, deleteNarratedStoryDatabase } from './saveGameDb'
import { useNarratedStoryTranslation } from './i18n'

const NarratedStoryMenuOptions: ComponentType<{ appId: string }> = () => {
  const { t } = useNarratedStoryTranslation()

  const handleNewGame = () => {
    clearCurrentPartida()
      .then(() => window.location.reload())
      .catch(console.error)
  }

  const handleClearIndexedDB = () => {
    deleteNarratedStoryDatabase()
      .then(() => window.location.reload())
      .catch(console.error)
  }

  return (
    <div className="shell-app-options" role="group" aria-label={t('narratedStory.options.title')}>
      <button
        type="button"
        className="btn shell-menu-btn"
        onClick={handleNewGame}
      >
        {t('narratedStory.options.newGame')}
      </button>
      <button
        type="button"
        className="btn shell-menu-btn"
        onClick={handleClearIndexedDB}
      >
        {t('narratedStory.options.clearIndexedDB')}
      </button>
    </div>
  )
}

export default NarratedStoryMenuOptions
