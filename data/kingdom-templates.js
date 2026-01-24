// Templates para facilitar la creación de nuevos reinos
// Usa estos templates como base para crear reinos personalizados

export const kingdomTemplates = {
    hielo: {
        theme: 'hielo',
        color: '#4a9eff',
        description: 'Reino del hielo eterno',
        generalNames: ['Frost', 'Ice', 'Blizzard', 'Aurora', 'Crystal', 'Glacier', 'Winter'],
        provinceNames: ['Fortaleza de Hielo', 'Tundra Helada', 'Glaciar Eterno', 'Torre de Cristal', 'Valle Congelado']
    },
    fuego: {
        theme: 'fuego',
        color: '#ff4a4a',
        description: 'Reino volcánico del fuego',
        generalNames: ['Ember', 'Blaze', 'Inferno', 'Flame', 'Scorch', 'Magma', 'Pyre'],
        provinceNames: ['Ciudad Volcánica', 'Llanura Ardiente', 'Forja Infernal', 'Cráter de Lava', 'Montaña de Fuego']
    },
    tormenta: {
        theme: 'tormenta',
        color: '#9b59b6',
        description: 'Reino de las tormentas eternas',
        generalNames: ['Storm', 'Thunder', 'Lightning', 'Gale', 'Tempest', 'Cyclone', 'Hurricane'],
        provinceNames: ['Torre de la Tormenta', 'Tierras del Relámpago', 'Acantilados del Viento', 'Plains of Thunder', 'Storm Keep']
    },
    sombra: {
        theme: 'sombra',
        color: '#2c3e50',
        description: 'Reino de las sombras profundas',
        generalNames: ['Shadow', 'Night', 'Dark', 'Umbra', 'Eclipse', 'Dusk', 'Twilight'],
        provinceNames: ['Ciudadela de las Sombras', 'Bosque Oscuro', 'Torre de la Penumbra', 'Valle de la Noche', 'Fortaleza Negra']
    },
    real: {
        theme: 'real',
        color: '#ffd700',
        description: 'Reino real y noble',
        generalNames: ['Aria', 'Luna', 'Sakura', 'Maya', 'Zara', 'Elena', 'Victoria'],
        provinceNames: ['Capital Real', 'Provincia del Norte', 'Provincia del Sur', 'Provincia del Este', 'Provincia del Oeste']
    },
    tierra: {
        theme: 'tierra',
        color: '#8b4513',
        description: 'Reino de la tierra y las montañas',
        generalNames: ['Terra', 'Stone', 'Rock', 'Mountain', 'Earth', 'Clay', 'Granite'],
        provinceNames: ['Fortaleza Montañosa', 'Valle de Piedra', 'Meseta Alta', 'Cañón Profundo', 'Minas Antiguas']
    },
    agua: {
        theme: 'agua',
        color: '#1e90ff',
        description: 'Reino de los mares y océanos',
        generalNames: ['Aqua', 'Wave', 'Tide', 'Coral', 'Pearl', 'Marina', 'Ocean'],
        provinceNames: ['Puerto Principal', 'Isla de Coral', 'Ciudad Flotante', 'Bahía Escondida', 'Archipiélago']
    },
    naturaleza: {
        theme: 'naturaleza',
        color: '#228b22',
        description: 'Reino de los bosques y la naturaleza',
        generalNames: ['Flora', 'Leaf', 'Bloom', 'Ivy', 'Rose', 'Lily', 'Willow'],
        provinceNames: ['Bosque Sagrado', 'Claro del Bosque', 'Aldea de los Árboles', 'Jardín Eterno', 'Selva Profunda']
    }
};

/**
 * Genera un reino usando un template
 * @param {string} templateName - Nombre del template a usar
 * @param {string} kingdomId - ID único para el reino
 * @param {string} kingdomName - Nombre del reino
 * @param {number} numProvinces - Número de provincias
 * @param {number} numGenerals - Número de generales
 * @returns {Object} - Objeto de reino generado
 */
export function generateKingdomFromTemplate(templateName, kingdomId, kingdomName, numProvinces, numGenerals) {
    const template = kingdomTemplates[templateName];
    if (!template) {
        throw new Error(`Template "${templateName}" no encontrado`);
    }

    const kingdom = {
        id: kingdomId,
        name: kingdomName,
        theme: template.theme,
        description: template.description,
        color: template.color,
        owner: 'ai',
        provinces: numProvinces,
        imageUrl: null
    };

    // Generar generales
    const generals = [];
    for (let i = 0; i < numGenerals && i < template.generalNames.length; i++) {
        generals.push({
            id: `${kingdomId}_gen${i + 1}`,
            name: template.generalNames[i],
            kingdom: kingdomId,
            description: `General del reino ${kingdomName}`,
            hp: 100,
            maxHp: 100,
            love: 50,
            strength: 8 + Math.floor(Math.random() * 4),
            imageUrl: null
        });
    }

    // Generar provincias
    const provinces = [];
    for (let i = 0; i < numProvinces && i < template.provinceNames.length; i++) {
        provinces.push({
            name: template.provinceNames[i],
            imageUrl: null
        });
    }

    return {
        kingdom,
        generals,
        provinces: provinces.reduce((acc, p, idx) => {
            if (!acc[kingdomId]) acc[kingdomId] = [];
            acc[kingdomId].push(p);
            return acc;
        }, {})
    };
}
