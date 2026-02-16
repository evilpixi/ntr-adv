/**
 * Parsea la respuesta bruta de la IA para extraer narrativa, eventos y resumen de turno.
 * La IA debe incluir bloques opcionales al final:
 * - ```events\n[{"text":"...", "sexual": true/false}, ...]\n```
 * - ```turn_summary\n...\n```
 */
import type { TurnEvent } from './types'

const EVENTS_BLOCK = '```events'
const TURN_SUMMARY_BLOCK = '```turn_summary'

/** Regex: <|DSML| o <｜DSML｜ (pipe ASCII | o fullwidth ｜ U+FF5C). Algunos modelos (DeepSeek) lo insertan en texto. */
const DSML_OPENING_RE = /<[\u007C\uFF5C]DSML[\u007C\uFF5C]/

/** Marcadores adicionales de tool/function calls en texto. */
const TOOL_LIKE_MARKERS = [
  '```function_calls',
  '```dsml',
  '<function_calls>',
  '</function_calls>',
]

/**
 * Elimina de la narración cualquier bloque que parezca marcado de tool/DSML (el modelo a veces lo escribe en texto).
 */
export function stripToolLikeMarkup(text: string): string {
  let out = text
  const dsmlMatch = out.match(DSML_OPENING_RE)
  if (dsmlMatch && dsmlMatch.index !== undefined) {
    out = out.slice(0, dsmlMatch.index).trim()
  }
  for (const marker of TOOL_LIKE_MARKERS) {
    const idx = out.indexOf(marker)
    if (idx !== -1) {
      out = out.slice(0, idx).trim()
    }
  }
  return out
}

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
  const rawTrimmed = raw.trim()
  const withoutToolMarkup = stripToolLikeMarkup(rawTrimmed)
  let narrative = withoutToolMarkup
  const events: TurnEvent[] = []
  let turnSummary = ''

  const eventsBlockIdx = withoutToolMarkup.indexOf(EVENTS_BLOCK)
  const summaryBlockIdx = withoutToolMarkup.indexOf(TURN_SUMMARY_BLOCK)
  const summaryContent = extractBlock(withoutToolMarkup, TURN_SUMMARY_BLOCK)
  if (summaryContent) turnSummary = summaryContent

  const firstBlockIdx = Math.min(
    eventsBlockIdx === -1 ? withoutToolMarkup.length : eventsBlockIdx,
    summaryBlockIdx === -1 ? withoutToolMarkup.length : summaryBlockIdx
  )
  narrative = withoutToolMarkup.slice(0, firstBlockIdx).trim()

  if (eventsBlockIdx !== -1) {
    const eventsContent = extractBlock(withoutToolMarkup, EVENTS_BLOCK)
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
