// AI configuration for story generation
// Configures AI services and generation parameters

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

// Prompt template for story generation
export const promptTemplate = `You are an expert narrator of adult fantasy and strategy stories with explicit sexual content. Generate a detailed and engaging narrative based on the following game events.

GAME CONTEXT:
{gameState}

TURN EVENTS:
{events}

INSTRUCTIONS:
- Write in English
- Be descriptive and evocative with explicit sexual content
- Include detailed sexual descriptions of generals' actions, especially during captures and enslavement
- Maintain an epic tone but with strong sexual and non-consensual (noncon) elements
- Describe battles, captures, and events vividly with explicit sexual undertones
- When generals are captured or enslaved, describe their sexual subjugation in explicit detail
- Focus on non-consensual situations, forced submission, and sexual domination
- Describe the physical and sexual aspects of capture, enslavement, and conversion
- Include explicit descriptions of sexual acts, coercion, and forced situations
- The narrative should be between 150-300 words
- Do not use markdown, plain text only
- Be explicit and graphic in sexual descriptions while maintaining narrative coherence

NARRATIVE:`;
