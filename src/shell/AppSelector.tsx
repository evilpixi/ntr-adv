import { getAvailableApps } from '../apps'
import { useApp } from '../store/AppContext'
import { t } from '../i18n'
import './Shell.css'

export function AppSelector() {
  const { setCurrentAppId, settings } = useApp()
  const apps = getAvailableApps().filter((a) => a.manifest.id !== '_template')
  const lang = settings.language

  return (
    <div className="app-selector-page">
      <h2 className="section-title">{t('appSelector.title', lang)}</h2>
      <div className="apps-grid">
        {apps.map(({ manifest }) => (
          <button
            key={manifest.id}
            type="button"
            className="btn app-card"
            onClick={() => setCurrentAppId(manifest.id)}
          >
            <p className="app-card-name">
              {manifest.id === 'narrated-story'
                ? t('app.narrated-story.name', lang)
                : manifest.id === 'cardgame'
                  ? t('app.cardgame.name', lang)
                  : manifest.id === 'classic'
                    ? t('app.classic.name', lang)
                    : manifest.id === 'data-library'
                      ? t('app.data-library.name', lang)
                      : manifest.name}
            </p>
            <p className="app-card-desc">
              {manifest.id === 'narrated-story'
                ? t('app.narrated-story.description', lang)
                : manifest.id === 'cardgame'
                  ? t('app.cardgame.description', lang)
                  : manifest.id === 'classic'
                    ? t('app.classic.description', lang)
                    : manifest.id === 'data-library'
                      ? t('app.data-library.description', lang)
                      : manifest.description}
            </p>
            <span className="app-card-badges">
              {manifest.legacy ? (
                <span className="app-card-badge app-card-badge-legacy">{t('app.legacy', lang)}</span>
              ) : null}
              {manifest.id === 'cardgame' ? (
                <span className="app-card-badge app-card-badge-development">{t('app.inDevelopment', lang)}</span>
              ) : null}
              <span className="app-card-badge">
                {manifest.type === 'game-mode' ? t('app.typeGame', lang) : t('app.typeApp', lang)}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
