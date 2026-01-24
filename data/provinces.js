// Configuración de Provincias
// Se generan automáticamente basadas en KINGDOMS, pero puedes personalizar nombres
// Cada provincia puede tener una imageUrl opcional

export const provinceNames = {
    player: [
        { name: 'Capital Real de Adeh', imageUrl: null },
        { name: 'Provincia del Norte', imageUrl: null },
        { name: 'Provincia del Sur', imageUrl: null },
        { name: 'Provincia del Este', imageUrl: null },
        { name: 'Provincia del Oeste', imageUrl: null },
        { name: 'Provincia Central', imageUrl: null },
        { name: 'Provincia de la Frontera', imageUrl: null }
    ],
    kingdom1: [
        { name: 'Fortaleza de Hielo', imageUrl: null },
        { name: 'Tundra Helada', imageUrl: null }
    ],
    kingdom2: [
        { name: 'Ciudad Volcánica', imageUrl: null },
        { name: 'Llanura Ardiente', imageUrl: null }
    ],
    kingdom3: [
        { name: 'Torre de la Tormenta', imageUrl: null },
        { name: 'Tierras del Relámpago', imageUrl: null },
        { name: 'Acantilados del Viento', imageUrl: null }
    ],
    kingdom4: [
        { name: 'Ciudadela de las Sombras', imageUrl: null }
    ]
};

// Helper para obtener solo los nombres (compatibilidad)
export function getProvinceNamesArray(kingdomId) {
    const provinces = provinceNames[kingdomId] || [];
    return provinces.map(p => p.name);
}

// Helper para obtener imagen de una provincia específica
export function getProvinceImage(kingdomId, provinceIndex) {
    const provinces = provinceNames[kingdomId] || [];
    if (provinces[provinceIndex]) {
        return provinces[provinceIndex].imageUrl;
    }
    return null;
}
