import type { Language } from '../../store/settings'
import { useApp } from '../../store/AppContext'
import { translations, FALLBACK_LANGUAGE } from './locales'
import type { CardGameKey } from './locales'

export function t(
  key: CardGameKey,
  language: Language
): string {
  const langMap = translations[language]
  const fallbackMap = translations[FALLBACK_LANGUAGE]
  return (langMap?.[key] ?? fallbackMap?.[key] ?? key) as string
}

export function useCardGameTranslation(): {
  t: (key: CardGameKey) => string
  language: Language
} {
  const { settings } = useApp()
  const language = settings.language
  return {
    t: (key: CardGameKey) => t(key, language),
    language,
  }
}
