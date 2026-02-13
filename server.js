import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Función para obtener variables de entorno
function getEnvVars() {
  return {
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
}

// Clientes conectados para hot reload
const clients = new Set();

// Configurar hot reload - watch archivos relevantes
const watchPaths = [
  path.join(PUBLIC_DIR, 'js', '**', '*.js'),
  path.join(PUBLIC_DIR, 'css', '**', '*.css'),
  path.join(PUBLIC_DIR, 'data', '**', '*.js'),
  path.join(PUBLIC_DIR, 'index.html')
];

const watcher = chokidar.watch(watchPaths, {
  ignored: /node_modules|\.git/,
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', (filePath) => {
  console.log(`Archivo cambiado: ${filePath}`);
  
  // Reinyectar env si cambió .env
  if (filePath.includes('.env')) {
    dotenv.config({ override: true });
  }
  
  // Notificar a todos los clientes conectados
  clients.forEach(client => {
    try {
      client.write('data: reload\n\n');
    } catch (e) {
      // Cliente desconectado, removerlo
      clients.delete(client);
    }
  });
});

console.log('Hot reload activado. Observando cambios en archivos...');

const server = http.createServer((req, res) => {
  // Endpoint para Server-Sent Events (hot reload)
  if (req.url === '/api/hot-reload' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    
    clients.add(res);
    
    req.on('close', () => {
      clients.delete(res);
    });
    
    return;
  }
  
  // Endpoint para recargar variables de entorno
  if (req.url === '/api/reload-env' && req.method === 'POST') {
    dotenv.config({ override: true });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Chat de Narrated Story (IA) — tools para que el modelo pueda crear NPCs y lugares
  const NARRATED_STORY_OPENAI_TOOLS = [
    { type: 'function', function: { name: 'narrated_story_update_character', description: 'Update a character: location, activity, state, stats, corruption (0-100), loveRegent (0-100), lust (0-100), sexCount, developedKinks, feelingsToward.', parameters: { type: 'object', properties: { characterId: { type: 'string', description: 'Character id' }, patch: { type: 'object', description: 'Fields to update' } }, required: ['characterId', 'patch'] } } },
    { type: 'function', function: { name: 'narrated_story_update_characters', description: 'Update multiple characters at once.', parameters: { type: 'object', properties: { updates: { type: 'array', description: 'List of { characterId, patch }' } }, required: ['updates'] } } },
    { type: 'function', function: { name: 'narrated_story_update_place', description: 'Update an existing place.', parameters: { type: 'object', properties: { placeId: { type: 'string' }, patch: { type: 'object' } }, required: ['placeId', 'patch'] } } },
    { type: 'function', function: { name: 'narrated_story_create_character', description: 'Register a new NPC when they become relevant (e.g. Kaelen, Lord Silas, Lysandra). Required: id (slug), name, role "npc".', parameters: { type: 'object', properties: { character: { type: 'object', description: 'id, name, role ("npc"), description, class, race, currentPlaceId, currentActivity, currentState, corruption (0-100), loveRegent (0-100), lust (0-100), sexCount, developedKinks, feelingsToward (object)' } }, required: ['character'] } } },
    { type: 'function', function: { name: 'narrated_story_create_place', description: 'Add a new place when the story mentions it.', parameters: { type: 'object', properties: { placeId: { type: 'string' }, name: { type: 'string' }, description: { type: 'string' } }, required: ['placeId', 'name'] } } },
  ];

  if (req.url === '/api/narrated-story/chat' && req.method === 'POST') {
    if (typeof fetch !== 'function') {
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Server needs Node 18+ (fetch). Current: ' + process.version }));
      return;
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const sendJson = (status, data) => {
        if (res.headersSent) return;
        res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(data));
      };
      let payload;
      try {
        payload = JSON.parse(body || '{}');
      } catch (e) {
        sendJson(400, { error: 'Invalid JSON' });
        return;
      }
      const { systemPrompt, messages } = payload;
      if (!systemPrompt || !Array.isArray(messages)) {
        sendJson(400, { error: 'Missing systemPrompt or messages' });
        return;
      }
      let env, service, apiMessages;
      try {
        env = getEnvVars();
        service = env.DEFAULT_AI_SERVICE || 'openai';
        apiMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content || '' }))
        ];
      } catch (e) {
        console.error('Narrated story chat setup error:', e);
        sendJson(500, { error: e.message || 'Server setup failed' });
        return;
      }

      function checkResponse(r, serviceName) {
        if (r.ok) return r.json();
        return r.text().then(txt => {
          let msg = serviceName + ' API ' + r.status;
          try {
            const j = JSON.parse(txt);
            if (j.error && j.error.message) msg += ': ' + j.error.message;
            else if (j.error && typeof j.error === 'string') msg += ': ' + j.error;
            else if (txt) msg += ': ' + txt.slice(0, 200);
          } catch (_) {
            if (txt) msg += ': ' + txt.slice(0, 200);
          }
          throw new Error(msg);
        });
      }

      const callOpenAI = () => {
        if (!env.OPENAI_API_KEY) return Promise.reject(new Error('OPENAI_API_KEY not set. Add it to .env'));
        return fetch(`${env.OPENAI_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: env.OPENAI_MODEL || 'gpt-4',
            messages: apiMessages,
            temperature: 0.8,
            max_tokens: 2048,
            tools: NARRATED_STORY_OPENAI_TOOLS,
            tool_choice: 'auto',
          })
        }).then(r => checkResponse(r, 'OpenAI'));
      };
      const callDeepSeek = () => {
        if (!env.DEEPSEEK_API_KEY) return Promise.reject(new Error('DEEPSEEK_API_KEY not set. Add it to .env'));
        return fetch(`${env.DEEPSEEK_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: env.DEEPSEEK_MODEL || 'deepseek-chat',
            messages: apiMessages,
            temperature: 0.8,
            max_tokens: 2048,
            tools: NARRATED_STORY_OPENAI_TOOLS,
            tool_choice: 'auto',
          })
        }).then(r => checkResponse(r, 'DeepSeek'));
      };
      const callGrok = () => {
        if (!env.GROK_API_KEY) return Promise.reject(new Error('GROK_API_KEY not set. Add it to .env'));
        return fetch(`${env.GROK_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.GROK_API_KEY}`
          },
          body: JSON.stringify({
            model: env.GROK_MODEL || 'grok-beta',
            messages: apiMessages,
            temperature: 0.8,
            max_tokens: 2048,
            tools: NARRATED_STORY_OPENAI_TOOLS,
            tool_choice: 'auto',
          })
        }).then(r => checkResponse(r, 'Grok'));
      };
      const callOllama = () => {
        const base = env.OLLAMA_BASE_URL || 'http://localhost:11434';
        return fetch(`${base}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: env.OLLAMA_MODEL || 'llama2',
            messages: apiMessages,
            options: { temperature: 0.8, num_predict: 2048 }
          })
        }).then(r => checkResponse(r, 'Ollama'));
      };

      const parseResponse = (data, isOllama) => {
        const rawContent = isOllama
          ? (data.message && data.message.content ? data.message.content : '')
          : (data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '');
        let toolCalls;
        if (!isOllama && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.tool_calls) {
          toolCalls = data.choices[0].message.tool_calls.map(tc => {
            const fn = tc.function || {};
            let args = {};
            try {
              args = typeof fn.arguments === 'string' ? JSON.parse(fn.arguments) : (fn.arguments || {});
            } catch (_) {}
            return { name: fn.name || tc.name || '', args };
          });
        }
        return { rawContent: rawContent || '', toolCalls };
      };

      const handlers = {
        openai: callOpenAI,
        deepseek: callDeepSeek,
        grok: callGrok,
        ollama: callOllama
      };
      const fn = handlers[service];
      if (!fn) {
        sendJson(400, { error: 'Unsupported service: ' + service });
        return;
      }
      fn()
        .then(data => {
          const isOllama = service === 'ollama';
          const out = parseResponse(data, isOllama);
          sendJson(200, out);
        })
        .catch(err => {
          console.error('Narrated story chat error:', err);
          sendJson(500, { error: err.message || 'AI request failed' });
        });
    });
    return;
  }

  // Determinar ruta del archivo
  let filePath;
  // Manejar rutas de la aplicación (SPA routing)
  // Si es una ruta de la app (/generals/, /kingdoms/ o /province/), servir index.html
  if (req.url.startsWith('/generals/') || req.url.startsWith('/kingdoms/') || req.url.startsWith('/province/')) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  } else {
    filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  }
  
  // Prevenir directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Obtener extensión del archivo
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Leer archivo
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Archivo no encontrado
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Archivo no encontrado</h1>', 'utf-8');
      } else {
        // Error del servidor
        res.writeHead(500);
        res.end(`Error del servidor: ${error.code}`, 'utf-8');
      }
    } else {
      let finalContent = content;
      
      // Si es index.html, inyectar variables de entorno
      if (filePath.endsWith('index.html')) {
        const envVars = getEnvVars();
        const htmlContent = content.toString();
        
        // Reemplazar el objeto window.__ENV__ con las variables reales del .env
        // Usar el mismo indentado que tiene el HTML (12 espacios)
        const envJson = JSON.stringify(envVars, null, 12);
        const envReplacement = `window.__ENV__ = ${envJson};`;
        finalContent = htmlContent.replace(
          /window\.__ENV__ = \{[\s\S]*?\};/,
          envReplacement
        );
      }
      
      // Archivo encontrado - agregar headers de no-cache
      const headers = {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // Para archivos JS, CSS y HTML, agregar timestamp para forzar recarga
      if (['.js', '.css', '.html'].includes(extname)) {
        headers['Last-Modified'] = new Date().toUTCString();
        headers['ETag'] = `"${Date.now()}"`;
      }
      
      res.writeHead(200, headers);
      res.end(finalContent, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Presiona Ctrl+C para detener el servidor`);
});
