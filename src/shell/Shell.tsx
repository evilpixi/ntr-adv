import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '../store/AppContext'
import { t } from '../i18n'
import { AppContainer } from '../apps/AppContainer'
import { AppSelector } from './AppSelector'
import { MainMenu } from './MainMenu'
import { SettingsModal } from './Settings/SettingsModal'
import './Shell.css'

export function Shell() {
  const { currentAppId, setCurrentAppId, openSettings, setOpenSettings, settings, setLanguage } = useApp()
  const lang = settings.language
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLElement>(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen, closeMenu])

  useEffect(() => {
    document.documentElement.dataset.uiScale = settings.uiScale
  }, [settings.uiScale])

  useEffect(() => {
    document.body.dataset.currentApp = currentAppId ?? ''
    return () => {
      document.body.dataset.currentApp = ''
    }
  }, [currentAppId])

  return (
    <div className="shell">
      <header className="shell-header-wrap" ref={dropdownRef}>
        <div className="shell-header">
          {currentAppId ? (
            <button
              type="button"
              className="btn btn-ghost shell-back"
              onClick={() => setCurrentAppId(null)}
              aria-label={t('shell.backAria', lang)}
            >
              {t('shell.back', lang)}
            </button>
          ) : null}
          <h1 className="shell-title">NTR Adventure</h1>
          <div className="shell-lang-switch" aria-label={t('shell.langAria', lang)}>
            <button
              type="button"
              className={`shell-lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
              aria-pressed={lang === 'en'}
            >
              {t('shell.langEn', lang)}
            </button>
            <button
              type="button"
              className={`shell-lang-btn ${lang === 'es' ? 'active' : ''}`}
              onClick={() => setLanguage('es')}
              aria-pressed={lang === 'es'}
            >
              {t('shell.langEs', lang)}
            </button>
          </div>
          <button
            type="button"
            className="shell-menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('shell.menuClose', lang) : t('shell.menuOpen', lang)}
          >
            <span className="shell-menu-toggle-icon" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
        {menuOpen ? (
          <div className="shell-dropdown">
            <MainMenu />
          </div>
        ) : null}
      </header>

      <main className="shell-content">
        {currentAppId ? (
          <AppContainer appId={currentAppId} />
        ) : (
          <AppSelector />
        )}
      </main>

      {openSettings ? (
        <SettingsModal onClose={() => setOpenSettings(false)} />
      ) : null}
    </div>
  )
}
