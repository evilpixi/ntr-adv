const STORAGE_KEY = 'ntr-adv-settings'

export type Resolution = 'auto' | '1920x1080' | '1280x720' | '800x600'
export type UIScale = '90' | '100' | '110' | '125'
export type Language = 'es' | 'en'

export interface SettingsState {
  resolution: Resolution
  uiScale: UIScale
  fullscreen: boolean
  volume: number
  muted: boolean
  language: Language
}

const defaults: SettingsState = {
  resolution: 'auto',
  uiScale: '100',
  fullscreen: false,
  volume: 1,
  muted: false,
  language: 'es',
}

function load(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults }
    const parsed = JSON.parse(raw) as Partial<SettingsState>
    return { ...defaults, ...parsed }
  } catch {
    return { ...defaults }
  }
}

function save(state: SettingsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

export const settingsStore = {
  load,
  save,
  defaults,
}

export const RESOLUTION_OPTIONS: { value: Resolution; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: '1920x1080', label: '1920 × 1080' },
  { value: '1280x720', label: '1280 × 720' },
  { value: '800x600', label: '800 × 600' },
]

export const UI_SCALE_OPTIONS: { value: UIScale; label: string }[] = [
  { value: '90', label: '90%' },
  { value: '100', label: '100%' },
  { value: '110', label: '110%' },
  { value: '125', label: '125%' },
]

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]
