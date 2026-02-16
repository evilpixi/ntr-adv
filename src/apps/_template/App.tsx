import type { ComponentType } from 'react'
import { t } from '@/i18n'
import { useApp } from '@/store/AppContext'

const TemplateApp: ComponentType<{ appId: string }> = () => {
  const { settings } = useApp()
  const lang = settings.language
  return (
    <div style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
      <p className="section-title">{t('template.title', lang)}</p>
      <p style={{ color: 'var(--color-text-muted)' }}>{t('template.description', lang)}</p>
    </div>
  )
}

export default TemplateApp
