import type { CardGameKey } from './keys'

export const es: Partial<Record<CardGameKey, string>> = {
  'cardgame.title': 'Juego de Cartas',
  'cardgame.cardsTitle': 'Cartas',
  'cardgame.cardType.hero': 'Héroe',
  'cardgame.cardType.magic': 'Magia',
  'cardgame.cardType.item': 'Objeto',
  'cardgame.cardType.soldier': 'Soldado',
  'cardgame.card.hp': 'PV',
  'cardgame.card.attack': 'ATQ',
  'cardgame.card.strength': 'Fuerza',
  'cardgame.card.agility': 'Agilidad',
  'cardgame.card.intelligence': 'Inteligencia',
  'cardgame.cardsEmpty': 'Aún no hay cartas.',
  'cardgame.placesTitle': 'Lugares',
  'cardgame.placesEmpty': 'Aún no hay lugares.',
}
