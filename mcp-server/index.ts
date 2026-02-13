#!/usr/bin/env node
/**
 * Servidor MCP para NTR Adventure.
 * Usa las tools stateless del módulo compartido (tools/) y un contexto Node (mcp-data).
 * Para "siguiente turno" en la app, usar runTool/runTools desde tools/ con el contexto que toque.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createNodeContext } from './context-node.js'
import { registerAllTools } from './register-tools.js'

const server = new McpServer({
  name: 'ntr-adv',
  version: '1.0.0',
  instructions: `NTR Adventure MCP: tools por app. Usa ntr_list_apps para ver apps, ntr_list_app_tools para ver tools de una app. Datos en mcp-data/ (o NTR_MCP_DATA).`,
})

const nodeContext = createNodeContext()
registerAllTools(server, nodeContext)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('NTR Adventure MCP server running on stdio')
}

main().catch((err) => {
  console.error('MCP server error:', err)
  process.exit(1)
})
