import type { ComponentType } from 'react'
import { GiScrollQuill } from '@/theme/icons'
import { useNarratedStoryTranslation } from './i18n'

/**
 * App con su propio sistema i18n (locales en ./locales, idioma desde la raíz).
 */
const NarratedStoryApp: ComponentType<{ appId: string }> = () => {
  const { t } = useNarratedStoryTranslation()
  return (
    <div className="app-blank-page">
      <h2 className="section-title">
        <GiScrollQuill className="icon icon-md icon-amber" aria-hidden />
        {' '}
        {t('narratedStory.title')}
      </h2>
      <p className="app-blank-intro">{t('narratedStory.intro')}</p>
    </div>
  )
}

export default NarratedStoryApp
