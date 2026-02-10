/**
 * English locale for Narrated Story app (default and fallback).
 * Partial: las claves que falten harán fallback a la clave como texto en t().
 */
import type { NarratedStoryKey } from './keys.ts'

export const en: Partial<Record<NarratedStoryKey, string>> = {
  'narratedStory.title': 'My App',
  'narratedStory.intro':
    'Content ready to be built. Use the same tokens and classes as the rest of the app (--color-*, .btn, .section-title, etc.).',
  'narratedStory.enemyAction': 'The {name} dealt {dmg} damage.',
}
