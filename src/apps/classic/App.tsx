import { useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { useGameData } from '@/data/gameData'
import { t } from '@/i18n'
import { useApp } from '@/store/AppContext'
import { Game } from '../../../js/game.js'
import '../../../css/style.css'

const ClassicApp: ComponentType<{ appId: string }> = () => {
  const { settings } = useApp()
  const lang = settings.language
  const gameRootRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<InstanceType<typeof Game> | null>(null)
  const { loaded, error } = useGameData()
  const [mountError, setMountError] = useState<string | null>(null)

  useEffect(() => {
    if (!loaded || error || !gameRootRef.current) return

    const root = gameRootRef.current
    const game = new Game({ rootElement: root })
    gameRef.current = game

    game
      .initializeGame('classic')
      .catch((e: unknown) => setMountError(e instanceof Error ? e.message : String(e)))

    return () => {
      game.destroy()
      gameRef.current = null
    }
  }, [loaded, error])

  // When language changes, re-render all game UI so labels/strings from game.js use the new language
  useEffect(() => {
    if (!gameRef.current) return
    gameRef.current.renderAll()
  }, [lang])

  if (error) {
    return (
      <div className="classic-app-container" style={{ padding: 'var(--space-lg)', color: 'var(--color-error)' }}>
        {t('classic.loadError', lang)} {error.message}
      </div>
    )
  }

  if (mountError) {
    return (
      <div className="classic-app-container" style={{ padding: 'var(--space-lg)', color: 'var(--color-error)' }}>
        {t('classic.initError', lang)} {mountError}
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="classic-app-container" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
        {t('classic.loading', lang)}
      </div>
    )
  }

  return (
    <div
      ref={gameRootRef}
      className="classic-app-container"
      style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
    >
      <div id="gameContainer" className="game-container">
        <div className="title-bar">
          <h1 className="game-title">{t('shell.title', lang)}</h1>
          <div className="title-bar-actions">
            <button id="backToWelcomeBtn" type="button" className="btn btn-secondary" aria-hidden="true" tabIndex={-1} style={{ visibility: 'hidden', pointerEvents: 'none' }}>
              {t('classic.backToWelcome', lang)}
            </button>
            <button id="generateInitialStoryBtn" type="button" className="btn btn-primary">
              {t('classic.generateInitialStory', lang)}
            </button>
            <button id="nextTurnBtn" type="button" className="btn btn-primary">
              {t('classic.nextTurn', lang)}
            </button>
            <button id="saveGameBtn" type="button" className="btn btn-secondary">
              {t('classic.saveGame', lang)}
            </button>
            <button id="loadGameBtn" type="button" className="btn btn-secondary">
              {t('classic.loadGame', lang)}
            </button>
          </div>
        </div>

        <div className="game-container-inner">
          <div className="panel info-panel">
            <div className="info-tabs">
              <button type="button" className="tab-btn active" data-tab="kingdoms">
                {t('classic.tab.kingdoms', lang)}
              </button>
              <button type="button" className="tab-btn" data-tab="generals">
                {t('classic.tab.generals', lang)}
              </button>
              <button type="button" className="tab-btn" data-tab="provinces">
                {t('classic.tab.provinces', lang)}
              </button>
              <button type="button" className="tab-btn" data-tab="actions">
                {t('classic.tab.actions', lang)}
              </button>
              <button type="button" className="tab-btn" data-tab="history">
                {t('classic.tab.history', lang)}
              </button>
            </div>

            <div className="tab-content active" id="tab-kingdoms">
              <div className="kingdoms-list" id="kingdomsList" />
            </div>

            <div className="tab-content" id="tab-generals">
              <div className="generals-section">
                <h3>{t('classic.yourGenerals', lang)}</h3>
                <div className="generals-list" id="playerGeneralsList" />
              </div>
              <div className="generals-section">
                <h3>{t('classic.enemyGenerals', lang)}</h3>
                <div className="generals-list" id="enemyGeneralsList" />
              </div>
            </div>

            <div className="tab-content" id="tab-provinces">
              <div className="provinces-map" id="provincesMap" />
            </div>

            <div className="tab-content" id="tab-actions">
              <div className="actions-panel" id="actionsPanel">
                <p>{t('classic.selectGeneral', lang)}</p>
                <div className="assigned-actions" id="assignedActions" />
              </div>
            </div>

            <div className="tab-content" id="tab-history">
              <div className="history-content" id="historyContent">
                <div className="history-entry">
                  <p className="welcome-message">{t('classic.welcomeMessage', lang)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal" id="actionModal">
        <div className="modal-content">
          <span className="close-modal" aria-hidden>&times;</span>
          <h3 id="modalTitle">{t('classic.assignAction', lang)}</h3>
          <div id="modalBody" />
        </div>
      </div>

      <div className="modal" id="loadingModal">
        <div className="modal-content">
          <div className="loading-spinner" />
          <p id="loadingText">{t('classic.loadingText', lang)}</p>
        </div>
      </div>

      <div className="modal" id="kingdomDetailModal">
        <div className="modal-content kingdom-detail-modal">
          <span className="close-modal" aria-hidden>&times;</span>
          <div id="kingdomDetailContent" />
        </div>
      </div>

      <div className="modal" id="generalDetailModal">
        <div className="modal-content general-detail-modal">
          <span className="close-modal" aria-hidden>&times;</span>
          <div id="generalDetailContent" />
        </div>
      </div>

      <div className="modal" id="provinceDetailModal">
        <div className="modal-content province-detail-modal">
          <span className="close-modal" aria-hidden>&times;</span>
          <div id="provinceDetailContent" />
        </div>
      </div>
    </div>
  )
}

export default ClassicApp
