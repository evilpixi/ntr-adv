/**
 * Export for Windows: builds the app for Electron (base ./), runs electron-builder,
 * and copies the .exe + README to export/ntr-adv-windows.
 * Includes public folder assets in the build and copies public/ into the export folder.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const outDir = path.join(projectRoot, 'export', 'ntr-adv-windows')

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, cwd: projectRoot, ...opts })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

// 1) Build for Electron (Vite copies public/ into dist/ automatically)
console.log('Building for Electron (base ./)...')
run('npm', ['run', 'build:electron'])

const distDir = path.join(projectRoot, 'dist')
if (!fs.existsSync(distDir)) {
  console.error('Build did not produce dist/.')
  process.exit(1)
}

// 2) Merge public/ on top of dist/ so any PNGs (or other assets) in public are included
const publicDir = path.join(projectRoot, 'public')
if (fs.existsSync(publicDir)) {
  console.log('Merging public/ into dist/ (images, etc.)...')
  copyRecursive(publicDir, distDir)
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name))
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
  }
}

// 3) Build Windows .exe with electron-builder
console.log('Building Windows .exe...')
run('npx', ['electron-builder', '--win'])

const releaseDir = path.join(projectRoot, 'release')
function findExe(dir) {
  if (!fs.existsSync(dir)) return null
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name)
    if (name.isFile() && name.name.endsWith('.exe')) return full
    if (name.isDirectory()) {
      const found = findExe(full)
      if (found) return found
    }
  }
  return null
}
const exePath = findExe(releaseDir)
if (!exePath) {
  console.error('electron-builder did not produce an .exe in release/')
  process.exit(1)
}

// 4) Prepare export folder: .exe + images/folders (public/) + README (EN + ES)
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true })
fs.mkdirSync(outDir, { recursive: true })
const exeName = path.basename(exePath)
fs.copyFileSync(exePath, path.join(outDir, exeName))

// Copy public folder (images, etc.) so the export has all assets and folders
if (fs.existsSync(publicDir)) {
  console.log('Copying public/ (images, folders) into export...')
  copyRecursive(publicDir, outDir)
}

const readmeEn = `NTR Adventure — Windows
========================

Run the application:
  Double-click: ${exeName}

---
API keys (for whoever builds the export): put your keys in the project .env file
(DEEPSEEK_API_KEY, OPENAI_API_KEY, etc.) before running: npm run export:win
They are included in the built application.

To rebuild: add PNG images for generals in public/images/generals/ (e.g. aria.png),
then run: npm run export:win
`

const readmeEs = `NTR Adventure — Windows
========================

Ejecutar la aplicación:
  Doble clic en: ${exeName}

---
Claves API (para quien genera el export): configura las claves en el archivo .env
del proyecto (DEEPSEEK_API_KEY, OPENAI_API_KEY, etc.) antes de ejecutar: npm run export:win
Quedan incluidas en la aplicación generada.

Para reconstruir: añade imágenes PNG de generales en public/images/generals/ (ej. aria.png),
luego ejecuta: npm run export:win
`

const readme = `README — LEEME
=============

ENGLISH
-------
${readmeEn}

ESPAÑOL
-------
${readmeEs}
`
fs.writeFileSync(path.join(outDir, 'README.txt'), readme, 'utf8')
fs.writeFileSync(path.join(outDir, 'LEEME.txt'), readme, 'utf8')

console.log('Done: export/ntr-adv-windows/')
console.log('  -', exeName)
console.log('  - public/ (images, folders)')
console.log('  - README.txt / LEEME.txt (EN + ES)')
process.exit(0)
