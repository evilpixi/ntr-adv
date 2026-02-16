import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  settingsStore,
  type Resolution,
  type UIScale,
  type Language,
  type SettingsState,
} from './settings'

interface AppContextValue {
  currentAppId: string | null
  setCurrentAppId: (id: string | null) => void
  settings: SettingsState
  setResolution: (r: Resolution) => void
  setUIScale: (s: UIScale) => void
  setFullscreen: (v: boolean) => void
  setVolume: (v: number) => void
  setMuted: (v: boolean) => void
  setLanguage: (l: Language) => void
  openSettings: boolean
  setOpenSettings: (v: boolean) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentAppId, setCurrentAppId] = useState<string | null>(null)
  const [openSettings, setOpenSettings] = useState(false)
  const [settings, setSettings] = useState<SettingsState>(() => {
    const loaded = settingsStore.load()
    document.documentElement.lang = loaded.language
    return loaded
  })

  const persist = useCallback((next: Partial<SettingsState>) => {
    setSettings((prev) => {
      const nextState = { ...prev, ...next }
      settingsStore.save(nextState)
      return nextState
    })
  }, [])

  const setResolution = useCallback((resolution: Resolution) => persist({ resolution }), [persist])
  const setUIScale = useCallback((uiScale: UIScale) => persist({ uiScale }), [persist])
  const setFullscreen = useCallback((fullscreen: boolean) => persist({ fullscreen }), [persist])
  const setVolume = useCallback((volume: number) => persist({ volume }), [persist])
  const setMuted = useCallback((muted: boolean) => persist({ muted }), [persist])
  const setLanguage = useCallback(
    (language: Language) => {
      persist({ language })
      document.documentElement.lang = language
    },
    [persist]
  )

  const value = useMemo<AppContextValue>(
    () => ({
      currentAppId,
      setCurrentAppId,
      settings,
      setResolution,
      setUIScale,
      setFullscreen,
      setVolume,
      setMuted,
      setLanguage,
      openSettings,
      setOpenSettings,
    }),
    [
      currentAppId,
      settings,
      setResolution,
      setUIScale,
      setFullscreen,
      setVolume,
      setMuted,
      setLanguage,
      openSettings,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
