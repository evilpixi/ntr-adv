import type { Language } from '../../store/settings'
import { useApp } from '../../store/AppContext'
import { translations, FALLBACK_LANGUAGE } from './locales'
import type { NarratedStoryKey } from './locales'

export type InterpolationVars = Record<string, string | number>

/**
 * Replaces placeholders like {name} or {dmg} in a string with values from vars.
 */
export function interpolate(
  str: string,
  vars: InterpolationVars
): string {
  return str.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  )
}

/**
 * Returns the translation for a key in the given language.
 * If vars is provided, placeholders {key} in the string are replaced.
 * Fallback: requested language → English → key as string.
 */
export function t(
  key: NarratedStoryKey,
  language: Language,
  vars?: InterpolationVars
): string {
  const langMap = translations[language]
  const fallbackMap = translations[FALLBACK_LANGUAGE]
  const raw = (langMap?.[key] ?? fallbackMap?.[key] ?? key) as string
  return vars ? interpolate(raw, vars) : raw
}

/**
 * Hook that uses the app language from root (AppContext).
 * Use this inside NarratedStory so text follows the user's language.
 * The returned t() accepts an optional second argument for interpolation.
 */
export function useNarratedStoryTranslation(): {
  t: (key: NarratedStoryKey, vars?: InterpolationVars) => string
  language: Language
} {
  const { settings } = useApp()
  const language = settings.language
  return {
    t: (key: NarratedStoryKey, vars?: InterpolationVars) => t(key, language, vars),
    language,
  }
}
