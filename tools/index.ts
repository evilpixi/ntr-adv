/**
 * Tools stateless para NTR Adventure.
 * - definitions: lista de tools y formato OpenAI.
 * - runTool / runTools: ejecutar una o varias tools con un contexto I/O.
 * - context: interfaz ToolContext que debe implementar quien llame (MCP server, app, backend).
 */
export type { ToolContext, AppInfo, ToolMeta } from './context.js'
export {
  TOOL_DEFINITIONS,
  getOpenAIToolsFormat,
  getToolDefinition,
} from './definitions.js'
export type { ToolDefinition, ToolParameter } from './definitions.js'
export { runTool, runTools } from './run.js'
export type { ToolResult } from './run.js'
