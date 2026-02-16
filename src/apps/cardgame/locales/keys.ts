export const CARDGAME_KEYS = [
  'cardgame.title',
  'cardgame.cardsTitle',
  'cardgame.cardType.hero',
  'cardgame.cardType.magic',
  'cardgame.cardType.item',
  'cardgame.cardType.soldier',
  'cardgame.card.hp',
  'cardgame.card.attack',
  'cardgame.card.strength',
  'cardgame.card.agility',
  'cardgame.card.intelligence',
  'cardgame.cardsEmpty',
  'cardgame.placesTitle',
  'cardgame.placesEmpty',
] as const

export type CardGameKey = (typeof CARDGAME_KEYS)[number]
