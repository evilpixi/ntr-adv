/**
 * Estructura de datos de Narrated Story: lugares y cartas.
 * Las cartas pueden ser: Héroe (personaje), Magia, Item, Soldado raso.
 */

// —— Lugares ——
export interface Place {
  id: string
  name: string
  description?: string
}

// —— Tipos de carta (discriminante) ——
export type CardType = 'hero' | 'magic' | 'item' | 'soldier'

// Descripción sexual (para héroes/personajes)
export interface SexualDescription {
  genitals: string
  bustSize: string
}

// Carta base (campos comunes)
interface BaseCard {
  id: string
  type: CardType
  name: string
}

// Héroe = personaje con stats y descripciones
export interface HeroCard extends BaseCard {
  type: 'hero'
  /** Id del general (data library) para usar su imagen y datos si se desea */
  generalId?: string
  /** Relación con el personaje principal */
  relationship: string
  hp: number
  strength: number
  agility: number
  intelligence: number
  /** Clase del personaje (guerrero, mago, etc.) */
  class: string
  level: number
  sexualDescription: SexualDescription
  physicalDescription: string
  race: string
  personality: string
  abilities: string[]
}

// Carta de magia
export interface MagicCard extends BaseCard {
  type: 'magic'
  description?: string
  effect?: string
  cost?: string
}

// Carta de objeto
export interface ItemCard extends BaseCard {
  type: 'item'
  description?: string
}

// Soldado raso
export interface SoldierCard extends BaseCard {
  type: 'soldier'
  hp?: number
  attack?: number
  description?: string
}

// Unión de todas las cartas
export type Card = HeroCard | MagicCard | ItemCard | SoldierCard

// Type guards
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

// —— Personajes (jugador, NPC, héroe) ——
export type PersonajeRole = 'player' | 'npc' | 'hero'

export interface Personaje {
  id: string
  name: string
  role: PersonajeRole
  /** URL directa de imagen, o usar generalId si existe para resolver con getGeneralImage */
  imageUrl?: string
  /** Id del general (data library) para resolver imagen de heroínas */
  generalId?: string
  hp: number
  fuerza: number
  agilidad: number
  inteligencia: number
  carisma: number
  description: string
  /** Clase/rol narrativo (opcional) */
  class?: string
  race?: string
  /** Género del personaje (opcional, para jugador/narrativa) */
  gender?: string
  /** Genitales (opcional, para jugador/narrativa) */
  genitalia?: string
  /** Si tiene pene: tamaño en pulgadas (solo jugador) */
  penisSize?: string
  /** Copa de pechos A–G (solo jugador, mujer/NB) */
  bustSize?: string
  /** Título nobiliario (opcional, para jugador: según género) */
  nobleTitle?: string
  /** Id del lugar de interés donde está el personaje (opcional) */
  currentPlaceId?: string
  /** Qué está haciendo en este momento (opcional) */
  currentActivity?: string
  /** Estado actual del personaje (opcional, ej. herido, descansando, en combate) */
  currentState?: string
  /** Nivel de corrupción (0–100). Aumenta con eventos sexuales. */
  corruption?: number
  /** Amor hacia el regente/jugador (0–100). Actualizable por MCP. */
  loveRegent?: number
  /** Nivel de lujuria (0–100). Actualizable por MCP. */
  lust?: number
  /** Cantidad de veces que el personaje ha tenido sexo. */
  sexCount?: number
  /** Kinks que el personaje ha desarrollado (ej. por eventos). */
  developedKinks?: string[]
  /** Sentimientos hacia otros personajes: id -> descripción corta (love, lust, indifference, attraction, hatred, etc.). Actualizable por MCP. */
  feelingsToward?: Record<string, string>
  /** Para héroes: relación con el jugador (usado en cartas). */
  relationship?: string
  /** Para héroes: descripción física corta (usado en cartas). */
  physicalDescription?: string
  /** Para héroes: personalidad (usado en cartas). */
  personality?: string
  /** Para héroes: habilidades (usado en cartas). */
  abilities?: string[]
  /** Para héroes: descripción sexual (usado en cartas). */
  sexualDescription?: { genitals: string; bustSize: string }
}

// —— Iniciador: perfil del jugador (siempre noble) ——
export type GoverningStyle = 'general' | 'brujo' | 'mercante' | 'diplomatico'

export type GenderKey = 'male' | 'female' | 'nonbinary'

export type GenitaliaKey = 'penis' | 'vagina'

/** Tamaño de pene en pulgadas (solo cuando genitalia es penis). */
export type PenisSizeKey = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** Copa de pechos A–G (solo mujer y no binario). */
export type BustSizeKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

/** Clave de título: el texto final depende del género (Príncipe/Princesa/Royal, etc.). */
export type NobleTitleKey = 'prince' | 'king' | 'noble'

export interface PlayerProfile {
  name: string
  gender: GenderKey
  genitalia: GenitaliaKey
  /** Si genitalia es penis: tamaño en pulgadas (1–7). */
  penisSize?: PenisSizeKey
  /** Copa de pechos (solo mujer y no binario): A–G. */
  bustSize?: BustSizeKey
  nobleTitle: NobleTitleKey
  appearanceDescription: string
  governingStyle: GoverningStyle
}

// —— Chat de la historia narrada ——
export type ChatMessageRole = 'user' | 'app'

/** Un evento destacado en la respuesta del turno (ej. "Aria ha sido preñada"). */
export interface TurnEvent {
  text: string
  /** Si es true, se muestra en estilo rosa/sexual. */
  sexual?: boolean
}

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  /** Solo en mensajes app: eventos de este turno (formato especial de la IA). */
  events?: TurnEvent[]
  /** Solo en mensajes app: resumen al final del turno (personajes, cambios relevantes). */
  turnSummary?: string
}

// —— Estado global de la historia narrada ——
export interface NarratedStoryData {
  places: Place[]
  cards: Card[]
  characters: Personaje[]
}
