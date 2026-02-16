import { useState } from 'react'
import type { ComponentType } from 'react'
import { useGameData } from '@/data/gameData'
import { t } from '@/i18n'
import { useApp } from '@/store/AppContext'
import { TabsContent } from './TabsContent'
import './dataLibrary.css'

type TabId = 'kingdoms' | 'generals' | 'provinces'

const TAB_IDS: TabId[] = ['kingdoms', 'generals', 'provinces']

const DataLibraryApp: ComponentType<{ appId: string }> = () => {
  const { settings } = useApp()
  const lang = settings.language
  const { loaded, error } = useGameData()
  const [tab, setTab] = useState<TabId>('kingdoms')

  if (error) {
    return (
      <div className="data-library-container" style={{ padding: 'var(--space-lg)', color: 'var(--color-error)' }}>
        {t('dataLibrary.loadError', lang)} {error.message}
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="data-library-container" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
        {t('dataLibrary.loading', lang)}
      </div>
    )
  }

  return (
    <div className="data-library-container">
      <header className="data-library-header">
        <h1>{t('dataLibrary.title', lang)}</h1>
      </header>
      <div className="data-library-tabs">
        {TAB_IDS.map((tabId) => (
          <button
            key={tabId}
            type="button"
            className={`data-library-tab ${tab === tabId ? 'active' : ''}`}
            onClick={() => setTab(tabId)}
            data-tab={tabId}
          >
            {t(`dataLibrary.tab.${tabId}`, lang)}
          </button>
        ))}
      </div>
      <div className="data-library-content">
        <TabsContent tab={tab} />
      </div>
    </div>
  )
}

export default DataLibraryApp
