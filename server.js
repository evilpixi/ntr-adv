const http = require('http');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
require('dotenv').config();

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

// Inyectar variables de entorno al inicio
function injectEnv() {
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

  const envJs = `// Variables de entorno inyectadas automáticamente
export const ENV = ${JSON.stringify(envVars, null, 2)};
`;

  const envPath = path.join(PUBLIC_DIR, 'js', 'env.js');
  const jsDir = path.dirname(envPath);
  
  if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
  }
  
  fs.writeFileSync(envPath, envJs);
  console.log('Variables de entorno inyectadas en js/env.js');
}

// Inyectar variables al inicio
injectEnv();

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
    require('dotenv').config({ override: true });
    injectEnv();
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
    injectEnv();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }
  // Endpoint para recargar variables de entorno
  if (req.url === '/api/reload-env' && req.method === 'POST') {
    injectEnv();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Manejar rutas de la aplicación (SPA routing)
  // Si es una ruta de la app (/generals/, /kingdoms/ o /province/), servir index.html
  if (req.url.startsWith('/generals/') || req.url.startsWith('/kingdoms/') || req.url.startsWith('/province/')) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  } else {
    // Determinar ruta del archivo
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
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Presiona Ctrl+C para detener el servidor`);
});
