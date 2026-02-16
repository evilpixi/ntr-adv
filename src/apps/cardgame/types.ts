/**
 * Estructura de datos de Card Game: lugares y cartas.
 * Tipos de carta: Héroe, Magia, Item, Soldado.
 */

export interface Place {
  id: string
  name: string
  description?: string
}

export type CardType = 'hero' | 'magic' | 'item' | 'soldier'

export interface SexualDescription {
  genitals: string
  bustSize: string
}

interface BaseCard {
  id: string
  type: CardType
  name: string
}

export interface HeroCard extends BaseCard {
  type: 'hero'
  generalId?: string
  relationship: string
  hp: number
  strength: number
  agility: number
  intelligence: number
  class: string
  level: number
  sexualDescription: SexualDescription
  physicalDescription: string
  race: string
  personality: string
  abilities: string[]
}

export interface MagicCard extends BaseCard {
  type: 'magic'
  description?: string
  effect?: string
  cost?: string
}

export interface ItemCard extends BaseCard {
  type: 'item'
  description?: string
}

export interface SoldierCard extends BaseCard {
  type: 'soldier'
  hp?: number
  attack?: number
  description?: string
}

export type Card = HeroCard | MagicCard | ItemCard | SoldierCard

export function isHeroCard(card: Card): card is HeroCard {
  return card.type === 'hero'
}
export function isMagicCard(card: Card): card is MagicCard {
  return card.type === 'magic'
}
export function isItemCard(card: Card): card is ItemCard {
  return card.type === 'item'
}
export function isSoldierCard(card: Card): card is SoldierCard {
  return card.type === 'soldier'
}

export interface CardGameData {
  places: Place[]
  cards: Card[]
}
