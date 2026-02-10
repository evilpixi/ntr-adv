import { useState } from 'react'
import type { ComponentType } from 'react'
import { useGameData } from '@/data/gameData'
import { TabsContent } from './TabsContent'
import './dataLibrary.css'

type TabId = 'kingdoms' | 'generals' | 'provinces'

const TABS: { id: TabId; label: string }[] = [
  { id: 'kingdoms', label: 'Reinos' },
  { id: 'generals', label: 'Generales' },
  { id: 'provinces', label: 'Provincias' },
]

const DataLibraryApp: ComponentType<{ appId: string }> = () => {
  const { loaded, error } = useGameData()
  const [tab, setTab] = useState<TabId>('kingdoms')

  if (error) {
    return (
      <div className="data-library-container" style={{ padding: 'var(--space-lg)', color: 'var(--color-error)' }}>
        Error al cargar los datos: {error.message}
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="data-library-container" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
        Cargando datos…
      </div>
    )
  }

  return (
    <div className="data-library-container">
      <header className="data-library-header">
        <h1>Biblioteca de Datos</h1>
      </header>
      <div className="data-library-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`data-library-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
            data-tab={t.id}
          >
            {t.label}
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
