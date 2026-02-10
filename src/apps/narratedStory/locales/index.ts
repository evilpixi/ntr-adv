import type { Language } from '../../../store/settings'
import type { NarratedStoryKey } from './keys.ts'
import { en } from './en'
import { es } from './es'

export type { NarratedStoryKey } from './keys.ts'

/** Default and fallback language for this app. */
const FALLBACK_LANGUAGE: Language = 'en'

/** All locale data for this app. Cada idioma puede estar incompleto; t() hace fallback a en y luego a la clave. */
export const translations: Record<Language, Partial<Record<NarratedStoryKey, string>>> = {
  en,
  es,
}

export { FALLBACK_LANGUAGE }
