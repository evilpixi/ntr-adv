/**
 * Tools de la app Narrated Story: definiciones, contexto, ejecutor y contexto navegador.
 */
export type { NarratedStoryToolContext } from './context'
export {
  NARRATED_STORY_TOOL_DEFINITIONS,
  getNarratedStoryToolDefinition,
  type NarrativeToolDefinition,
} from './definitions'
export {
  runNarratedStoryTool,
  runNarratedStoryTools,
  type ToolResult,
} from './run'
export { createNarratedStoryBrowserContext } from './browserContext'
