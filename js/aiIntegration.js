import { ENV } from './env.js';
import { getAIConfig, getPromptTemplate } from './config.js';

/**
 * Carga la configuración de variables de entorno
 */
export function loadEnvConfig() {
    return ENV;
}

/**
 * Genera una historia usando un servicio de IA
 * @param {GameState} gameState - Estado del juego
 * @param {Array} events - Eventos del turno
 * @param {string} service - Servicio a usar (opcional, usa el por defecto si no se especifica)
 * @returns {Promise<string>} - Historia generada
 */
export async function generateStory(gameState, events, service = null) {
    const env = loadEnvConfig();
    const serviceToUse = service || env.DEFAULT_AI_SERVICE || 'openai';
    
    // Construir el prompt
    const gameStateText = formatGameState(gameState);
    const eventsText = formatEvents(events);
    
    const promptTemplate = getPromptTemplate();
    const prompt = String(promptTemplate)
        .replace('{gameState}', gameStateText)
        .replace('{events}', eventsText);
    
    // Intentar generar con el servicio especificado
    try {
        return await callAIService(serviceToUse, prompt, env);
    } catch (error) {
        console.warn(`Error con servicio ${serviceToUse}:`, error);
        
        // Intentar con servicios alternativos
        const fallbackServices = ['openai', 'deepseek', 'grok', 'ollama'].filter(s => s !== serviceToUse);
        
        for (const fallbackService of fallbackServices) {
            try {
                console.log(`Intentando con servicio alternativo: ${fallbackService}`);
                return await callAIService(fallbackService, prompt, env);
            } catch (fallbackError) {
                console.warn(`Error con servicio ${fallbackService}:`, fallbackError);
                continue;
            }
        }
        
        // Si todos fallan, retornar historia por defecto
        return generateDefaultStory(events);
    }
}

/**
 * Llama a un servicio de IA específico
 */
async function callAIService(service, prompt, env) {
    const aiConfig = getAIConfig();
    const config = aiConfig.services[service];
    if (!config) {
        throw new Error(`Servicio ${service} no configurado`);
    }
    
    switch (service) {
        case 'openai':
            return await callOpenAI(prompt, env, config);
        case 'deepseek':
            return await callDeepSeek(prompt, env, config);
        case 'grok':
            return await callGrok(prompt, env, config);
        case 'ollama':
            return await callOllama(prompt, env, config);
        default:
            throw new Error(`Servicio ${service} no soportado`);
    }
}

/**
 * Llama a la API de OpenAI
 */
async function callOpenAI(prompt, env, config) {
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY no configurada');
    }
    
    const response = await fetch(`${config.baseUrl}${config.endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: env.OPENAI_MODEL || config.model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: aiConfig.temperature,
            max_tokens: aiConfig.maxTokens
        })
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

/**
 * Llama a la API de DeepSeek
 */
async function callDeepSeek(prompt, env, config) {
    const apiKey = env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY no configurada');
    }
    
    const response = await fetch(`${config.baseUrl}${config.endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: env.DEEPSEEK_MODEL || config.model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: aiConfig.temperature,
            max_tokens: aiConfig.maxTokens
        })
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(`DeepSeek API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

/**
 * Llama a la API de Grok (xAI)
 */
async function callGrok(prompt, env, config) {
    const apiKey = env.GROK_API_KEY;
    if (!apiKey) {
        throw new Error('GROK_API_KEY no configurada');
    }
    
    const response = await fetch(`${config.baseUrl}${config.endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: env.GROK_MODEL || config.model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: aiConfig.temperature,
            max_tokens: aiConfig.maxTokens
        })
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(`Grok API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

/**
 * Llama a Ollama (modelo local)
 */
async function callOllama(prompt, env, config) {
    const baseUrl = env.OLLAMA_BASE_URL || config.baseUrl;
    const model = env.OLLAMA_MODEL || config.model;
    
    const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            options: {
                temperature: aiConfig.temperature,
                num_predict: aiConfig.maxTokens
            }
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${error}`);
    }
    
    const data = await response.json();
    return data.message.content.trim();
}

/**
 * Formatea el estado del juego para el prompt
 */
function formatGameState(gameState) {
    const kingdoms = [];
    
    for (const kingdom of gameState.kingdoms.values()) {
        const generals = kingdom.generals.map(g => ({
            name: g.name,
            hp: g.hp,
            maxHp: g.maxHp,
            love: g.love,
            strength: g.strength,
            status: g.status,
            location: g.location
        }));
        
        const provinces = kingdom.provinces.map(p => ({
            name: p.name,
            hp: p.hp,
            maxHp: p.maxHp,
            isCapital: p.isCapital
        }));
        
        kingdoms.push({
            name: kingdom.name,
            owner: kingdom.owner,
            generals: generals,
            provinces: provinces
        });
    }
    
    return JSON.stringify({
        turn: gameState.turn,
        kingdoms: kingdoms
    }, null, 2);
}

/**
 * Formatea los eventos para el prompt
 */
function formatEvents(events) {
    if (!events || events.length === 0) {
        return 'No hay eventos significativos en este turno.';
    }
    
    return events.map(event => {
        switch (event.type) {
            case 'combat':
                return `Combate: ${event.attacker} vs ${event.defender}. Ganador: ${event.winner}`;
            case 'capture':
                return `Captura: ${event.general} fue capturada por ${event.captor}`;
            case 'province_damage':
                return `Provincia ${event.province} recibió daño${event.destroyed ? ' y fue conquistada' : ''}`;
            case 'province_conquered':
                return `Provincia ${event.province} fue conquistada por ${event.newOwner}`;
            case 'rest':
                return `${event.general} descansó y recuperó ${event.hpRecovered} HP`;
            case 'date':
                return `${event.general} tuvo una cita y su amor aumentó a ${event.newLove}`;
            case 'train':
                return `${event.general} entrenó y su fuerza aumentó a ${event.newStrength}`;
            default:
                return JSON.stringify(event);
        }
    }).join('\n');
}

/**
 * Genera una historia por defecto si todos los servicios fallan
 */
function generateDefaultStory(events) {
    if (!events || events.length === 0) {
        return 'El reino permanece en calma. Las generales se preparan para los próximos desafíos.';
    }
    
    const eventDescriptions = events.map(e => {
        switch (e.type) {
            case 'combat':
                return `Una batalla épica tuvo lugar entre las generales.`;
            case 'capture':
                return `Una general fue capturada en combate.`;
            case 'province_conquered':
                return `Una provincia cambió de manos.`;
            default:
                return `Eventos importantes ocurrieron en el reino.`;
        }
    }).join(' ');
    
    return `En este turno, ${eventDescriptions} El destino de los reinos se balancea en la balanza del poder.`;
}
