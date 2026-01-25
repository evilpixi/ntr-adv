import { getAIConfig, getPromptTemplate } from './config.js';

/**
 * Loads environment variables configuration
 * Las variables se inyectan desde .env (desarrollo) o GitHub Secrets (producción)
 * y se exponen en window.__ENV__ en index.html
 */
export function loadEnvConfig() {
    return window.__ENV__ || {
        OPENAI_API_KEY: '',
        OPENAI_MODEL: 'gpt-4',
        OPENAI_BASE_URL: 'https://api.openai.com/v1',
        DEEPSEEK_API_KEY: '',
        DEEPSEEK_MODEL: 'deepseek-chat',
        DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
        GROK_API_KEY: '',
        GROK_MODEL: 'grok-beta',
        GROK_BASE_URL: 'https://api.x.ai/v1',
        OLLAMA_BASE_URL: 'http://localhost:11434',
        OLLAMA_MODEL: 'llama2',
        DEFAULT_AI_SERVICE: 'openai',
        GAME_LANGUAGE: 'es'
    };
}

/**
 * Generates a story using an AI service
 * @param {GameState} gameState - Game state
 * @param {Array} events - Turn events
 * @param {string} service - Service to use (optional, uses default if not specified)
 * @returns {Promise<string>} - Generated story
 */
export async function generateStory(gameState, events, service = null) {
    const env = loadEnvConfig();
    const serviceToUse = service || env.DEFAULT_AI_SERVICE || 'openai';
    
    // Build prompt
    const gameStateText = formatGameState(gameState);
    const eventsText = formatEvents(events);
    
    const promptTemplate = getPromptTemplate();
    const prompt = String(promptTemplate)
        .replace('{gameState}', gameStateText)
        .replace('{events}', eventsText);
    
    // Try to generate with specified service
    try {
        return await callAIService(serviceToUse, prompt, env);
    } catch (error) {
        console.warn(`Error with service ${serviceToUse}:`, error);
        
        // Try with alternative services
        const fallbackServices = ['openai', 'deepseek', 'grok', 'ollama'].filter(s => s !== serviceToUse);
        
        for (const fallbackService of fallbackServices) {
            try {
                console.log(`Trying with alternative service: ${fallbackService}`);
                return await callAIService(fallbackService, prompt, env);
            } catch (fallbackError) {
                console.warn(`Error with service ${fallbackService}:`, fallbackError);
                continue;
            }
        }
        
        // If all fail, return default story
        return generateDefaultStory(events);
    }
}

/**
 * Calls a specific AI service
 */
async function callAIService(service, prompt, env) {
    const aiConfig = getAIConfig();
    const config = aiConfig.services[service];
    if (!config) {
        throw new Error(`Service ${service} not configured`);
    }
    
    switch (service) {
        case 'openai':
            return await callOpenAI(prompt, env, config, aiConfig);
        case 'deepseek':
            return await callDeepSeek(prompt, env, config, aiConfig);
        case 'grok':
            return await callGrok(prompt, env, config, aiConfig);
        case 'ollama':
            return await callOllama(prompt, env, config, aiConfig);
        default:
            throw new Error(`Service ${service} not supported`);
    }
}

/**
 * Calls OpenAI API
 */
async function callOpenAI(prompt, env, config, aiConfig) {
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY not configured');
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
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

/**
 * Calls DeepSeek API
 */
async function callDeepSeek(prompt, env, config, aiConfig) {
    const apiKey = env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY not configured');
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
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`DeepSeek API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

/**
 * Calls Grok (xAI) API
 */
async function callGrok(prompt, env, config, aiConfig) {
    const apiKey = env.GROK_API_KEY;
    if (!apiKey) {
        throw new Error('GROK_API_KEY not configured');
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
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Grok API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

/**
 * Calls Ollama (local model)
 */
async function callOllama(prompt, env, config, aiConfig) {
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
 * Formats game state for prompt
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
 * Formats events for prompt
 */
function formatEvents(events) {
    if (!events || events.length === 0) {
        return 'No significant events in this turn.';
    }
    
    return events.map(event => {
        switch (event.type) {
            case 'combat':
                return `Combate: ${event.attacker} vs ${event.defender}. Ganador: ${event.winner}`;
            case 'capture':
                return `Capture: ${event.general} was captured by ${event.captor}`;
            case 'province_damage':
                return `Province ${event.province} received damage${event.destroyed ? ' and was conquered' : ''}`;
            case 'province_conquered':
                return `Province ${event.province} was conquered by ${event.newOwner}`;
            case 'rest':
                return `${event.general} rested and recovered ${event.hpRecovered} HP`;
            case 'date':
                return `${event.general} had a date and love increased to ${event.newLove}`;
            case 'train':
                return `${event.general} trained and strength increased to ${event.newStrength}`;
            default:
                return JSON.stringify(event);
        }
    }).join('\n');
}

/**
 * Generates a default story if all services fail
 */
function generateDefaultStory(events) {
    if (!events || events.length === 0) {
        return 'The kingdom remains calm. The generals prepare for the challenges ahead.';
    }
    
    const eventDescriptions = events.map(e => {
        switch (e.type) {
            case 'combat':
                return `An epic battle took place between the generals.`;
            case 'capture':
                return `A general was captured in combat.`;
            case 'province_conquered':
                return `A province changed hands.`;
            default:
                return `Important events occurred in the kingdom.`;
        }
    }).join(' ');
    
    return `This turn, ${eventDescriptions} The fate of the kingdoms hangs in the balance of power.`;
}
