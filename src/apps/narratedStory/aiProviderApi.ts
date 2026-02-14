/**
 * Proveedor de IA en el cliente: llama directamente a OpenAI, DeepSeek, Grok u Ollama
 * usando la configuración que el usuario guarda en Ajustes (localStorage).
 */
import { loadAiSettings } from '@/store/aiSettings'
import { NARRATED_STORY_OPENAI_TOOLS } from './openaiTools'
import type { AIProvider } from './runNextTurn'

function parseOpenAIResponse(data: {
  choices?: Array<{ message?: { content?: string; tool_calls?: Array<{ function?: { name?: string; arguments?: string } }> } }>
}): { rawContent: string; toolCalls?: Array<{ name: string; args: Record<string, unknown> }> } {
  const rawContent =
    data.choices?.[0]?.message?.content ?? ''
  const rawToolCalls = data.choices?.[0]?.message?.tool_calls
  let toolCalls: Array<{ name: string; args: Record<string, unknown> }> | undefined
  if (rawToolCalls?.length) {
    toolCalls = rawToolCalls.map((tc) => {
      const fn = tc.function ?? {}
      let args: Record<string, unknown> = {}
      try {
        const raw = fn.arguments
        args = typeof raw === 'string' ? JSON.parse(raw) : raw ?? {}
      } catch {
        // ignore
      }
      return { name: fn.name ?? '', args }
    })
  }
  return { rawContent: rawContent ?? '', toolCalls }
}

function parseOllamaResponse(data: { message?: { content?: string } }): { rawContent: string } {
  const rawContent = data.message?.content ?? ''
  return { rawContent }
}

export const realAIProvider: AIProvider = async ({ systemPrompt, messages, turnNumber }) => {
  const turn = turnNumber ?? messages.filter((m) => m.role === 'user').length
  const ai = loadAiSettings()
  const service = ai.service.toLowerCase()

  const keyForService = service === 'openai' ? ai.openaiApiKey : service === 'deepseek' ? ai.deepseekApiKey : service === 'grok' ? ai.grokApiKey : ''
  console.log('[Narrated Story] AI provider: service=', service, '| API key length=', keyForService?.length ?? 0, '| hasKey=', !!(keyForService?.trim()))

  const apiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content || '',
    })),
  ]

  console.log('[Narrated Story] turn=', turn, 'AI request (client): service=', service, 'messages=', apiMessages.length)

  if (service === 'ollama') {
    const base = (ai.ollamaBaseUrl || 'http://localhost:11434').replace(/\/$/, '')
    const res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ai.ollamaModel || 'llama2',
        messages: apiMessages,
        options: { temperature: 0.8, num_predict: 2048 },
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Ollama ${res.status}: ${text.slice(0, 200)}`)
    }
    const data = await res.json()
    const out = parseOllamaResponse(data)
    console.log('[Narrated Story] turn=', turn, 'Ollama: tool_calls not supported')
    return { rawContent: out.rawContent }
  }

  // OpenAI-compatible (OpenAI, DeepSeek, Grok)
  const configs = {
    openai: {
      key: ai.openaiApiKey,
      baseUrl: (ai.openaiBaseUrl || 'https://api.openai.com/v1').replace(/\/$/, ''),
      model: ai.openaiModel || 'gpt-4',
    },
    deepseek: {
      key: ai.deepseekApiKey,
      baseUrl: (ai.deepseekBaseUrl || 'https://api.deepseek.com/v1').replace(/\/$/, ''),
      model: ai.deepseekModel || 'deepseek-chat',
    },
    grok: {
      key: ai.grokApiKey,
      baseUrl: (ai.grokBaseUrl || 'https://api.x.ai/v1').replace(/\/$/, ''),
      model: ai.grokModel || 'grok-beta',
    },
  }
  const config = configs[service as keyof typeof configs]
  if (!config?.key) {
    throw new Error(
      service === 'openai'
        ? 'Falta la API key de OpenAI. Configúrala en Ajustes → Chat con IA.'
        : service === 'deepseek'
          ? 'Falta la API key de DeepSeek. Configúrala en Ajustes → Chat con IA.'
          : service === 'grok'
            ? 'Falta la API key de Grok. Configúrala en Ajustes → Chat con IA.'
            : `Proveedor no soportado: ${service}`
    )
  }

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.key}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: apiMessages,
      temperature: 0.8,
      max_tokens: 2048,
      tools: NARRATED_STORY_OPENAI_TOOLS,
      tool_choice: 'auto',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    let msg = `${service} API ${res.status}`
    try {
      const j = JSON.parse(text) as { error?: { message?: string } }
      if (j.error?.message) msg += `: ${j.error.message}`
      else if (text) msg += `: ${text.slice(0, 200)}`
    } catch {
      if (text) msg += `: ${text.slice(0, 200)}`
    }
    throw new Error(msg)
  }

  const data = await res.json()
  const out = parseOpenAIResponse(data)
  const toolCallsArr = out.toolCalls ?? []
  console.log(
    '[Narrated Story] turn=',
    turn,
    'AI response: rawContent length=',
    (out.rawContent ?? '').length,
    'toolCalls=',
    toolCallsArr.length
  )
  return {
    rawContent: out.rawContent ?? '',
    toolCalls: out.toolCalls,
  }
}
