// Configuración de IA para generación de historia
// Configura los servicios de IA y parámetros de generación

export const aiConfig = {
    defaultService: 'openai',
    services: {
        openai: {
            model: 'gpt-4',
            baseUrl: 'https://api.openai.com/v1',
            endpoint: '/chat/completions'
        },
        deepseek: {
            model: 'deepseek-chat',
            baseUrl: 'https://api.deepseek.com/v1',
            endpoint: '/chat/completions'
        },
        grok: {
            model: 'grok-beta',
            baseUrl: 'https://api.x.ai/v1',
            endpoint: '/chat/completions'
        },
        ollama: {
            model: 'llama2',
            baseUrl: 'http://localhost:11434',
            endpoint: '/api/generate'
        }
    },
    temperature: 0.8,
    maxTokens: 500
};

// Plantilla de prompt para generación de historia
export const promptTemplate = `Eres un narrador experto de historias de fantasía y estrategia. Genera una narrativa detallada y envolvente basada en los siguientes eventos del juego.

CONTEXTO DEL JUEGO:
{gameState}

EVENTOS DEL TURNO:
{events}

INSTRUCCIONES:
- Escribe en español
- Sé descriptivo y evocador
- Incluye detalles sobre las acciones de las generales
- Mantén un tono épico pero con elementos adultos
- Describe las batallas, capturas y eventos de forma vívida
- Si hay generales capturadas o esclavizadas, describe su situación
- La narrativa debe tener entre 150-300 palabras
- No uses markdown, solo texto plano

NARRATIVA:`;
