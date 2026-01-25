const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PUBLIC_DIR = path.join(__dirname, '..');
const ENV_JS_PATH = path.join(PUBLIC_DIR, 'js', 'env.js');
const JS_DIR = path.dirname(ENV_JS_PATH);

// Asegurar que el directorio js existe
if (!fs.existsSync(JS_DIR)) {
  fs.mkdirSync(JS_DIR, { recursive: true });
}

// Variables de entorno a exponer
const envVars = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  GROK_API_KEY: process.env.GROK_API_KEY || '',
  GROK_MODEL: process.env.GROK_MODEL || 'grok-beta',
  GROK_BASE_URL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama2',
  DEFAULT_AI_SERVICE: process.env.DEFAULT_AI_SERVICE || 'openai',
  GAME_LANGUAGE: process.env.GAME_LANGUAGE || 'es'
};

// Generar archivo env.js
const envJs = `// Variables de entorno inyectadas automáticamente
// Este archivo se genera automáticamente, no editar manualmente
export const ENV = ${JSON.stringify(envVars, null, 2)};
`;

fs.writeFileSync(ENV_JS_PATH, envJs);
console.log(`Variables de entorno inyectadas en ${ENV_JS_PATH}`);
