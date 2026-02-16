import { useCallback, useEffect, useState } from 'react'
import { useApp } from '../../store/AppContext'
import { settingsStore } from '../../store/settings'
import {
  RESOLUTION_OPTIONS,
  UI_SCALE_OPTIONS,
  LANGUAGE_OPTIONS,
} from '../../store/settings'
import { loadAiSettings, saveAiSettings, type AIServiceKey } from '../../store/aiSettings'
import { t } from '../../i18n'
import './SettingsModal.css'

const AI_SERVICE_OPTIONS: { value: AIServiceKey; labelEs: string; labelEn: string }[] = [
  { value: 'openai', labelEs: 'OpenAI (GPT)', labelEn: 'OpenAI (GPT)' },
  { value: 'deepseek', labelEs: 'DeepSeek', labelEn: 'DeepSeek' },
  { value: 'grok', labelEs: 'Grok (xAI)', labelEn: 'Grok (xAI)' },
  { value: 'ollama', labelEs: 'Ollama (local)', labelEn: 'Ollama (local)' },
]

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
  const [aiSettings, setAiSettings] = useState(() => loadAiSettings())

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
                    {value === 'auto' ? t('settings.resolution.auto', lang) : label}
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
                {LANGUAGE_OPTIONS.map(({ value }) => (
                  <option key={value} value={value}>
                    {value === 'es' ? t('settings.langEs', lang) : t('settings.langEn', lang)}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="settings-section">
            <h3 className="settings-section-title">{t('settings.aiSection', lang)}</h3>
            <div className="settings-row">
              <label className="label">{t('settings.aiService', lang)}</label>
              <select
                className="select"
                value={aiSettings.service}
                onChange={(e) => {
                  const v = e.target.value as AIServiceKey
                  setAiSettings((prev) => ({ ...prev, service: v }))
                  saveAiSettings({ service: v })
                }}
                style={{ maxWidth: '14rem' }}
              >
                {AI_SERVICE_OPTIONS.map(({ value, labelEs, labelEn }) => (
                  <option key={value} value={value}>
                    {lang === 'es' ? labelEs : labelEn}
                  </option>
                ))}
              </select>
            </div>
            {aiSettings.service !== 'ollama' && (
              <>
                <div className="settings-row" style={{ marginTop: 'var(--space-md)' }}>
                  <label className="label">{t('settings.aiApiKey', lang)}</label>
                  <input
                    type="password"
                    className="input"
                    placeholder={t('settings.aiApiKeyPlaceholder', lang)}
                    value={
                      aiSettings.service === 'openai'
                        ? aiSettings.openaiApiKey
                        : aiSettings.service === 'deepseek'
                          ? aiSettings.deepseekApiKey
                          : aiSettings.grokApiKey
                    }
                    onChange={(e) => {
                      const v = e.target.value
                      const key =
                        aiSettings.service === 'openai'
                          ? 'openaiApiKey'
                          : aiSettings.service === 'deepseek'
                            ? 'deepseekApiKey'
                            : 'grokApiKey'
                      setAiSettings((prev) => ({ ...prev, [key]: v }))
                      saveAiSettings({ [key]: v })
                    }}
                    style={{ maxWidth: '20rem' }}
                    autoComplete="off"
                  />
                </div>
                <div className="settings-row" style={{ marginTop: 'var(--space-sm)' }}>
                  <label className="label">{t('settings.aiBaseUrl', lang)}</label>
                  <input
                    type="text"
                    className="input"
                    value={
                      aiSettings.service === 'openai'
                        ? aiSettings.openaiBaseUrl
                        : aiSettings.service === 'deepseek'
                          ? aiSettings.deepseekBaseUrl
                          : aiSettings.grokBaseUrl
                    }
                    onChange={(e) => {
                      const v = e.target.value
                      const key =
                        aiSettings.service === 'openai'
                          ? 'openaiBaseUrl'
                          : aiSettings.service === 'deepseek'
                            ? 'deepseekBaseUrl'
                            : 'grokBaseUrl'
                      setAiSettings((prev) => ({ ...prev, [key]: v }))
                      saveAiSettings({ [key]: v })
                    }}
                    style={{ maxWidth: '20rem' }}
                  />
                </div>
                <div className="settings-row" style={{ marginTop: 'var(--space-sm)' }}>
                  <label className="label">{t('settings.aiModel', lang)}</label>
                  <input
                    type="text"
                    className="input"
                    value={
                      aiSettings.service === 'openai'
                        ? aiSettings.openaiModel
                        : aiSettings.service === 'deepseek'
                          ? aiSettings.deepseekModel
                          : aiSettings.grokModel
                    }
                    onChange={(e) => {
                      const v = e.target.value
                      const key =
                        aiSettings.service === 'openai'
                          ? 'openaiModel'
                          : aiSettings.service === 'deepseek'
                            ? 'deepseekModel'
                            : 'grokModel'
                      setAiSettings((prev) => ({ ...prev, [key]: v }))
                      saveAiSettings({ [key]: v })
                    }}
                    style={{ maxWidth: '14rem' }}
                  />
                </div>
              </>
            )}
            {aiSettings.service === 'ollama' && (
              <>
                <div className="settings-row" style={{ marginTop: 'var(--space-md)' }}>
                  <label className="label">{t('settings.aiBaseUrl', lang)}</label>
                  <input
                    type="text"
                    className="input"
                    value={aiSettings.ollamaBaseUrl}
                    onChange={(e) => {
                      const v = e.target.value
                      setAiSettings((prev) => ({ ...prev, ollamaBaseUrl: v }))
                      saveAiSettings({ ollamaBaseUrl: v })
                    }}
                    style={{ maxWidth: '20rem' }}
                  />
                </div>
                <div className="settings-row" style={{ marginTop: 'var(--space-sm)' }}>
                  <label className="label">{t('settings.aiModel', lang)}</label>
                  <input
                    type="text"
                    className="input"
                    value={aiSettings.ollamaModel}
                    onChange={(e) => {
                      const v = e.target.value
                      setAiSettings((prev) => ({ ...prev, ollamaModel: v }))
                      saveAiSettings({ ollamaModel: v })
                    }}
                    style={{ maxWidth: '14rem' }}
                  />
                </div>
              </>
            )}
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
