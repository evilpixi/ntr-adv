import Dexie, { type Table } from 'dexie'
import type { PlayerProfile, Personaje, Place, TurnEvent } from './types'

/** Mensaje del chat (serializable para guardado). */
export interface SavedMessage {
  id: string
  role: 'user' | 'app'
  content: string
  /** Solo en mensajes app: eventos del turno. */
  events?: TurnEvent[]
  /** Solo en mensajes app: resumen del turno. */
  turnSummary?: string
}

/** Registro de una partida guardada en IndexedDB. */
export interface PartidaRecord {
  id: string
  createdAt: number
  updatedAt: number
  /** Elecciones del character creator (launcher). */
  playerProfile: PlayerProfile
  /** Estado actual de los personajes (jugador + héroes/NPCs). */
  characters: Personaje[]
  /** Transcript del chat (opcional, partidas antiguas no lo tienen). */
  messages?: SavedMessage[]
  /** Historial de mensajes enviados (opcional). */
  sentMessages?: string[]
  /** System prompt de la aventura (instrucciones para la IA). */
  systemPrompt?: string
  /** Story prompt: trama general de la historia (incluido en cada llamada a la IA). */
  storyPrompt?: string
  /** Kinks deseados para esta partida (incluido en cada llamada a la IA). */
  kinksPrompt?: string
  /** Indicaciones extra para la IA (incluido en cada llamada). */
  extraIndications?: string
  /** Ids de heroínas seleccionadas para esta aventura (si no está, se usan todas). */
  selectedHeroineIds?: string[]
  /** Info adicional por lugar (placeId -> texto). La IA puede rellenarla. */
  placeAdditionalInfo?: Record<string, string>
  /** Lugares de la partida (la IA puede crear nuevos). Si no está, la app usa los por defecto. */
  places?: Place[]
}

const DB_NAME = 'ntr-adv-narrated-story'
const STORE_PARTIDAS = 'partidas'
const CURRENT_PARTIDA_ID = 'current'

class NarratedStoryDb extends Dexie {
  partidas!: Table<PartidaRecord, string>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      [STORE_PARTIDAS]: 'id, updatedAt',
    })
  }
}

const db = new NarratedStoryDb()

/**
 * Guarda la partida actual: perfil, personajes y opcionalmente chat, systemPrompt, selectedHeroineIds.
 * Si ya existe una partida "current", se actualiza; si no, se crea.
 */
export async function savePartida(
  playerProfile: PlayerProfile,
  characters: Personaje[],
  options?: {
    messages?: SavedMessage[]
    sentMessages?: string[]
    systemPrompt?: string
    storyPrompt?: string
    kinksPrompt?: string
    extraIndications?: string
    selectedHeroineIds?: string[]
    placeAdditionalInfo?: Record<string, string>
    places?: Place[]
  }
): Promise<void> {
  const now = Date.now()
  const existing = await db.partidas.get(CURRENT_PARTIDA_ID)
  const payload: Omit<PartidaRecord, 'id' | 'createdAt'> = {
    updatedAt: now,
    playerProfile,
    characters,
    messages: options?.messages ?? existing?.messages ?? [],
    sentMessages: options?.sentMessages ?? existing?.sentMessages ?? [],
    systemPrompt: options?.systemPrompt !== undefined ? options.systemPrompt : existing?.systemPrompt,
    storyPrompt: options?.storyPrompt !== undefined ? options.storyPrompt : existing?.storyPrompt,
    kinksPrompt: options?.kinksPrompt !== undefined ? options.kinksPrompt : existing?.kinksPrompt,
    extraIndications: options?.extraIndications !== undefined ? options.extraIndications : existing?.extraIndications,
    selectedHeroineIds:
      options?.selectedHeroineIds !== undefined ? options.selectedHeroineIds : existing?.selectedHeroineIds,
    placeAdditionalInfo:
      options?.placeAdditionalInfo !== undefined ? options.placeAdditionalInfo : existing?.placeAdditionalInfo,
    places: options?.places !== undefined ? options.places : existing?.places,
  }

  if (existing) {
    await db.partidas.update(CURRENT_PARTIDA_ID, payload)
  } else {
    await db.partidas.add({
      id: CURRENT_PARTIDA_ID,
      createdAt: now,
      ...payload,
    })
  }
}

/**
 * Devuelve la partida guardada actual, o null si no hay ninguna.
 */
export async function getCurrentPartida(): Promise<PartidaRecord | null> {
  const record = await db.partidas.get(CURRENT_PARTIDA_ID)
  return record ?? null
}

/**
 * Lista todas las partidas (por si en el futuro se guardan por slot o nombre).
 * Ordenadas por updatedAt descendente.
 */
export async function listPartidas(): Promise<PartidaRecord[]> {
  return db.partidas.orderBy('updatedAt').reverse().toArray()
}

/**
 * Elimina la partida actual (para "nueva partida").
 */
export async function clearCurrentPartida(): Promise<void> {
  await db.partidas.delete(CURRENT_PARTIDA_ID)
}

/**
 * Borra por completo la base IndexedDB de Narrated Story (toda la partida y datos).
 * Tras llamarla, el estado de la app debe resetearse para mostrar el launcher.
 */
export async function deleteNarratedStoryDatabase(): Promise<void> {
  db.close()
  await Dexie.delete(DB_NAME)
}
