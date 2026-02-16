/**
 * Directorio de datos del servidor MCP: por defecto ./mcp-data respecto al cwd
 * o NTR_MCP_DATA. Las apps (p. ej. Narrated Story) pueden exportar aquí y la IA
 * puede leer/escribir con las tools.
 */
import { join } from 'node:path'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.NTR_MCP_DATA ?? join(process.cwd(), 'mcp-data')

export function getDataDir(...segments: string[]): string {
  return join(BASE, ...segments)
}

export async function ensureDir(...segments: string[]): Promise<void> {
  const dir = getDataDir(...segments)
  await mkdir(dir, { recursive: true })
}

export async function readJsonFile(filePath: string): Promise<unknown | undefined> {
  const fs = await import('node:fs/promises')
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as unknown
  } catch {
    return undefined
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const fs = await import('node:fs/promises')
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}
