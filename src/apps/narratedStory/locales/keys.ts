/**
 * Lista de claves de traducción de la app. No importa en/es, así no hay dependencia circular.
 */
export const NARRATED_STORY_KEYS = [
  'narratedStory.title',
  'narratedStory.intro',
  'narratedStory.enemyAction',
] as const

export type NarratedStoryKey = (typeof NARRATED_STORY_KEYS)[number]
