import { useApp } from '../store/AppContext'
import { getApp } from '../apps'
import { t } from '../i18n'
import './Shell.css'

function isNativeApp(): boolean {
  return typeof (window as unknown as { Capacitor?: unknown }).Capacitor !== 'undefined'
}

export function MainMenu() {
  const { setOpenSettings, setCurrentAppId, settings, currentAppId } = useApp()
  const native = isNativeApp()
  const lang = settings.language
  const app = currentAppId ? getApp(currentAppId) : null
  const MenuOptions = app?.MenuOptions

  const handleExit = () => {
    setCurrentAppId(null)
    if (native) {
      try {
        const Cap = (window as unknown as { Capacitor?: { App?: { exitApp: () => void } } }).Capacitor
        Cap?.App?.exitApp?.()
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="shell-dropdown-inner shell-dropdown-menu-only">
      {MenuOptions ? (
        <section className="shell-menu-section" aria-labelledby="shell-app-options-heading">
          <h2 id="shell-app-options-heading" className="shell-menu-section-title">
            {t('menu.appOptions', lang)}
          </h2>
          <MenuOptions appId={currentAppId!} />
        </section>
      ) : null}
      <div className="shell-menu-section">
        <button
          type="button"
          className="btn btn-primary shell-menu-btn"
          onClick={() => setOpenSettings(true)}
        >
          {t('menu.settings', lang)}
        </button>
        {native ? (
          <button
            type="button"
            className="btn shell-menu-btn"
            onClick={handleExit}
          >
            {t('menu.exit', lang)}
          </button>
        ) : null}
      </div>
    </div>
  )
}
