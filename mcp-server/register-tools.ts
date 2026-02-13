/**
 * Registra en el McpServer todas las tools: globales (tools/) y Narrated Story (src/apps/narratedStory/).
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { TOOL_DEFINITIONS } from '../tools/definitions.js'
import { runTool } from '../tools/run.js'
import type { ToolContext } from '../tools/context.js'
import { NARRATED_STORY_TOOL_DEFINITIONS } from '../src/apps/narratedStory/tools/definitions.js'
import { runNarratedStoryTool } from '../src/apps/narratedStory/tools/run.js'
import type { NarratedStoryToolContext } from '../src/apps/narratedStory/tools/context.js'

function zodSchemaFromParams(
  params: Record<string, { type: string; description?: string }> | undefined
): Record<string, z.ZodType> {
  if (!params || Object.keys(params).length === 0) return {}
  const out: Record<string, z.ZodType> = {}
  for (const [key, p] of Object.entries(params)) {
    if (p.type === 'string') out[key] = z.string().describe(p.description ?? key)
    else if (p.type === 'object') out[key] = z.record(z.unknown()).describe(p.description ?? key)
    else if (p.type === 'number') out[key] = z.number().describe(p.description ?? key)
    else if (p.type === 'array') out[key] = z.array(z.unknown()).describe(p.description ?? key)
    else out[key] = z.unknown().describe(p.description ?? key)
  }
  return out
}

function registerOne(
  server: McpServer,
  def: { name: string; description: string; title?: string; parameters?: Record<string, { type: string; description?: string }> },
  run: (args: Record<string, unknown>) => Promise<{ text: string; isError?: boolean }>
): void {
  const inputSchema = zodSchemaFromParams(def.parameters)
  server.registerTool(
    def.name,
    {
      title: def.title ?? def.name,
      description: def.description,
      ...(Object.keys(inputSchema).length > 0 ? { inputSchema } : {}),
    },
    async (args: Record<string, unknown>) => {
      const result = await run(args ?? {})
      return {
        content: [{ type: 'text' as const, text: result.text }],
        ...(result.isError ? { isError: true } : {}),
      }
    }
  )
}

export function registerAllTools(
  server: McpServer,
  context: ToolContext & NarratedStoryToolContext
): void {
  for (const def of TOOL_DEFINITIONS) {
    registerOne(server, def, (args) => runTool(def.name, args, context))
  }
  for (const def of NARRATED_STORY_TOOL_DEFINITIONS) {
    registerOne(server, def, (args) => runNarratedStoryTool(def.name, args, context))
  }
}
