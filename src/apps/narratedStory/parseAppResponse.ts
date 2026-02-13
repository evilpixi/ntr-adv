/**
 * Parsea la respuesta bruta de la IA para extraer narrativa, eventos y resumen de turno.
 * La IA debe incluir bloques opcionales al final:
 * - ```events\n[{"text":"...", "sexual": true/false}, ...]\n```
 * - ```turn_summary\n...\n```
 */
import type { TurnEvent } from './types'

const EVENTS_BLOCK = '```events'
const TURN_SUMMARY_BLOCK = '```turn_summary'

export interface ParsedAppResponse {
  /** Narrativa principal (markdown), sin los bloques especiales. */
  narrative: string
  /** Eventos del turno (lista de frases; sexual=true → estilo rosa). */
  events: TurnEvent[]
  /** Resumen al final del turno (personajes, cambios). */
  turnSummary: string
}

/**
 * Extrae el contenido de un bloque de código por su inicio (ej. ```events o ```turn_summary).
 * Busca el cierre con ``` en una línea propia.
 */
function extractBlock(raw: string, blockStart: string): string | null {
  const idx = raw.indexOf(blockStart)
  if (idx === -1) return null
  const afterStart = raw.slice(idx + blockStart.length)
  const lineEnd = afterStart.indexOf('\n')
  const contentStart = lineEnd === -1 ? 0 : lineEnd + 1
  const rest = afterStart.slice(contentStart)
  const closeIdx = rest.indexOf('\n```')
  const content = closeIdx === -1 ? rest : rest.slice(0, closeIdx)
  return content.trim()
}

/**
 * Parsea la respuesta completa de la IA y devuelve narrativa, eventos y resumen.
 */
export function parseAppResponse(raw: string): ParsedAppResponse {
  let narrative = raw.trim()
  const events: TurnEvent[] = []
  let turnSummary = ''

  const eventsBlockIdx = raw.indexOf(EVENTS_BLOCK)
  const summaryBlockIdx = raw.indexOf(TURN_SUMMARY_BLOCK)
  const summaryContent = extractBlock(raw, TURN_SUMMARY_BLOCK)
  if (summaryContent) turnSummary = summaryContent

  const firstBlockIdx = Math.min(
    eventsBlockIdx === -1 ? raw.length : eventsBlockIdx,
    summaryBlockIdx === -1 ? raw.length : summaryBlockIdx
  )
  narrative = raw.slice(0, firstBlockIdx).trim()

  if (eventsBlockIdx !== -1) {
    const eventsContent = extractBlock(raw, EVENTS_BLOCK)
    if (eventsContent) {
      try {
        const parsed = JSON.parse(eventsContent) as unknown
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && typeof item === 'object' && 'text' in item && typeof (item as { text: unknown }).text === 'string') {
              const o = item as { text: string; sexual?: boolean }
              events.push({ text: o.text, sexual: Boolean(o.sexual) })
            }
          }
        }
      } catch {
        // Ignore invalid JSON
      }
    }
  }

  return { narrative, events, turnSummary }
}
