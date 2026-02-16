/**
 * API layer for Narrated Story: requestNarrative (no tools) and requestToolCalls (with tools).
 * Uses OpenAI-compatible and Ollama endpoints from user settings.
 */
import { loadAiSettings } from '@/store/aiSettings'
import { NARRATED_STORY_OPENAI_TOOLS } from './openaiTools'

export interface ToolCallWithId {
  name: string
  args: Record<string, unknown>
  id: string
}

export interface ToolCallsResponse {
  rawContent: string
  toolCalls: ToolCallWithId[]
  assistantMessageForFollowUp: {
    content: string | null
    tool_calls: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>
  }
}

/** Message for narrative request: simple user/assistant, or with tool_calls/tool results for post-tools phase. */
export type NarrativeRequestMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string }
  | {
      role: 'assistant'
      content: string | null
      tool_calls: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>
    }
  | { role: 'tool'; tool_call_id: string; content: string }

function getOpenAIConfig(): { key: string; baseUrl: string; model: string } | null {
  const ai = loadAiSettings()
  const service = ai.service.toLowerCase()
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
  if (!config?.key) return null
  return config
}

function parseOpenAIResponse(data: {
  choices?: Array<{
    message?: {
      content?: string
      tool_calls?: Array<{ id?: string; function?: { name?: string; arguments?: string } }>
    }
  }>
}): { rawContent: string; toolCalls?: ToolCallWithId[]; assistantMessageForFollowUp?: ToolCallsResponse['assistantMessageForFollowUp'] } {
  const msg = data.choices?.[0]?.message
  const rawContent = msg?.content ?? ''
  const rawToolCalls = msg?.tool_calls
  let toolCalls: ToolCallWithId[] | undefined
  let assistantMessageForFollowUp: ToolCallsResponse['assistantMessageForFollowUp'] | undefined
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
      return { name: fn.name ?? '', args, id: tc.id ?? '' }
    })
    assistantMessageForFollowUp = {
      content: rawContent || null,
      tool_calls: rawToolCalls.map((tc) => ({
        id: tc.id ?? '',
        type: 'function' as const,
        function: { name: (tc.function?.name ?? ''), arguments: (tc.function?.arguments ?? '{}') },
      })),
    }
  }
  return { rawContent: rawContent ?? '', toolCalls, assistantMessageForFollowUp }
}

/**
 * Request narrative only (no tools). Used for intro and for post-tools phase.
 * Messages can be simple user/assistant or include assistant tool_calls + tool results.
 */
export async function requestNarrative(params: {
  systemPrompt: string
  messages: NarrativeRequestMessage[]
}): Promise<{ content: string }> {
  const { systemPrompt, messages } = params
  const ai = loadAiSettings()
  const service = ai.service.toLowerCase()

  const apiMessages: Array<Record<string, unknown>> = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => {
      if (m.role === 'tool') {
        return { role: 'tool' as const, tool_call_id: m.tool_call_id, content: m.content }
      }
      if (m.role === 'assistant' && 'tool_calls' in m && m.tool_calls) {
        return {
          role: 'assistant' as const,
          content: m.content,
          tool_calls: m.tool_calls,
        }
      }
      const role = m.role === 'user' ? ('user' as const) : ('assistant' as const)
      return {
        role,
        content: (m as { content: string }).content ?? '',
      }
    }),
  ]

  if (service === 'ollama') {
    const base = (ai.ollamaBaseUrl || 'http://localhost:11434').replace(/\/$/, '')
    const res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ai.ollamaModel || 'llama2',
        messages: apiMessages.filter((m) => (m as { role: string }).role !== 'tool'),
        options: { temperature: 0.8, num_predict: 2048 },
      }),
    })
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = await res.json()
    const content = data.message?.content ?? ''
    return { content: (content ?? '').trim() }
  }

  const config = getOpenAIConfig()
  if (!config) throw new Error('Missing API key. Configure in Settings.')

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.key}` },
    body: JSON.stringify({
      model: config.model,
      messages: apiMessages,
      temperature: 0.8,
      max_tokens: 2048,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  return { content: (content ?? '').trim() }
}

/**
 * Request tool calls (normal turn phase 1). One call with tools; returns tool_calls and assistant message for follow-up.
 */
export async function requestToolCalls(params: {
  systemPrompt: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}): Promise<ToolCallsResponse> {
  const { systemPrompt, messages } = params
  const ai = loadAiSettings()
  const service = ai.service.toLowerCase()

  const apiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content || '',
    })),
  ]

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
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = await res.json()
    const rawContent = data.message?.content ?? ''
    return {
      rawContent,
      toolCalls: [],
      assistantMessageForFollowUp: { content: rawContent || null, tool_calls: [] },
    }
  }

  const config = getOpenAIConfig()
  if (!config) throw new Error('Missing API key. Configure in Settings.')

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.key}` },
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
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  const out = parseOpenAIResponse(data)
  return {
    rawContent: out.rawContent ?? '',
    toolCalls: out.toolCalls ?? [],
    assistantMessageForFollowUp: out.assistantMessageForFollowUp ?? {
      content: null,
      tool_calls: [],
    },
  }
}
