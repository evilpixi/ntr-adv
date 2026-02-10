import { useCallback, useEffect } from 'react'
import { useApp } from '../../store/AppContext'
import { settingsStore } from '../../store/settings'
import {
  RESOLUTION_OPTIONS,
  UI_SCALE_OPTIONS,
  LANGUAGE_OPTIONS,
} from '../../store/settings'
import { t } from '../../i18n'
import './SettingsModal.css'

interface SettingsModalProps {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    settings,
    setResolution,
    setUIScale,
    setFullscreen,
    setVolume,
    setMuted,
    setLanguage,
    setOpenSettings,
    setCurrentAppId,
  } = useApp()
  const lang = settings.language

  const handleClose = useCallback(() => {
    settingsStore.save(settings)
    onClose()
  }, [settings, onClose])

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    },
    [handleClose]
  )
  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  const handleExit = useCallback(() => {
    settingsStore.save(settings)
    setCurrentAppId(null)
    setOpenSettings(false)
    onClose()
  }, [settings, setCurrentAppId, setOpenSettings, onClose])

  const handleFullscreen = useCallback(() => {
    const next = !settings.fullscreen
    setFullscreen(next)
    if (next) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [settings.fullscreen, setFullscreen])

  return (
    <div
      className="settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 id="settings-title" className="settings-title">
            {t('settings.title', lang)}
          </h2>
          <button
            type="button"
            className="settings-close"
            onClick={handleClose}
            aria-label={t('settings.closeAria', lang)}
          >
            ×
          </button>
        </div>
        <div className="settings-body">
          <section className="settings-section">
            <h3 className="settings-section-title">{t('settings.screen', lang)}</h3>
            <div className="settings-row">
              <label className="label">{t('settings.resolution', lang)}</label>
              <select
                className="select"
                value={settings.resolution}
                onChange={(e) => setResolution(e.target.value as typeof settings.resolution)}
                style={{ maxWidth: '12rem' }}
              >
                {RESOLUTION_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="settings-row" style={{ marginTop: 'var(--space-md)' }}>
              <label className="label">{t('settings.fullscreen', lang)}</label>
              <button
                type="button"
                className={settings.fullscreen ? 'btn btn-primary' : 'btn'}
                onClick={handleFullscreen}
              >
                {settings.fullscreen ? t('settings.deactivate', lang) : t('settings.activate', lang)}
              </button>
            </div>
          </section>

          <section className="settings-section">
            <h3 className="settings-section-title">{t('settings.ui', lang)}</h3>
            <div className="settings-row">
              <label className="label">{t('settings.uiScale', lang)}</label>
              <select
                className="select"
                value={settings.uiScale}
                onChange={(e) => setUIScale(e.target.value as typeof settings.uiScale)}
                style={{ maxWidth: '8rem' }}
              >
                {UI_SCALE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="settings-section">
            <h3 className="settings-section-title">{t('settings.sound', lang)}</h3>
            <div className="settings-row">
              <label className="label">{t('settings.volume', lang)}</label>
              <input
                type="range"
                className="input"
                min={0}
                max={1}
                step={0.05}
                value={settings.muted ? 0 : settings.volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  setVolume(v)
                  if (v > 0) setMuted(false)
                }}
                style={{ maxWidth: '8rem' }}
              />
            </div>
            <div className="settings-row" style={{ marginTop: 'var(--space-sm)' }}>
              <label className="label">{t('settings.mute', lang)}</label>
              <button
                type="button"
                className={settings.muted ? 'btn btn-primary' : 'btn'}
                onClick={() => setMuted(!settings.muted)}
              >
                {settings.muted ? t('settings.unmute', lang) : t('settings.mute', lang)}
              </button>
            </div>
          </section>

          <section className="settings-section">
            <h3 className="settings-section-title">{t('settings.language', lang)}</h3>
            <div className="settings-row">
              <label className="label">{t('settings.language', lang)}</label>
              <select
                className="select"
                value={settings.language}
                onChange={(e) => setLanguage(e.target.value as typeof settings.language)}
                style={{ maxWidth: '10rem' }}
              >
                {LANGUAGE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <div className="settings-actions">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              {t('settings.closeButton', lang)}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleExit}>
              {t('settings.exitToMenu', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
