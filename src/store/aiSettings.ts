/**
 * Configuración de IA para el chat de Narrated Story.
 * Se guarda en localStorage; si no hay clave en Ajustes, se usa .env de la raíz del proyecto.
 */
const STORAGE_KEY = 'ntr-adv-ai-settings'

export type AIServiceKey = 'openai' | 'deepseek' | 'grok' | 'ollama'

export interface AISettingsState {
  service: AIServiceKey
  openaiApiKey: string
  openaiBaseUrl: string
  openaiModel: string
  deepseekApiKey: string
  deepseekBaseUrl: string
  deepseekModel: string
  grokApiKey: string
  grokBaseUrl: string
  grokModel: string
  ollamaBaseUrl: string
  ollamaModel: string
}

const defaults: AISettingsState = {
  service: 'openai',
  openaiApiKey: '',
  openaiBaseUrl: 'https://api.openai.com/v1',
  openaiModel: 'gpt-4',
  deepseekApiKey: '',
  deepseekBaseUrl: 'https://api.deepseek.com/v1',
  deepseekModel: 'deepseek-chat',
  grokApiKey: '',
  grokBaseUrl: 'https://api.x.ai/v1',
  grokModel: 'grok-beta',
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'llama2',
}

interface EnvFallback {
  openaiApiKey?: string
  openaiBaseUrl?: string
  openaiModel?: string
  deepseekApiKey?: string
  deepseekBaseUrl?: string
  deepseekModel?: string
  grokApiKey?: string
  grokBaseUrl?: string
  grokModel?: string
  ollamaBaseUrl?: string
  ollamaModel?: string
  defaultService?: string
}

const LOG_PREFIX = '[AI Settings .env]'

function getEnvFallback(): EnvFallback {
  try {
    const raw = __ENV_FALLBACK__
    if (raw == null) {
      console.log(LOG_PREFIX, 'getEnvFallback: __ENV_FALLBACK__ is null/undefined')
      return {}
    }
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      const env = raw as EnvFallback
      console.log(LOG_PREFIX, 'getEnvFallback: already object | deepseekApiKey length=', (env.deepseekApiKey ?? '').length, '| defaultService=', env.defaultService)
      return env
    }
    if (typeof raw === 'string') {
      const env = JSON.parse(raw) as EnvFallback
      console.log(LOG_PREFIX, 'getEnvFallback: parsed from string | deepseekApiKey length=', (env.deepseekApiKey ?? '').length, '| defaultService=', env.defaultService)
      return env
    }
    console.log(LOG_PREFIX, 'getEnvFallback: unexpected type', typeof raw)
    return {}
  } catch (e) {
    console.warn(LOG_PREFIX, 'getEnvFallback: error', e)
    return {}
  }
}

/** Aplica valores de .env cuando el estado no tiene valor (prioridad: localStorage > .env > defaults). */
function applyEnvFallback(state: AISettingsState): AISettingsState {
  const env = getEnvFallback()
  const keys: (keyof Omit<AISettingsState, 'service'>)[] = [
    'openaiApiKey', 'openaiBaseUrl', 'openaiModel',
    'deepseekApiKey', 'deepseekBaseUrl', 'deepseekModel',
    'grokApiKey', 'grokBaseUrl', 'grokModel',
    'ollamaBaseUrl', 'ollamaModel',
  ]
  const next = { ...state }
  let applied: string[] = []
  for (const k of keys) {
    if (!next[k] && env[k as keyof EnvFallback]) {
      ;(next as Record<string, string>)[k] = env[k as keyof EnvFallback] as string
      applied.push(k)
    }
  }
  if (applied.length) console.log(LOG_PREFIX, 'applyEnvFallback: applied from .env', applied)
  return next
}

const serviceToKeyMap: Record<AIServiceKey, keyof AISettingsState> = {
  openai: 'openaiApiKey',
  deepseek: 'deepseekApiKey',
  grok: 'grokApiKey',
  ollama: 'ollamaBaseUrl',
}

/** Devuelve si el servicio tiene config (API key o, en ollama, base URL). */
function serviceHasKey(state: AISettingsState, service: AIServiceKey): boolean {
  const keyName = serviceToKeyMap[service]
  return !!(state[keyName] as string)?.trim()
}

export function loadAiSettings(): AISettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<AISettingsState>) : {}
    console.log(LOG_PREFIX, 'loadAiSettings: localStorage raw length=', raw?.length ?? 0, '| parsed.service=', parsed.service)

    let state = applyEnvFallback({ ...defaults, ...parsed })
    const env = getEnvFallback()
    const defaultService = env.defaultService && ['openai', 'deepseek', 'grok', 'ollama'].includes(env.defaultService)
      ? (env.defaultService as AIServiceKey)
      : null

    const useDefault =
      defaultService &&
      (parsed.service === undefined ||
        (!serviceHasKey(state, state.service) && serviceHasKey(state, defaultService)))
    console.log(LOG_PREFIX, 'loadAiSettings: defaultService=', defaultService, '| useDefault=', useDefault, '| state.service before=', state.service, '| deepseekApiKey length=', state.deepseekApiKey.length)

    if (defaultService && useDefault) {
      state = { ...state, service: defaultService }
      console.log(LOG_PREFIX, 'loadAiSettings: switched to service=', state.service)
    }

    console.log(LOG_PREFIX, 'loadAiSettings: final service=', state.service, '| key length for service=', state.service === 'deepseek' ? state.deepseekApiKey.length : state.service === 'openai' ? state.openaiApiKey.length : '-')
    return state
  } catch (e) {
    console.warn(LOG_PREFIX, 'loadAiSettings: error', e)
    return applyEnvFallback({ ...defaults })
  }
}

export function saveAiSettings(state: Partial<AISettingsState>): void {
  try {
    const current = loadAiSettings()
    const next = { ...current, ...state }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}
