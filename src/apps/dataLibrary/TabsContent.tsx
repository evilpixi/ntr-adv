import {
  gameData,
  getKingdomById,
  getKingdomImage,
  getGeneralImage,
  getProvinceImage,
  getProvinceInfo,
  getProvinceDescription,
  getProvincePrompt,
} from '@/data/gameData'
import { DataLibraryImage } from './DataLibraryImage'

type TabId = 'kingdoms' | 'generals' | 'provinces'

interface TabsContentProps {
  tab: TabId
}

export function TabsContent({ tab }: TabsContentProps) {
  if (tab === 'kingdoms') return <KingdomsTab />
  if (tab === 'generals') return <GeneralsTab />
  return <ProvincesTab />
}

function KingdomsTab() {
  const kingdoms = gameData.getKingdoms()
  if (kingdoms.length === 0) return <p>No hay reinos disponibles.</p>

  type Kingdom = { id: string; name: string; theme?: string; owner?: string; description?: string; architecturalStyle?: string; biome?: string; governmentType?: string; socialDescription?: string }
  return (
    <div className="data-library-grid">
      {(kingdoms as Kingdom[]).map((kingdom) => {
        const generals = gameData.getGeneralsByKingdom(kingdom.id)
        const provinces = gameData.getProvinceNames(kingdom.id)
        const imageUrl = getKingdomImage(kingdom.id)
        return (
          <div key={kingdom.id} className="data-library-card kingdom-card">
            <div className="data-library-card-image">
              <DataLibraryImage imageUrl={imageUrl} alt={kingdom.name} className="kingdom-image" />
            </div>
            <div className="data-library-card-content">
              <h3>{kingdom.name}</h3>
              <div className="data-library-badges">
                {kingdom.theme ? <span className="badge">{kingdom.theme}</span> : null}
                <span className="badge">{kingdom.owner ?? 'ai'}</span>
              </div>
              {kingdom.description ? <p className="data-library-description">{kingdom.description}</p> : null}
              <div className="data-library-stats">
                <div className="stat">
                  <span className="stat-label">Generales:</span>
                  <span className="stat-value">{generals.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Provincias:</span>
                  <span className="stat-value">{provinces.length}</span>
                </div>
              </div>
              {kingdom.architecturalStyle ? (
                <div className="data-library-detail-section">
                  <h4>Arquitectura</h4>
                  <p>{kingdom.architecturalStyle}</p>
                </div>
              ) : null}
              {kingdom.biome ? (
                <div className="data-library-detail-section">
                  <h4>Bioma</h4>
                  <p>{kingdom.biome}</p>
                </div>
              ) : null}
              {kingdom.governmentType ? (
                <div className="data-library-detail-section">
                  <h4>Tipo de Gobierno</h4>
                  <p>{kingdom.governmentType}</p>
                </div>
              ) : null}
              {kingdom.socialDescription ? (
                <div className="data-library-detail-section">
                  <h4>Sociedad</h4>
                  <p>{kingdom.socialDescription}</p>
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function GeneralsTab() {
  const generals = gameData.getGenerals()
  if (generals.length === 0) return <p>No hay generales disponibles.</p>

  type General = { id: string; name: string; kingdom: string; description?: string; hp?: number; love?: number; strength?: number; personality?: string; physicalAppearance?: string; additionalData?: { age?: string; specialty?: string; favoriteWeapon?: string; background?: string } }
  const byKingdom: Record<string, General[]> = {}
  for (const g of generals as General[]) {
    const k = g.kingdom
    if (!byKingdom[k]) byKingdom[k] = []
    byKingdom[k].push(g)
  }

  return (
    <>
      {Object.entries(byKingdom).map(([kingdomId, list]) => {
        const kingdom = getKingdomById(kingdomId)
        const kingdomName = kingdom ? (kingdom as { name: string }).name : kingdomId
        return (
          <div key={kingdomId} className="data-library-section">
            <h2 className="data-library-section-title">{kingdomName}</h2>
            <div className="data-library-grid">
              {list.map((general) => {
                const imageUrl = getGeneralImage(general.id)
                return (
                  <div key={general.id} className="data-library-card general-card">
                    <div className="data-library-card-image">
                      <DataLibraryImage imageUrl={imageUrl} alt={general.name} className="general-image" />
                    </div>
                    <div className="data-library-card-content">
                      <h3>{general.name}</h3>
                      {general.description ? <p className="data-library-description">{general.description}</p> : null}
                      <div className="data-library-stats">
                        <div className="stat">
                          <span className="stat-label">HP:</span>
                          <span className="stat-value">{general.hp ?? 100}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Amor:</span>
                          <span className="stat-value">{general.love ?? 50}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Fuerza:</span>
                          <span className="stat-value">{general.strength ?? 10}</span>
                        </div>
                      </div>
                      {general.personality ? (
                        <div className="data-library-detail-section">
                          <h4>Personalidad</h4>
                          <p>{general.personality}</p>
                        </div>
                      ) : null}
                      {general.physicalAppearance ? (
                        <div className="data-library-detail-section">
                          <h4>Apariencia Física</h4>
                          <p>{general.physicalAppearance}</p>
                        </div>
                      ) : null}
                      {general.additionalData ? (
                        <div className="data-library-detail-section">
                          <h4>Información Adicional</h4>
                          <div className="additional-data">
                            {general.additionalData.age ? <p><strong>Edad:</strong> {general.additionalData.age}</p> : null}
                            {general.additionalData.specialty ? <p><strong>Especialidad:</strong> {general.additionalData.specialty}</p> : null}
                            {general.additionalData.favoriteWeapon ? <p><strong>Arma Favorita:</strong> {general.additionalData.favoriteWeapon}</p> : null}
                            {general.additionalData.background ? <p><strong>Antecedentes:</strong> {general.additionalData.background}</p> : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

function ProvincesTab() {
  const kingdoms = gameData.getKingdoms()
  const provinces = gameData.getProvinces()
  if (kingdoms.length === 0) return <p>No hay provincias disponibles.</p>

  type KingdomBasic = { id: string; name: string }
  return (
    <>
      {(kingdoms as KingdomBasic[]).map((kingdom) => {
        const kingdomProvinces = (provinces as Record<string, unknown[]>)[kingdom.id] ?? []
        if (kingdomProvinces.length === 0) return null

        return (
          <div key={kingdom.id} className="data-library-section">
            <h2 className="data-library-section-title">{kingdom.name}</h2>
            <div className="data-library-grid">
              {kingdomProvinces.map((_, i) => {
                const info = getProvinceInfo(kingdom.id, i)
                const name = info ? (typeof info === 'object' && 'name' in info ? (info as { name: string }).name : String(info)) : (typeof kingdomProvinces[i] === 'string' ? kingdomProvinces[i] : (kingdomProvinces[i] as { name: string })?.name) ?? ''
                const imageUrl = getProvinceImage(kingdom.id, i)
                const description = getProvinceDescription(kingdom.id, i)
                const prompt = getProvincePrompt(kingdom.id, i)
                return (
                  <div key={`${kingdom.id}-${i}`} className="data-library-card province-card">
                    <div className="data-library-card-image">
                      <DataLibraryImage imageUrl={imageUrl} alt={name} className="province-image" />
                    </div>
                    <div className="data-library-card-content">
                      <h3>{name}</h3>
                      {i === 0 ? <span className="badge">Capital</span> : null}
                      {description ? <p className="data-library-description">{description}</p> : null}
                      {prompt ? (
                        <div className="data-library-detail-section">
                          <h4>Prompt de Imagen</h4>
                          <p className="prompt-text">{prompt}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}
