/**
 * Spanish locale for Narrated Story app.
 * Partial: puedes añadir claves cuando quieras; las que falten harán fallback a en.
 */
import type { NarratedStoryKey } from './keys.ts'

export const es: Partial<Record<NarratedStoryKey, string>> = {
  'narratedStory.title': 'Mi App',
  'narratedStory.intro':
    'Contenido listo para programarse. Usa los mismos tokens y clases que el resto de la app (--color-*, .btn, .section-title, etc.).',
  'narratedStory.enemyAction': 'El {name} hizo {dmg} de daño.',
}
