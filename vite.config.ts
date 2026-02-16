import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname)
const envPath = path.join(projectRoot, '.env')

const envFileExists = fs.existsSync(envPath)
console.log('[Vite .env] projectRoot=', projectRoot, '| .env exists=', envFileExists)

const dotenvResult = dotenv.config({ path: envPath })
console.log('[Vite .env] dotenv.config result:', dotenvResult.error ? `error: ${dotenvResult.error.message}` : 'loaded', '| DEEPSEEK_API_KEY in process.env=', !!(process.env.DEEPSEEK_API_KEY))

export default defineConfig(({ mode }) => {
  const fromVite = loadEnv(mode, projectRoot, '')
  // process.env tiene lo cargado por dotenv; que gane si fromVite viene vacío
  const env = { ...fromVite, ...process.env } as Record<string, string>

  const envFallback = {
    openaiApiKey: (env.OPENAI_API_KEY || '').trim(),
    openaiBaseUrl: (env.OPENAI_BASE_URL || '').trim(),
    openaiModel: (env.OPENAI_MODEL || '').trim(),
    deepseekApiKey: (env.DEEPSEEK_API_KEY || '').trim(),
    deepseekBaseUrl: (env.DEEPSEEK_BASE_URL || '').trim(),
    deepseekModel: (env.DEEPSEEK_MODEL || '').trim(),
    grokApiKey: (env.GROK_API_KEY || '').trim(),
    grokBaseUrl: (env.GROK_BASE_URL || '').trim(),
    grokModel: (env.GROK_MODEL || '').trim(),
    ollamaBaseUrl: (env.OLLAMA_BASE_URL || '').trim(),
    ollamaModel: (env.OLLAMA_MODEL || '').trim(),
    defaultService: (env.DEFAULT_AI_SERVICE || 'openai').toLowerCase().trim(),
  }

  console.log('[Vite .env] __ENV_FALLBACK__ summary: deepseekApiKey length=', envFallback.deepseekApiKey.length, '| defaultService=', envFallback.defaultService, '| openaiApiKey length=', envFallback.openaiApiKey.length)

  const buildForElectron = process.env.BUILD_ELECTRON === '1'
  // GitHub Pages sirve en /<repo-name>/; en CI se setea VITE_BASE (ej. '/ntr-adv/')
  const base = buildForElectron ? './' : (process.env.VITE_BASE || '/')

  // Copiar images/ de la raíz al dist (las imágenes están en repo en images/, no en public/)
  const copyRootImages = {
    name: 'copy-root-images',
    closeBundle() {
      const src = path.join(projectRoot, 'images')
      const outDir = path.join(projectRoot, 'dist', 'images')
      if (!fs.existsSync(src)) return
      const copy = (from: string, to: string) => {
        if (!fs.existsSync(from)) return
        fs.mkdirSync(path.dirname(to), { recursive: true })
        fs.cpSync(from, to, { recursive: true })
      }
      const dirs = fs.readdirSync(src, { withFileTypes: true })
      for (const d of dirs) {
        if (d.isDirectory()) copy(path.join(src, d.name), path.join(outDir, d.name))
      }
    },
  }

  return {
    base,
    plugins: [react(), copyRootImages],
    define: {
      __ENV_FALLBACK__: JSON.stringify(envFallback),
      __BASE_URL__: JSON.stringify(base),
    },
    server: {
      // Dev: single Vite server. Narrated Story uses client-side AI (aiProviderApi) only.
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        tools: path.resolve(__dirname, 'tools'),
        'node:async_hooks': path.resolve(__dirname, 'src/stub/async_hooks.ts'),
      },
      dedupe: ['react', 'react-dom'],
    },
    build: {
      outDir: 'dist',
    },
  }
})
