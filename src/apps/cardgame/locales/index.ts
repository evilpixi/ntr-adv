import type { Language } from '../../../store/settings'
import type { CardGameKey } from './keys'
import { en } from './en'
import { es } from './es'

export type { CardGameKey } from './keys'

const FALLBACK_LANGUAGE: Language = 'en'

export const translations: Record<Language, Partial<Record<CardGameKey, string>>> = {
  en,
  es,
}

export { FALLBACK_LANGUAGE }
