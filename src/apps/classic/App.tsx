import { useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { useGameData } from '@/data/gameData'
import { Game } from '../../../js/game.js'
import '../../../css/style.css'

const ClassicApp: ComponentType<{ appId: string }> = () => {
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

  if (error) {
    return (
      <div className="classic-app-container" style={{ padding: 'var(--space-lg)', color: 'var(--color-error)' }}>
        Error al cargar los datos: {error.message}
      </div>
    )
  }

  if (mountError) {
    return (
      <div className="classic-app-container" style={{ padding: 'var(--space-lg)', color: 'var(--color-error)' }}>
        Error al iniciar el juego: {mountError}
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="classic-app-container" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
        Cargando juego…
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
          <h1 className="game-title">NTR Adventure</h1>
          <div className="title-bar-actions">
            <button id="backToWelcomeBtn" type="button" className="btn btn-secondary" aria-hidden="true" tabIndex={-1} style={{ visibility: 'hidden', pointerEvents: 'none' }}>
              Volver al Inicio
            </button>
            <button id="generateInitialStoryBtn" type="button" className="btn btn-primary">
              Generate Initial Story
            </button>
            <button id="nextTurnBtn" type="button" className="btn btn-primary">
              Next Turn
            </button>
            <button id="saveGameBtn" type="button" className="btn btn-secondary">
              Save Game
            </button>
            <button id="loadGameBtn" type="button" className="btn btn-secondary">
              Load Game
            </button>
          </div>
        </div>

        <div className="game-container-inner">
          <div className="panel info-panel">
            <div className="info-tabs">
              <button type="button" className="tab-btn active" data-tab="kingdoms">
                Kingdoms
              </button>
              <button type="button" className="tab-btn" data-tab="generals">
                Generals
              </button>
              <button type="button" className="tab-btn" data-tab="provinces">
                Provinces
              </button>
              <button type="button" className="tab-btn" data-tab="actions">
                Actions
              </button>
              <button type="button" className="tab-btn" data-tab="history">
                History
              </button>
            </div>

            <div className="tab-content active" id="tab-kingdoms">
              <div className="kingdoms-list" id="kingdomsList" />
            </div>

            <div className="tab-content" id="tab-generals">
              <div className="generals-section">
                <h3>Your Generals</h3>
                <div className="generals-list" id="playerGeneralsList" />
              </div>
              <div className="generals-section">
                <h3>Enemy Generals</h3>
                <div className="generals-list" id="enemyGeneralsList" />
              </div>
            </div>

            <div className="tab-content" id="tab-provinces">
              <div className="provinces-map" id="provincesMap" />
            </div>

            <div className="tab-content" id="tab-actions">
              <div className="actions-panel" id="actionsPanel">
                <p>Select a general to assign an action</p>
                <div className="assigned-actions" id="assignedActions" />
              </div>
            </div>

            <div className="tab-content" id="tab-history">
              <div className="history-content" id="historyContent">
                <div className="history-entry">
                  <p className="welcome-message">Welcome to the game. The kingdom awaits you...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal" id="actionModal">
        <div className="modal-content">
          <span className="close-modal" aria-hidden>&times;</span>
          <h3 id="modalTitle">Assign Action</h3>
          <div id="modalBody" />
        </div>
      </div>

      <div className="modal" id="loadingModal">
        <div className="modal-content">
          <div className="loading-spinner" />
          <p id="loadingText">Loading...</p>
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
