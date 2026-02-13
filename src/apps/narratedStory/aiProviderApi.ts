/**
 * Proveedor de IA que llama al backend /api/narrated-story/chat.
 * El backend usa OPENAI_* (o DEEPSEEK_*, GROK_*, OLLAMA_*) según configuración.
 */
import type { AIProvider } from './runNextTurn'
import type { TurnMessage } from './runNextTurn'

const CHAT_API = '/api/narrated-story/chat'

export interface ChatApiRequest {
  systemPrompt: string
  messages: TurnMessage[]
}

export interface ChatApiResponse {
  rawContent: string
  toolCalls?: Array<{ name: string; args: Record<string, unknown> }>
}

/**
 * Real AI provider: POST a /api/narrated-story/chat con systemPrompt y messages.
 */
export const realAIProvider: AIProvider = async ({ systemPrompt, userMessage, messages }) => {
  const res = await fetch(CHAT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt,
      messages,
    } as ChatApiRequest),
  })

  if (!res.ok) {
    const errBody = await res.text()
    let message = `API error ${res.status}`
    try {
      const j = JSON.parse(errBody) as Record<string, unknown>
      if (j.error) {
        if (typeof j.error === 'string') message = j.error
        else if (typeof j.error === 'object' && j.error !== null && 'message' in j.error) {
          message = String((j.error as { message?: string }).message)
        }
      } else if (typeof j.message === 'string') {
        message = j.message
      }
    } catch {
      if (errBody) message = errBody.slice(0, 300)
    }
    if (message === `API error ${res.status}` && errBody) {
      message += ': ' + errBody.slice(0, 280)
    }
    throw new Error(message)
  }

  const data = (await res.json()) as ChatApiResponse
  return {
    rawContent: data.rawContent ?? '',
    toolCalls: data.toolCalls,
  }
}
